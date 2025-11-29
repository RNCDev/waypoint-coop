import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateHash } from '@/lib/crypto'
import { canPerformAction } from '@/lib/permissions'

// GET /api/data-packets - List data packets
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assetId = searchParams.get('assetId')
    const publisherId = searchParams.get('publisherId')
    const managerId = searchParams.get('managerId') // For GP to see data packets for their assets
    const type = searchParams.get('type')
    const subscriberId = searchParams.get('subscriberId') // For LP ledger view
    const userId = searchParams.get('userId') // For read receipt checking
    const startDate = searchParams.get('startDate')
    const countOnly = searchParams.get('countOnly') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc' // 'asc' or 'desc'
    const unreadOnly = searchParams.get('unreadOnly') === 'true' // For LP inbox view

    let assetIds: string[] = []

    // If managerId is provided, get assets managed by that organization
    if (managerId) {
      const managedAssets = await prisma.asset.findMany({
        where: {
          managerId,
        },
        select: { id: true },
      })
      assetIds = managedAssets.map((a) => a.id)
    }

    // If subscriberId is provided, get assets they have access to
    if (subscriberId) {
      const subscriptions = await prisma.subscription.findMany({
        where: {
          subscriberId,
          status: 'ACTIVE',
        },
        select: { assetId: true },
      })

      const grants = await prisma.accessGrant.findMany({
        where: {
          granteeId: subscriberId,
          status: 'ACTIVE',
          canViewData: true,
        },
        select: { assetId: true },
      })

      const subscriberAssetIds = [
        ...subscriptions.map((s) => s.assetId),
        ...grants.filter((g) => g.assetId).map((g) => g.assetId as string),
      ]
      
      // Merge with manager asset IDs if both are present
      if (assetIds.length > 0) {
        assetIds = assetIds.filter((id) => subscriberAssetIds.includes(id))
      } else {
        assetIds = subscriberAssetIds
      }
    }

    const whereClause: any = {}
    if (assetId) whereClause.assetId = assetId
    if (publisherId) whereClause.publisherId = publisherId
    if (type) whereClause.type = type as any
    if ((managerId || subscriberId) && assetIds.length > 0) {
      whereClause.assetId = { in: assetIds }
    }
    if (startDate) {
      whereClause.createdAt = { gte: new Date(startDate) }
    }

    if (countOnly) {
      const count = await prisma.dataPacket.count({ where: whereClause })
      return NextResponse.json({ count })
    }

    // Build orderBy clause
    const orderBy: any = {}
    if (sortBy === 'type') {
      orderBy.type = sortOrder
    } else if (sortBy === 'asset') {
      orderBy.asset = { name: sortOrder }
    } else if (sortBy === 'publisher') {
      orderBy.publisher = { name: sortOrder }
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder
    } else if (sortBy === 'version') {
      orderBy.version = sortOrder
    } else {
      orderBy.createdAt = 'desc' // Default
    }
    
    // Add support for subscriber sorting (by count for now)
    // Note: This is a simplified approach - for better performance with 1M+ records,
    // consider adding a materialized view or denormalized subscriber count field

    // For unread filter (LP inbox), we need to filter out data packets with read receipts
    let finalWhereClause = whereClause
    if (unreadOnly && userId) {
      // Get data packet IDs that have been read by this user
      const readDataPacketIds = await prisma.readReceipt.findMany({
        where: { userId },
        select: { dataPacketId: true },
      })
      const readIds = readDataPacketIds.map(r => r.dataPacketId)
      
      if (readIds.length > 0) {
        finalWhereClause = {
          ...whereClause,
          id: { notIn: readIds },
        }
      }
    }

    // Determine viewer organization ID for permission checking
    const viewerOrgId = managerId || publisherId || subscriberId

    const [dataPackets, total] = await Promise.all([
      prisma.dataPacket.findMany({
        where: Object.keys(finalWhereClause).length > 0 ? finalWhereClause : undefined,
        include: {
          publisher: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          asset: {
            select: {
              id: true,
              name: true,
              type: true,
              managerId: true,
              subscriptions: {
                where: {
                  status: 'ACTIVE',
                },
                select: {
                  subscriber: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
          parent: {
            select: {
              id: true,
              version: true,
            },
          },
          readReceipts: userId
            ? {
                where: {
                  userId,
                },
                select: {
                  id: true,
                  userId: true,
                  readAt: true,
                },
              }
            : false,
          _count: {
            select: {
              readReceipts: true,
            },
          },
        },
        orderBy,
        take: limit,
        skip: offset,
      }),
      prisma.dataPacket.count({ where: Object.keys(finalWhereClause).length > 0 ? finalWhereClause : undefined }),
    ])

    // Filter subscriber data based on permissions
    // Show subscribers to:
    // 1. Asset managers (GPs) - see all subscribers
    // 2. Delegates with canManageSubscriptions or canViewData - see all subscribers
    // 3. Subscribers (LPs) - see only themselves
    if (viewerOrgId) {
      const assetIds = [...new Set(dataPackets.map(e => e.assetId))]
      
      // Check which assets the viewer manages
      const managedAssets = await prisma.asset.findMany({
        where: {
          id: { in: assetIds },
          managerId: viewerOrgId,
        },
        select: { id: true },
      })
      const managerAssetIds = new Set(managedAssets.map(a => a.id))
      
      // Check delegate permissions (canManageSubscriptions or canViewData)
      const delegateGrants = await prisma.accessGrant.findMany({
        where: {
          granteeId: viewerOrgId,
          assetId: { in: assetIds },
          status: 'ACTIVE',
          AND: [
            {
              OR: [
                { expiresAt: null },
                { expiresAt: { gt: new Date() } },
              ],
            },
            {
              OR: [
                { canManageSubscriptions: true },
                { canViewData: true },
              ],
            },
          ],
        },
        select: {
          assetId: true,
        },
      })
      const delegateAssetIds = new Set(delegateGrants.map(g => g.assetId).filter(Boolean) as string[])
      
      // Check which assets the viewer is subscribed to
      const viewerSubscriptions = await prisma.subscription.findMany({
        where: {
          subscriberId: viewerOrgId,
          assetId: { in: assetIds },
          status: 'ACTIVE',
        },
        select: { assetId: true },
      })
      const subscriberAssetIds = new Set(viewerSubscriptions.map(s => s.assetId))
      
      // Filter subscriptions for each data packet
      dataPackets.forEach(dataPacket => {
        const isManager = managerAssetIds.has(dataPacket.assetId)
        const isDelegate = delegateAssetIds.has(dataPacket.assetId)
        const isSubscriber = subscriberAssetIds.has(dataPacket.assetId)
        
        if (isManager || isDelegate) {
          // Manager or delegate sees all subscribers - keep all subscriptions
          // (already included in the query)
        } else if (isSubscriber) {
          // Subscriber sees only themselves - filter to only their subscription
          dataPacket.asset.subscriptions = dataPacket.asset.subscriptions.filter(
            (sub: any) => sub.subscriber?.id === viewerOrgId
          )
        } else {
          // Viewer doesn't have permission to see any subscribers
          dataPacket.asset.subscriptions = []
        }
      })
    } else {
      // No viewer context - don't show subscribers
      dataPackets.forEach(dataPacket => {
        dataPacket.asset.subscriptions = []
      })
    }

    return NextResponse.json({
      dataPackets,
      total,
      limit,
      offset,
      hasMore: offset + dataPackets.length < total,
    })
  } catch (error) {
    console.error('Error fetching data packets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data packets' },
      { status: 500 }
    )
  }
}

// POST /api/data-packets - Publish a new data packet
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, payload, publisherId, assetId } = body

    if (!type || !payload || !publisherId || !assetId) {
      return NextResponse.json(
        { error: 'type, payload, publisherId, and assetId are required' },
        { status: 400 }
      )
    }

    // Check if publisher has permission to publish
    const permission = await canPerformAction(publisherId, 'publish', assetId)
    if (!permission.allowed) {
      return NextResponse.json(
        { error: `Permission denied: ${permission.reason}` },
        { status: 403 }
      )
    }

    // Generate hash
    const hash = generateHash(payload)

    const dataPacket = await prisma.dataPacket.create({
      data: {
        type,
        payload,
        hash,
        publisherId,
        assetId,
        version: 1,
      },
      include: {
        publisher: true,
        asset: true,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'PUBLISH',
        entityType: 'DataPacket',
        entityId: dataPacket.id,
        organizationId: publisherId,
        details: {
          type,
          asset: dataPacket.asset.name,
          hash: hash.slice(0, 8),
        },
      },
    })

    return NextResponse.json(dataPacket, { status: 201 })
  } catch (error) {
    console.error('Error publishing data packet:', error)
    return NextResponse.json(
      { error: 'Failed to publish data packet' },
      { status: 500 }
    )
  }
}

