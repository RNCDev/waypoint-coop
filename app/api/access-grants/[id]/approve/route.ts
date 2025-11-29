import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { GrantStatus } from '@prisma/client'

// POST /api/access-grants/[id]/approve - Approve a pending access grant
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { approverId } = body

    // Get the grant
    const grant = await prisma.accessGrant.findUnique({
      where: { id },
      include: {
        asset: {
          select: {
            managerId: true,
          },
        },
      },
    })

    if (!grant) {
      return NextResponse.json(
        { error: 'Access grant not found' },
        { status: 404 }
      )
    }

    if (grant.status !== GrantStatus.PENDING_APPROVAL) {
      return NextResponse.json(
        { error: 'Grant is not pending approval' },
        { status: 400 }
      )
    }

    // Update the grant
    const updatedGrant = await prisma.accessGrant.update({
      where: { id },
      data: {
        status: GrantStatus.ACTIVE,
        approvedBy: approverId,
        approvedAt: new Date(),
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
        action: 'APPROVE',
        entityType: 'AccessGrant',
        entityId: id,
        actorId: approverId,
        organizationId: grant.asset?.managerId,
        details: {
          grantor: updatedGrant.grantor.name,
          grantee: updatedGrant.grantee.name,
        },
      },
    })

    return NextResponse.json(updatedGrant)
  } catch (error) {
    console.error('Error approving access grant:', error)
    return NextResponse.json(
      { error: 'Failed to approve access grant' },
      { status: 500 }
    )
  }
}

