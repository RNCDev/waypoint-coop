import { NextRequest, NextResponse } from 'next/server'
import { getInMemoryDB, isVercel } from '@/lib/in-memory-db'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Subscription } from '@/types'
import { getCurrentUser, checkPermission } from '@/lib/api-guard'
import { getManageableSubscriptions, getUserOrganization } from '@/lib/permissions'

export const dynamic = 'force-dynamic'

const subscriptionSchema = z.object({
  assetId: z.number(),
  subscriberId: z.number(),
  expiresAt: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    // Check permission
    const permissionResult = checkPermission(request, 'subscriptions', 'view')
    if (!permissionResult.allowed || !permissionResult.user) {
      return NextResponse.json(
        { error: permissionResult.error || 'Access denied' },
        { status: permissionResult.user ? 403 : 401 }
      )
    }

    const user = permissionResult.user
    const org = getUserOrganization(user)
    const searchParams = request.nextUrl.searchParams
    const assetId = searchParams.get('assetId')
    const subscriberId = searchParams.get('subscriberId')

    if (isVercel()) {
      // Get subscriptions the user can manage/view
      let subscriptions = getManageableSubscriptions(user)

      // Apply additional filters
      if (assetId) {
        subscriptions = subscriptions.filter(s => s.assetId === parseInt(assetId))
      }
      if (subscriberId) {
        subscriptions = subscriptions.filter(s => s.subscriberId === parseInt(subscriberId))
      }

      return NextResponse.json(subscriptions)
    } else {
      // Note: Prisma Subscription model requires migration
      // For now, use in-memory data for non-Vercel environments as well
      let subscriptions = getManageableSubscriptions(user)
      
      if (assetId) {
        subscriptions = subscriptions.filter(s => s.assetId === parseInt(assetId))
      }
      if (subscriberId) {
        subscriptions = subscriptions.filter(s => s.subscriberId === parseInt(subscriberId))
      }

      return NextResponse.json(subscriptions)
    }
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check permission to create subscriptions
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
    const validated = subscriptionSchema.parse(body)

    const timestamp = new Date().toISOString()

    if (isVercel()) {
      const db = getInMemoryDB()
      
      // Check if subscription already exists
      const existing = db.subscriptions.find(
        s => s.assetId === validated.assetId && 
             s.subscriberId === validated.subscriberId &&
             s.status === 'Active'
      )
      
      if (existing) {
        return NextResponse.json({ error: 'Active subscription already exists' }, { status: 409 })
      }

      const subscriptionId = `S-${Date.now()}`
      const subscription: Subscription = {
        id: subscriptionId,
        assetId: validated.assetId,
        subscriberId: validated.subscriberId,
        grantedById: org.id,
        grantedAt: timestamp,
        expiresAt: validated.expiresAt,
        status: 'Active',
      }

      db.subscriptions.push(subscription)
      return NextResponse.json(subscription, { status: 201 })
    } else {
      // Note: Prisma Subscription model requires migration
      // For now, use in-memory data for non-Vercel environments as well
      const db = getInMemoryDB()
      
      const existing = db.subscriptions.find(
        s => s.assetId === validated.assetId && 
             s.subscriberId === validated.subscriberId &&
             s.status === 'Active'
      )
      
      if (existing) {
        return NextResponse.json({ error: 'Active subscription already exists' }, { status: 409 })
      }

      const subscriptionId = `S-${Date.now()}`
      const subscription: Subscription = {
        id: subscriptionId,
        assetId: validated.assetId,
        subscriberId: validated.subscriberId,
        grantedById: org.id,
        grantedAt: timestamp,
        expiresAt: validated.expiresAt,
        status: 'Active',
      }

      db.subscriptions.push(subscription)
      return NextResponse.json(subscription, { status: 201 })
    }
  } catch (error) {
    console.error('Error creating subscription:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
  }
}

