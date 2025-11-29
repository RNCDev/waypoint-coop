import { NextRequest, NextResponse } from 'next/server'
import { getInMemoryDB, isVercel } from '@/lib/in-memory-db'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { checkPermission } from '@/lib/api-guard'
import { getManageableSubscriptions } from '@/lib/permissions'

export const dynamic = 'force-dynamic'

const updateSchema = z.object({
  expiresAt: z.string().optional(),
  status: z.enum(['Active', 'Expired', 'Revoked', 'Pending Asset Manager Approval']).optional(),
})

// Validate subscription status transitions
function isValidStatusTransition(currentStatus: string, newStatus: string): { valid: boolean; error?: string } {
  // Valid transitions:
  // Pending LP Acceptance → Active (via accept endpoint)
  // Pending LP Acceptance → Declined (via decline endpoint)
  // Pending Asset Manager Approval → Active (via approve endpoint)
  // Pending Asset Manager Approval → Declined (via reject endpoint)
  // Active → Revoked (via revoke/delete)
  // Active → Expired (via expiration check or manual update)
  // Revoked → (no transitions, final state)
  // Declined → (no transitions, final state)
  // Expired → (no transitions, final state)

  if (currentStatus === newStatus) {
    return { valid: true }
  }

  const validTransitions: Record<string, string[]> = {
    'Pending LP Acceptance': ['Active', 'Declined'], // Only via accept/decline endpoints
    'Pending Asset Manager Approval': ['Active', 'Declined'], // Only via approve/reject endpoints
    'Active': ['Revoked', 'Expired'],
    'Expired': [], // Final state
    'Revoked': [], // Final state
    'Declined': [], // Final state
  }

  const allowed = validTransitions[currentStatus] || []
  if (!allowed.includes(newStatus)) {
    return {
      valid: false,
      error: `Invalid status transition from "${currentStatus}" to "${newStatus}". Valid transitions: ${allowed.length > 0 ? allowed.join(', ') : 'none (final state)'}`
    }
  }

  return { valid: true }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check permission
    const permissionResult = checkPermission(request, 'subscriptions', 'view', { subscriptionId: id })
    if (!permissionResult.allowed || !permissionResult.user) {
      return NextResponse.json(
        { error: permissionResult.error || 'Access denied' },
        { status: permissionResult.user ? 403 : 401 }
      )
    }

    const user = permissionResult.user

    if (isVercel()) {
      const db = getInMemoryDB()
      const subscription = db.subscriptions.find(s => s.id === id)
      
      if (!subscription) {
        return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
      }

      // Verify user can access this subscription
      const manageable = getManageableSubscriptions(user)
      if (!manageable.some(s => s.id === id)) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }

      return NextResponse.json(subscription)
    } else {
      // Use in-memory DB for non-Vercel as well (Prisma migration not run)
      const db = getInMemoryDB()
      const subscription = db.subscriptions.find(s => s.id === id)
      
      if (!subscription) {
        return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
      }

      // Verify user can access this subscription
      const manageable = getManageableSubscriptions(user)
      if (!manageable.some(s => s.id === id)) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }

      return NextResponse.json(subscription)
    }
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check permission
    const permissionResult = checkPermission(request, 'subscriptions', 'update', { subscriptionId: id })
    if (!permissionResult.allowed || !permissionResult.user) {
      return NextResponse.json(
        { error: permissionResult.error || 'Access denied' },
        { status: permissionResult.user ? 403 : 401 }
      )
    }

    const user = permissionResult.user
    const body = await request.json()
    const validated = updateSchema.parse(body)

    if (isVercel()) {
      const db = getInMemoryDB()
      const subscriptionIndex = db.subscriptions.findIndex(s => s.id === id)
      
      if (subscriptionIndex === -1) {
        return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
      }

      // Verify user can manage this subscription
      const manageable = getManageableSubscriptions(user)
      if (!manageable.some(s => s.id === id)) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }

      const subscription = db.subscriptions[subscriptionIndex]
      
      // Validate status transition if status is being changed
      if (validated.status && validated.status !== subscription.status) {
        const transitionCheck = isValidStatusTransition(subscription.status, validated.status)
        if (!transitionCheck.valid) {
          return NextResponse.json(
            { error: transitionCheck.error },
            { status: 400 }
          )
        }
      }

      const updated = {
        ...subscription,
        ...validated,
      }
      db.subscriptions[subscriptionIndex] = updated

      return NextResponse.json(updated)
    } else {
      // Use in-memory DB for non-Vercel as well (Prisma migration not run)
      const db = getInMemoryDB()
      const subscriptionIndex = db.subscriptions.findIndex(s => s.id === id)
      
      if (subscriptionIndex === -1) {
        return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
      }

      // Verify user can manage this subscription
      const manageable = getManageableSubscriptions(user)
      if (!manageable.some(s => s.id === id)) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }

      const subscription = db.subscriptions[subscriptionIndex]
      
      // Validate status transition if status is being changed
      if (validated.status && validated.status !== subscription.status) {
        const transitionCheck = isValidStatusTransition(subscription.status, validated.status)
        if (!transitionCheck.valid) {
          return NextResponse.json(
            { error: transitionCheck.error },
            { status: 400 }
          )
        }
      }

      const updated = {
        ...subscription,
        ...validated,
      }
      db.subscriptions[subscriptionIndex] = updated

      return NextResponse.json(updated)
    }
  } catch (error) {
    console.error('Error updating subscription:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check permission
    const permissionResult = checkPermission(request, 'subscriptions', 'delete', { subscriptionId: id })
    if (!permissionResult.allowed || !permissionResult.user) {
      return NextResponse.json(
        { error: permissionResult.error || 'Access denied' },
        { status: permissionResult.user ? 403 : 401 }
      )
    }

    const user = permissionResult.user

    if (isVercel()) {
      const db = getInMemoryDB()
      const subscriptionIndex = db.subscriptions.findIndex(s => s.id === id)
      
      if (subscriptionIndex === -1) {
        return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
      }

      // Verify user can manage this subscription
      const manageable = getManageableSubscriptions(user)
      if (!manageable.some(s => s.id === id)) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }

      // Soft delete - set status to Revoked
      db.subscriptions[subscriptionIndex].status = 'Revoked'

      return NextResponse.json({ success: true })
    } else {
      // Use in-memory DB for non-Vercel as well (Prisma migration not run)
      const db = getInMemoryDB()
      const subscriptionIndex = db.subscriptions.findIndex(s => s.id === id)
      
      if (subscriptionIndex === -1) {
        return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
      }

      // Verify user can manage this subscription
      const manageable = getManageableSubscriptions(user)
      if (!manageable.some(s => s.id === id)) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }

      // Soft delete - set status to Revoked
      db.subscriptions[subscriptionIndex].status = 'Revoked'

      return NextResponse.json({ success: true })
    }
  } catch (error) {
    console.error('Error deleting subscription:', error)
    return NextResponse.json({ error: 'Failed to delete subscription' }, { status: 500 })
  }
}

