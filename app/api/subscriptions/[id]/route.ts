import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PATCH /api/subscriptions/[id] - Update subscription status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { status } = await request.json()

    if (!status || !['ACTIVE', 'PENDING', 'CLOSED'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status (ACTIVE, PENDING, CLOSED) is required' },
        { status: 400 }
      )
    }

    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: {
        asset: {
          include: {
            manager: true,
          },
        },
        subscriber: true,
      },
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    const updated = await prisma.subscription.update({
      where: { id },
      data: { status: status as 'ACTIVE' | 'PENDING' | 'CLOSED' },
      include: {
        asset: {
          include: {
            manager: true,
          },
        },
        subscriber: true,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: status === 'ACTIVE' ? 'APPROVE' : status === 'CLOSED' ? 'REVOKE' : 'UPDATE',
        entityType: 'Subscription',
        entityId: updated.id,
        organizationId: subscription.asset.managerId,
        details: {
          previousStatus: subscription.status,
          newStatus: status,
          asset: subscription.asset.name,
          subscriber: subscription.subscriber.name,
        },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    )
  }
}

// DELETE /api/subscriptions/[id] - Delete subscription
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const subscription = await prisma.subscription.findUnique({
      where: { id },
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    await prisma.subscription.delete({
      where: { id },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entityType: 'Subscription',
        entityId: id,
        organizationId: subscription.subscriberId,
        details: {
          assetId: subscription.assetId,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting subscription:', error)
    return NextResponse.json(
      { error: 'Failed to delete subscription' },
      { status: 500 }
    )
  }
}
