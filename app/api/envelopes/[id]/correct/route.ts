import { NextRequest, NextResponse } from 'next/server'
import { getInMemoryDB, isVercel } from '@/lib/in-memory-db'
import { prisma } from '@/lib/prisma'
import { generateHash } from '@/lib/crypto'
import { z } from 'zod'
import { checkPermission, getCurrentUser } from '@/lib/api-guard'
import { canAccess, hasSubscriptionForPublishing } from '@/lib/permissions'

export const dynamic = 'force-dynamic'

const correctionSchema = z.object({
  timestamp: z.string(),
  dataType: z.string().optional(),
  period: z.string().optional(),
  payload: z.any(), // Updated payload data
})

// Create a correction (new version) of an existing envelope
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const originalEnvelopeId = parseInt(idParam)
    
    // Check permission to publish envelopes
    const permissionResult = checkPermission(request, 'envelopes', 'publish')
    if (!permissionResult.allowed || !permissionResult.user) {
      return NextResponse.json(
        { error: permissionResult.error || 'Access denied' },
        { status: permissionResult.user ? 403 : 401 }
      )
    }

    const user = permissionResult.user
    const body = await request.json()
    const validated = correctionSchema.parse(body)

    // Fetch the original envelope
    let originalEnvelope
    if (isVercel()) {
      const db = getInMemoryDB()
      originalEnvelope = db.envelopes.find(e => e.id === originalEnvelopeId)
    } else {
      originalEnvelope = await prisma.envelope.findUnique({
        where: { id: originalEnvelopeId },
      })
    }

    if (!originalEnvelope) {
      return NextResponse.json({ error: 'Original envelope not found' }, { status: 404 })
    }

    // Verify user has access to publish for this asset
    if (!canAccess(user, 'assets', 'view', { assetId: originalEnvelope.assetId })) {
      return NextResponse.json(
        { error: `Access denied: Cannot publish corrections for asset ${originalEnvelope.assetId}` },
        { status: 403 }
      )
    }

    // Verify recipient still has a subscription (for publishing)
    const recipientHasSubscription = await hasSubscriptionForPublishing(
      originalEnvelope.assetId,
      originalEnvelope.recipientId
    )
    
    if (!recipientHasSubscription) {
      return NextResponse.json(
        { 
          error: `Recipient ${originalEnvelope.recipientId} does not have a subscription to asset ${originalEnvelope.assetId}. Cannot create correction.` 
        },
        { status: 403 }
      )
    }

    // Validate correction is for same asset and recipient
    // (This is implicit since we're using the original envelope's values)

    // Create new envelope with incremented version
    const newVersion = originalEnvelope.version + 1
    const timestamp = validated.timestamp

    if (isVercel()) {
      const db = getInMemoryDB()
      const envelopeId = db.nextEnvelopeId++
      
      const envelope = {
        id: envelopeId,
        publisherId: originalEnvelope.publisherId,
        userId: user.id,
        assetOwnerId: originalEnvelope.assetOwnerId,
        assetId: originalEnvelope.assetId,
        recipientId: originalEnvelope.recipientId,
        timestamp,
        version: newVersion,
        status: 'Delivered' as const,
        dataType: (validated.dataType || originalEnvelope.dataType) as any,
        period: validated.period || originalEnvelope.period || undefined,
      }
      
      const hash = generateHash(envelope as any, validated.payload)

      const envelopeWithHash = {
        ...envelope,
        hash,
      }

      db.envelopes.push(envelopeWithHash)
      db.payloads.push({
        id: db.nextPayloadId++,
        envelopeId,
        data: validated.payload,
      })

      return NextResponse.json(envelopeWithHash, { status: 201 })
    } else {
      const envelopeForHash = {
        id: 0, // Temporary
        publisherId: originalEnvelope.publisherId,
        userId: user.id,
        assetOwnerId: originalEnvelope.assetOwnerId,
        assetId: originalEnvelope.assetId,
        recipientId: originalEnvelope.recipientId,
        timestamp,
        version: newVersion,
        status: 'Delivered' as const,
        dataType: (validated.dataType || originalEnvelope.dataType) as any,
        period: validated.period || originalEnvelope.period,
      }
      const hash = generateHash(envelopeForHash as any, validated.payload)

      const created = await prisma.envelope.create({
        data: {
          publisherId: originalEnvelope.publisherId,
          userId: user.id,
          assetOwnerId: originalEnvelope.assetOwnerId,
          assetId: originalEnvelope.assetId,
          recipientId: originalEnvelope.recipientId,
          timestamp,
          version: newVersion,
          status: 'Delivered',
          hash,
          dataType: validated.dataType || originalEnvelope.dataType || null,
          period: validated.period || originalEnvelope.period || null,
        },
      })

      await prisma.payload.create({
        data: {
          envelopeId: created.id,
          data: JSON.stringify(validated.payload),
        },
      })

      return NextResponse.json(created, { status: 201 })
    }
  } catch (error) {
    console.error('Error creating envelope correction:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create envelope correction' }, { status: 500 })
  }
}

