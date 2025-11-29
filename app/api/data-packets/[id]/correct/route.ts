import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateHash } from '@/lib/crypto'
import { canPerformAction } from '@/lib/permissions'

// POST /api/data-packets/[id]/correct - Create a correction to a data packet
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { payload, publisherId } = body

    if (!payload || !publisherId) {
      return NextResponse.json(
        { error: 'payload and publisherId are required' },
        { status: 400 }
      )
    }

    // Get the original data packet
    const original = await prisma.dataPacket.findUnique({
      where: { id },
      include: {
        asset: true,
      },
    })

    if (!original) {
      return NextResponse.json(
        { error: 'Original data packet not found' },
        { status: 404 }
      )
    }

    // Check if publisher has permission to publish
    const permission = await canPerformAction(publisherId, 'publish', original.assetId)
    if (!permission.allowed) {
      return NextResponse.json(
        { error: `Permission denied: ${permission.reason}` },
        { status: 403 }
      )
    }

    // Find the latest version in this correction chain
    const latestVersion = await prisma.dataPacket.findFirst({
      where: {
        OR: [
          { id: original.id },
          { parentId: original.id },
        ],
      },
      orderBy: { version: 'desc' },
    })

    const newVersion = (latestVersion?.version || 1) + 1
    const hash = generateHash(payload)

    const correction = await prisma.dataPacket.create({
      data: {
        type: original.type,
        payload,
        hash,
        version: newVersion,
        parentId: original.id,
        publisherId,
        assetId: original.assetId,
      },
      include: {
        publisher: true,
        asset: true,
        parent: true,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'CORRECT',
        entityType: 'DataPacket',
        entityId: correction.id,
        organizationId: publisherId,
        details: {
          originalDataPacketId: original.id,
          originalVersion: original.version,
          newVersion,
          hash: hash.slice(0, 8),
        },
      },
    })

    return NextResponse.json(correction, { status: 201 })
  } catch (error) {
    console.error('Error creating correction:', error)
    return NextResponse.json(
      { error: 'Failed to create correction' },
      { status: 500 }
    )
  }
}

