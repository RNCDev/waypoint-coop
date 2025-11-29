import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateHash } from '@/lib/crypto'
import { canPerformAction } from '@/lib/permissions'

// POST /api/envelopes/[id]/correct - Create a correction to an envelope
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

    // Get the original envelope
    const original = await prisma.envelope.findUnique({
      where: { id },
      include: {
        asset: true,
      },
    })

    if (!original) {
      return NextResponse.json(
        { error: 'Original envelope not found' },
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
    const latestVersion = await prisma.envelope.findFirst({
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

    const correction = await prisma.envelope.create({
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
        entityType: 'Envelope',
        entityId: correction.id,
        organizationId: publisherId,
        details: {
          originalEnvelopeId: original.id,
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

