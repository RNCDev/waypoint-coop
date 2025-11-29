import { NextRequest, NextResponse } from 'next/server'
import { getInMemoryDB, isVercel } from '@/lib/in-memory-db'
import { prisma } from '@/lib/prisma'
import { checkPermission } from '@/lib/api-guard'
import { canApproveSubscriptionRequest, getUserOrganization } from '@/lib/permissions'
import { SubscriptionStatus, Subscription } from '@/types'

export const dynamic = 'force-dynamic'

// Asset Manager (or Delegate with canApproveSubscriptions) approves a subscription request
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check permission - basic subscription update permission
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
      return NextResponse.json({ error: 'User organization not found' }, { status: 400 })
    }

    const timestamp = new Date().toISOString()

    if (isVercel()) {
      const db = getInMemoryDB()
      const subscriptionIndex = db.subscriptions.findIndex(s => s.id === id)
      
      if (subscriptionIndex === -1) {
        return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
      }

      const subscription = db.subscriptions[subscriptionIndex]

      // Verify user can approve this subscription (requires canApproveSubscriptions, not just canManageSubscriptions)
      if (!canApproveSubscriptionRequest(user, subscription as Subscription)) {
        return NextResponse.json(
          { error: 'You do not have permission to approve this subscription request. Requires canApproveSubscriptions right.' },
          { status: 403 }
        )
      }

      // Only allow approving if status is "Pending Asset Manager Approval"
      if (subscription.status !== 'Pending Asset Manager Approval') {
        return NextResponse.json(
          { error: `Cannot approve subscription with status "${subscription.status}". Only pending requests can be approved.` },
          { status: 400 }
        )
      }

      // Update subscription to Active
      const updated = {
        ...subscription,
        status: 'Active' as SubscriptionStatus,
        acceptedAt: timestamp,
      }
      db.subscriptions[subscriptionIndex] = updated

      return NextResponse.json(updated)
    } else {
      const subscription = await prisma.subscription.findUnique({ where: { id } })

      if (!subscription) {
        return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
      }

      // Verify user can approve this subscription (requires canApproveSubscriptions)
      // Convert Prisma subscription to our Subscription type for the check
      const subscriptionForCheck: Subscription = {
        id: subscription.id,
        assetId: subscription.assetId,
        subscriberId: subscription.subscriberId,
        grantedById: subscription.grantedById,
        grantedAt: subscription.grantedAt,
        acceptedAt: subscription.acceptedAt || undefined,
        expiresAt: subscription.expiresAt || undefined,
        status: subscription.status as SubscriptionStatus,
        inviteMessage: subscription.inviteMessage || undefined,
        requestMessage: subscription.requestMessage || undefined,
      }
      
      if (!canApproveSubscriptionRequest(user, subscriptionForCheck)) {
        return NextResponse.json(
          { error: 'You do not have permission to approve this subscription request. Requires canApproveSubscriptions right.' },
          { status: 403 }
        )
      }

      if (subscription.status !== 'Pending Asset Manager Approval') {
        return NextResponse.json(
          { error: `Cannot approve subscription with status "${subscription.status}". Only pending requests can be approved.` },
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
    console.error('Error approving subscription request:', error)
    return NextResponse.json({ error: 'Failed to approve subscription request' }, { status: 500 })
  }
}

