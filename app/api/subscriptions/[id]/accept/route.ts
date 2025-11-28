import { NextRequest, NextResponse } from 'next/server'
import { getInMemoryDB, isVercel } from '@/lib/in-memory-db'
import { prisma } from '@/lib/prisma'
import { checkPermission } from '@/lib/api-guard'
import { getUserOrganization, canManageSubscriptionsForSubscriber } from '@/lib/permissions'

export const dynamic = 'force-dynamic'

// Accept a subscription invitation (LP accepting GP's invitation)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check permission - only subscribers can accept their own subscriptions
    const permissionResult = checkPermission(request, 'subscriptions', 'update', { subscriptionId: id })
    if (!permissionResult.allowed || !permissionResult.user) {
      return NextResponse.json(
        { error: permissionResult.error || 'Access denied' },
        { status: permissionResult.user ? 403 : 401 }
      )
    }

    const user = permissionResult.user
    const org = getUserOrganization(user)
    
    if (!org) {
      return NextResponse.json(
        { error: 'User organization not found' },
        { status: 403 }
      )
    }

    const timestamp = new Date().toISOString()

    if (isVercel()) {
      const db = getInMemoryDB()
      const subscriptionIndex = db.subscriptions.findIndex(s => s.id === id)
      
      if (subscriptionIndex === -1) {
        return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
      }

      const subscription = db.subscriptions[subscriptionIndex]

      // Verify user can manage subscriptions for this subscriber
      // Either: user is the subscriber, or user is a delegate with canManageSubscriptions
      if (!canManageSubscriptionsForSubscriber(user, subscription.subscriberId)) {
        return NextResponse.json(
          { error: 'You do not have permission to accept subscriptions for this subscriber' },
          { status: 403 }
        )
      }

      // Validate status transition: can only accept if status is "Pending LP Acceptance"
      if (subscription.status !== 'Pending LP Acceptance') {
        return NextResponse.json(
          { error: `Cannot accept subscription with status "${subscription.status}". Only pending subscriptions can be accepted.` },
          { status: 400 }
        )
      }

      // Update subscription to Active
      const updated = {
        ...subscription,
        status: 'Active' as const,
        acceptedAt: timestamp,
      }
      db.subscriptions[subscriptionIndex] = updated

      return NextResponse.json(updated)
    } else {
      // Use Prisma for local development
      const subscription = await prisma.subscription.findUnique({
        where: { id },
      })

      if (!subscription) {
        return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
      }

      // Verify user can manage subscriptions for this subscriber
      // Either: user is the subscriber, or user is a delegate with canManageSubscriptions
      if (!canManageSubscriptionsForSubscriber(user, subscription.subscriberId)) {
        return NextResponse.json(
          { error: 'You do not have permission to accept subscriptions for this subscriber' },
          { status: 403 }
        )
      }

      // Validate status transition
      if (subscription.status !== 'Pending LP Acceptance') {
        return NextResponse.json(
          { error: `Cannot accept subscription with status "${subscription.status}". Only pending subscriptions can be accepted.` },
          { status: 400 }
        )
      }

      const updated = await prisma.subscription.update({
        where: { id },
        data: {
          status: 'Active',
          acceptedAt: timestamp,
        },
      })

      return NextResponse.json(updated)
    }
  } catch (error) {
    console.error('Error accepting subscription:', error)
    return NextResponse.json({ error: 'Failed to accept subscription' }, { status: 500 })
  }
}

