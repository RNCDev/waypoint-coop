import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/subscriptions/[id] - Get a single subscription
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
}

// PUT /api/subscriptions/[id] - Update a subscription
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, accessLevel, commitment } = body

    const subscription = await prisma.subscription.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(accessLevel && { accessLevel }),
        ...(commitment !== undefined && { commitment }),
      },
      include: {
        asset: true,
        subscriber: true,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'Subscription',
        entityId: subscription.id,
        organizationId: subscription.subscriberId,
        details: body,
      },
    })

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    )
  }
}

// DELETE /api/subscriptions/[id] - Delete a subscription
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const subscription = await prisma.subscription.findUnique({
      where: { id },
      select: { subscriberId: true },
    })

    await prisma.subscription.delete({
      where: { id },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entityType: 'Subscription',
        entityId: id,
        organizationId: subscription?.subscriberId,
        details: { deleted: true },
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

