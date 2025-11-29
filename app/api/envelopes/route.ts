import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateHash } from '@/lib/crypto'
import { canPerformAction } from '@/lib/permissions'

// GET /api/envelopes - List envelopes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assetId = searchParams.get('assetId')
    const publisherId = searchParams.get('publisherId')
    const type = searchParams.get('type')
    const subscriberId = searchParams.get('subscriberId') // For LP ledger view
    const userId = searchParams.get('userId') // For read receipt checking

    let assetIds: string[] = []

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

      assetIds = [
        ...subscriptions.map((s) => s.assetId),
        ...grants.filter((g) => g.assetId).map((g) => g.assetId as string),
      ]
    }

    const envelopes = await prisma.envelope.findMany({
      where: {
        ...(assetId && { assetId }),
        ...(publisherId && { publisherId }),
        ...(type && { type: type as any }),
        ...(subscriberId && assetIds.length > 0 && { assetId: { in: assetIds } }),
      },
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
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit for performance
    })

    return NextResponse.json(envelopes)
  } catch (error) {
    console.error('Error fetching envelopes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch envelopes' },
      { status: 500 }
    )
  }
}

// POST /api/envelopes - Publish a new envelope
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

    const envelope = await prisma.envelope.create({
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
        entityType: 'Envelope',
        entityId: envelope.id,
        organizationId: publisherId,
        details: {
          type,
          asset: envelope.asset.name,
          hash: hash.slice(0, 8),
        },
      },
    })

    return NextResponse.json(envelope, { status: 201 })
  } catch (error) {
    console.error('Error publishing envelope:', error)
    return NextResponse.json(
      { error: 'Failed to publish envelope' },
      { status: 500 }
    )
  }
}

