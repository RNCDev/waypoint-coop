import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/subscriptions - List subscriptions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assetId = searchParams.get('assetId')
    const subscriberId = searchParams.get('subscriberId')
    const managerId = searchParams.get('managerId') // For GP to see subscriptions to their assets
    const startDate = searchParams.get('startDate')
    const status = searchParams.get('status')
    const countOnly = searchParams.get('countOnly') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const whereClause: any = {}
    if (assetId) whereClause.assetId = assetId
    if (subscriberId) whereClause.subscriberId = subscriberId
    if (status) whereClause.status = status
    if (managerId) {
      whereClause.asset = { managerId }
    }
    if (startDate) {
      whereClause.createdAt = { gte: new Date(startDate) }
    }

    if (countOnly) {
      const count = await prisma.subscription.count({
        where: Object.keys(whereClause).length > 0 ? whereClause : {},
      })
      return NextResponse.json({ count })
    }

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
        include: {
          asset: {
            include: {
              manager: true,
            },
          },
          subscriber: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.subscription.count({
        where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      }),
    ])

    return NextResponse.json({
      subscriptions,
      total,
      limit,
      offset,
      hasMore: offset + subscriptions.length < total,
    })
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
