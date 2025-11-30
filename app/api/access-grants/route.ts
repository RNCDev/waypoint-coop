import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requiresGPApproval, validateBulkDelegation } from '@/lib/permissions'

// GET /api/access-grants - List access grants
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const grantorId = searchParams.get('grantorId')
    const granteeId = searchParams.get('granteeId')
    const assetId = searchParams.get('assetId')
    const managerId = searchParams.get('managerId') // For GP to see grants for their assets
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const countOnly = searchParams.get('countOnly') === 'true'

    const whereClause: any = {}
    if (grantorId) whereClause.grantorId = grantorId
    if (granteeId) whereClause.granteeId = granteeId
    if (assetId) {
      // Check both legacy assetId and multi-asset grants
      whereClause.OR = [
        { assetId },
        { grantAssets: { some: { assetId } } },
      ]
    }
    if (managerId) {
      whereClause.OR = [
        { asset: { managerId } },
        { grantAssets: { some: { asset: { managerId } } } },
      ]
    }
    if (status) {
      whereClause.status = status as 'ACTIVE' | 'PENDING_APPROVAL' | 'REVOKED' | 'EXPIRED'
    }
    if (startDate) {
      whereClause.createdAt = { gte: new Date(startDate) }
    }

    if (countOnly) {
      const count = await prisma.accessGrant.count({
        where: Object.keys(whereClause).length > 0 ? whereClause : {},
      })
      return NextResponse.json({ count })
    }

    const grants = await prisma.accessGrant.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      include: {
        grantor: true,
        grantee: true,
        asset: true,
        grantAssets: {
          include: {
            asset: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(grants)
  } catch (error) {
    console.error('Error fetching access grants:', error)
    return NextResponse.json(
      { error: 'Failed to fetch access grants' },
      { status: 500 }
    )
  }
}

// POST /api/access-grants - Create a new access grant (supports bulk assets)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      grantorId,
      granteeId,
      assetId,      // Legacy single-asset (deprecated)
      assetIds,     // New multi-asset support
      canPublish,
      canViewData,
      canManageSubscriptions,
      canApproveDelegations,
      expiresAt,
    } = body

    if (!grantorId || !granteeId) {
      return NextResponse.json(
        { error: 'grantorId and granteeId are required' },
        { status: 400 }
      )
    }

    // Normalize to assetIds array
    const normalizedAssetIds: string[] = assetIds ?? (assetId ? [assetId] : [])

    if (normalizedAssetIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one assetId is required' },
        { status: 400 }
      )
    }

    // Validate that grantor can delegate the requested capabilities
    const requestedCapabilities = {
      canPublish: canPublish ?? false,
      canViewData: canViewData ?? true,
      canManageSubscriptions: canManageSubscriptions ?? false,
      canApproveDelegations: canApproveDelegations ?? false,
    }

    const validation = await validateBulkDelegation(
      grantorId,
      normalizedAssetIds,
      requestedCapabilities
    )

    if (!validation.allowed) {
      return NextResponse.json(
        {
          error: 'Insufficient permissions to delegate requested capabilities',
          details: validation.assetResults,
        },
        { status: 403 }
      )
    }

    // Check GP approval requirement for each asset
    const approvalStatus: Record<string, 'ACTIVE' | 'PENDING_APPROVAL'> = {}
    for (const id of normalizedAssetIds) {
      const needsApproval = await requiresGPApproval(grantorId, id)
      approvalStatus[id] = needsApproval ? 'PENDING_APPROVAL' : 'ACTIVE'
    }

    // If any asset requires approval, the whole grant is pending
    const anyPending = Object.values(approvalStatus).includes('PENDING_APPROVAL')
    const grantStatus = anyPending ? 'PENDING_APPROVAL' : 'ACTIVE'

    // Create the grant with multi-asset support
    const grant = await prisma.accessGrant.create({
      data: {
        grantorId,
        granteeId,
        assetId: null, // Using junction table instead
        status: grantStatus,
        canPublish: requestedCapabilities.canPublish,
        canViewData: requestedCapabilities.canViewData,
        canManageSubscriptions: requestedCapabilities.canManageSubscriptions,
        canApproveDelegations: requestedCapabilities.canApproveDelegations,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        grantAssets: {
          create: normalizedAssetIds.map((id) => ({
            assetId: id,
          })),
        },
      },
      include: {
        grantor: true,
        grantee: true,
        asset: true,
        grantAssets: {
          include: {
            asset: true,
          },
        },
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entityType: 'AccessGrant',
        entityId: grant.id,
        organizationId: grantorId,
        details: {
          grantee: grant.grantee.name,
          status: grantStatus,
          assetCount: normalizedAssetIds.length,
          assets: grant.grantAssets.map((ga) => ga.asset.name),
          capabilities: requestedCapabilities,
        },
      },
    })

    return NextResponse.json(grant, { status: 201 })
  } catch (error) {
    console.error('Error creating access grant:', error)
    return NextResponse.json(
      { error: 'Failed to create access grant' },
      { status: 500 }
    )
  }
}
