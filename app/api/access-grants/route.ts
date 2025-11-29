import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requiresGPApproval } from '@/lib/permissions'
import { GrantStatus } from '@prisma/client'

// GET /api/access-grants - List access grants
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const grantorId = searchParams.get('grantorId')
    const granteeId = searchParams.get('granteeId')
    const assetId = searchParams.get('assetId')
    const status = searchParams.get('status') as GrantStatus | null

    const grants = await prisma.accessGrant.findMany({
      where: {
        ...(grantorId && { grantorId }),
        ...(granteeId && { granteeId }),
        ...(assetId && { assetId }),
        ...(status && { status }),
      },
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
    let status: GrantStatus = GrantStatus.ACTIVE
    if (assetId) {
      const needsApproval = await requiresGPApproval(grantorId, assetId)
      if (needsApproval) {
        status = GrantStatus.PENDING_APPROVAL
      }
    }

    const grant = await prisma.accessGrant.create({
      data: {
        grantorId,
        granteeId,
        assetId,
        status,
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

