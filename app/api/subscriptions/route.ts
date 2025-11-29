import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/subscriptions - List subscriptions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assetId = searchParams.get('assetId')
    const subscriberId = searchParams.get('subscriberId')

    const subscriptions = await prisma.subscription.findMany({
      where: {
        ...(assetId && { assetId }),
        ...(subscriberId && { subscriberId }),
      },
      include: {
        asset: {
          include: {
            manager: true,
          },
        },
        subscriber: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(subscriptions)
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    )
  }
}

// POST /api/subscriptions - Create a new subscription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { assetId, subscriberId, status, accessLevel, commitment } = body

    if (!assetId || !subscriberId) {
      return NextResponse.json(
        { error: 'assetId and subscriberId are required' },
        { status: 400 }
      )
    }

    // Check if subscription already exists
    const existing = await prisma.subscription.findUnique({
      where: {
        assetId_subscriberId: {
          assetId,
          subscriberId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Subscription already exists' },
        { status: 400 }
      )
    }

    const subscription = await prisma.subscription.create({
      data: {
        assetId,
        subscriberId,
        status: status || 'ACTIVE',
        accessLevel: accessLevel || 'FULL',
        commitment,
      },
      include: {
        asset: true,
        subscriber: true,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entityType: 'Subscription',
        entityId: subscription.id,
        organizationId: subscriberId,
        details: { assetId, commitment },
      },
    })

    return NextResponse.json(subscription, { status: 201 })
  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}
