import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requiresGPApproval } from '@/lib/permissions'

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
    if (assetId) whereClause.assetId = assetId
    if (managerId) {
      whereClause.asset = { managerId }
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

// POST /api/access-grants - Create a new access grant
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      grantorId,
      granteeId,
      assetId,
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

    // Determine if this grant needs GP approval
    let status: string = 'ACTIVE'
    if (assetId) {
      const needsApproval = await requiresGPApproval(grantorId, assetId)
      if (needsApproval) {
        status = 'PENDING_APPROVAL'
      }
    }

    const grant = await prisma.accessGrant.create({
      data: {
        grantorId,
        granteeId,
        assetId,
        status: status as 'ACTIVE' | 'PENDING_APPROVAL' | 'REVOKED' | 'EXPIRED',
        canPublish: canPublish ?? false,
        canViewData: canViewData ?? true,
        canManageSubscriptions: canManageSubscriptions ?? false,
        canApproveDelegations: canApproveDelegations ?? false,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      include: {
        grantor: true,
        grantee: true,
        asset: true,
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
          status,
          capabilities: {
            canPublish,
            canViewData,
            canManageSubscriptions,
            canApproveDelegations,
          },
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

