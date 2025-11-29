import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/access-grants/[id] - Get a single access grant
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const grant = await prisma.accessGrant.findUnique({
      where: { id },
      include: {
        grantor: true,
        grantee: true,
        asset: {
          include: {
            manager: true,
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

    return NextResponse.json(grant)
  } catch (error) {
    console.error('Error fetching access grant:', error)
    return NextResponse.json(
      { error: 'Failed to fetch access grant' },
      { status: 500 }
    )
  }
}

// PUT /api/access-grants/[id] - Update an access grant
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      status,
      canPublish,
      canViewData,
      canManageSubscriptions,
      canApproveDelegations,
      expiresAt,
    } = body

    const grant = await prisma.accessGrant.update({
      where: { id },
      data: {
        ...(status && { status: status as 'ACTIVE' | 'PENDING_APPROVAL' | 'REVOKED' | 'EXPIRED' }),
        ...(canPublish !== undefined && { canPublish }),
        ...(canViewData !== undefined && { canViewData }),
        ...(canManageSubscriptions !== undefined && { canManageSubscriptions }),
        ...(canApproveDelegations !== undefined && { canApproveDelegations }),
        ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
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
        action: 'UPDATE',
        entityType: 'AccessGrant',
        entityId: grant.id,
        organizationId: grant.grantorId,
        details: body,
      },
    })

    return NextResponse.json(grant)
  } catch (error) {
    console.error('Error updating access grant:', error)
    return NextResponse.json(
      { error: 'Failed to update access grant' },
      { status: 500 }
    )
  }
}

// DELETE /api/access-grants/[id] - Delete (revoke) an access grant
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Instead of deleting, we revoke the grant
    const grant = await prisma.accessGrant.update({
      where: { id },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'REVOKE',
        entityType: 'AccessGrant',
        entityId: id,
        organizationId: grant.grantorId,
        details: { revoked: true },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error revoking access grant:', error)
    return NextResponse.json(
      { error: 'Failed to revoke access grant' },
      { status: 500 }
    )
  }
}

