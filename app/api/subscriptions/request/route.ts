import { NextRequest, NextResponse } from 'next/server'
import { getInMemoryDB, isVercel } from '@/lib/in-memory-db'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Subscription } from '@/types'
import { checkPermission, getCurrentUser } from '@/lib/api-guard'
import { getUserOrganization, canManageSubscriptionsForSubscriber } from '@/lib/permissions'

export const dynamic = 'force-dynamic'

const requestSchema = z.object({
  assetId: z.number(),
  subscriberId: z.number(),
  requestMessage: z.string().optional(),
})

// Subscriber (or delegate) requests a subscription from Asset Owner
export async function POST(request: NextRequest) {
  try {
    // Check permission - subscribers can request subscriptions
    const permissionResult = checkPermission(request, 'subscriptions', 'create')
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

    const body = await request.json()
    const validated = requestSchema.parse(body)

    // Verify user can request subscriptions for this subscriber
    // Either: user is the subscriber, or user is a delegate with canManageSubscriptions
    if (!canManageSubscriptionsForSubscriber(user, validated.subscriberId)) {
      return NextResponse.json(
        { error: 'You do not have permission to request subscriptions for this subscriber' },
        { status: 403 }
      )
    }

    // Get asset to find the asset owner
    let asset
    if (isVercel()) {
      const db = getInMemoryDB()
      asset = db.assets.find(a => a.id === validated.assetId)
    } else {
      asset = await prisma.asset.findUnique({
        where: { id: validated.assetId },
      })
    }

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    const timestamp = new Date().toISOString()

    if (isVercel()) {
      const db = getInMemoryDB()
      
      // Check if subscription already exists (any status except Declined)
      const existing = db.subscriptions.find(
        s => s.assetId === validated.assetId && 
             s.subscriberId === validated.subscriberId &&
             s.status !== 'Declined'
      )
      
      if (existing) {
        return NextResponse.json(
          { error: 'A subscription request or active subscription already exists for this asset' },
          { status: 409 }
        )
      }

      const subscriptionId = `S-${Date.now()}`
      const subscription: Subscription = {
        id: subscriptionId,
        assetId: validated.assetId,
        subscriberId: validated.subscriberId,
        grantedById: asset.ownerId, // Asset Owner who needs to approve
        grantedAt: timestamp,
        status: 'Pending Asset Owner Approval',
        requestMessage: validated.requestMessage,
      }

      db.subscriptions.push(subscription)
      return NextResponse.json(subscription, { status: 201 })
    } else {
      const db = getInMemoryDB()
      
      const existing = db.subscriptions.find(
        s => s.assetId === validated.assetId && 
             s.subscriberId === validated.subscriberId &&
             s.status !== 'Declined'
      )
      
      if (existing) {
        return NextResponse.json(
          { error: 'A subscription request or active subscription already exists for this asset' },
          { status: 409 }
        )
      }

      const subscriptionId = `S-${Date.now()}`
      const subscription: Subscription = {
        id: subscriptionId,
        assetId: validated.assetId,
        subscriberId: validated.subscriberId,
        grantedById: asset.ownerId,
        grantedAt: timestamp,
        status: 'Pending Asset Owner Approval',
        requestMessage: validated.requestMessage,
      }

      db.subscriptions.push(subscription)
      return NextResponse.json(subscription, { status: 201 })
    }
  } catch (error) {
    console.error('Error creating subscription request:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create subscription request' }, { status: 500 })
  }
}

