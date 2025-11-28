import { NextRequest, NextResponse } from 'next/server'
import { getInMemoryDB, isVercel } from '@/lib/in-memory-db'
import { prisma } from '@/lib/prisma'
import { generateHash } from '@/lib/crypto'
import { z } from 'zod'

const envelopeSchema = z.object({
  publisherId: z.number(),
  userId: z.number(),
  assetOwnerId: z.number(),
  assetId: z.number(),
  timestamp: z.string(),
  recipientId: z.number(), // Single recipient per envelope
  dataType: z.string().optional(),
  period: z.string().optional(),
  payload: z.any(), // LP-specific payload data
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const publisherId = searchParams.get('publisherId')
    const subscriberId = searchParams.get('subscriberId')
    const assetId = searchParams.get('assetId')

    if (isVercel()) {
      const db = getInMemoryDB()
      let envelopes = db.envelopes

      if (publisherId) {
        envelopes = envelopes.filter(e => e.publisherId === parseInt(publisherId))
      }
      if (subscriberId) {
        // Filter by recipientId (single recipient per envelope)
        envelopes = envelopes.filter(e => e.recipientId === parseInt(subscriberId))
      }
      if (assetId) {
        envelopes = envelopes.filter(e => e.assetId === parseInt(assetId))
      }

      return NextResponse.json(envelopes)
    } else {
      const where: any = {}
      if (publisherId) where.publisherId = parseInt(publisherId)
      if (subscriberId) where.recipientId = parseInt(subscriberId)
      if (assetId) where.assetId = parseInt(assetId)

      const envelopes = await prisma.envelope.findMany({
        where,
        include: {
          asset: true,
          user: true,
        },
      })

      return NextResponse.json(envelopes)
    }
  } catch (error) {
    console.error('Error fetching envelopes:', error)
    return NextResponse.json({ error: 'Failed to fetch envelopes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Support both single envelope and batch creation
    const isBatch = Array.isArray(body)
    const envelopesToCreate = isBatch ? body : [body]

    const createdEnvelopes = []

    for (const envelopeData of envelopesToCreate) {
      const validated = envelopeSchema.parse(envelopeData)

      if (isVercel()) {
        const db = getInMemoryDB()
        const envelopeId = db.nextEnvelopeId++
        
        const envelope = {
          id: envelopeId,
          publisherId: validated.publisherId,
          userId: validated.userId,
          assetOwnerId: validated.assetOwnerId,
          assetId: validated.assetId,
          recipientId: validated.recipientId,
          timestamp: validated.timestamp,
          version: 1,
          status: 'Delivered' as const,
          dataType: validated.dataType as any,
          period: validated.period,
        }
        
        const hash = generateHash(envelope, validated.payload)

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

        createdEnvelopes.push(envelopeWithHash)
      } else {
        const envelope = {
          id: 0, // Temporary, will be set by DB
          publisherId: validated.publisherId,
          userId: validated.userId,
          assetOwnerId: validated.assetOwnerId,
          assetId: validated.assetId,
          recipientId: validated.recipientId,
          timestamp: validated.timestamp,
          version: 1,
          status: 'Delivered' as const,
          dataType: validated.dataType as any,
          period: validated.period,
        }
        
        const hash = generateHash(envelope, validated.payload)

        const created = await prisma.envelope.create({
          data: {
            publisherId: validated.publisherId,
            userId: validated.userId,
            assetOwnerId: validated.assetOwnerId,
            assetId: validated.assetId,
            recipientId: validated.recipientId,
            timestamp: validated.timestamp,
            version: 1,
            status: 'Delivered',
            hash,
            dataType: validated.dataType || null,
            period: validated.period || null,
          },
        })

        await prisma.payload.create({
          data: {
            envelopeId: created.id,
            data: JSON.stringify(validated.payload),
          },
        })

        createdEnvelopes.push(created)
      }
    }

    return NextResponse.json(isBatch ? createdEnvelopes : createdEnvelopes[0], { status: 201 })
  } catch (error) {
    console.error('Error creating envelope:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create envelope' }, { status: 500 })
  }
}
