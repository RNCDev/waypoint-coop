import { NextRequest, NextResponse } from 'next/server'
import { getInMemoryDB, isVercel } from '@/lib/in-memory-db'
import { prisma } from '@/lib/prisma'
import { generateHash } from '@/lib/crypto'
import { z } from 'zod'
import { withPermission, logAuditEvent } from '@/lib/iam/middleware'
import { filterEnvelopesByAccess } from '@/lib/iam/authorization'

export const dynamic = 'force-dynamic'

const envelopeSchema = z.object({
  publisherId: z.number(),
  userId: z.number(),
  assetOwnerId: z.number(),
  assetId: z.number(),
  timestamp: z.string(),
  recipientId: z.number(),
  dataType: z.string().optional(),
  period: z.string().optional(),
  payload: z.any(),
})

export const GET = withPermission('envelopes:read')(async (request, auth, user, org) => {
  try {
    const searchParams = request.nextUrl.searchParams
    const publisherId = searchParams.get('publisherId')
    const subscriberId = searchParams.get('subscriberId')
    const assetId = searchParams.get('assetId')

    let envelopes
    let delegations = []

    if (isVercel()) {
      const db = getInMemoryDB()
      envelopes = db.envelopes
      delegations = db.delegations

      if (publisherId) {
        envelopes = envelopes.filter(e => e.publisherId === parseInt(publisherId))
      }
      if (subscriberId) {
        envelopes = envelopes.filter(e => e.recipientId === parseInt(subscriberId))
      }
      if (assetId) {
        envelopes = envelopes.filter(e => e.assetId === parseInt(assetId))
      }
    } else {
      const where: any = {}
      if (publisherId) where.publisherId = parseInt(publisherId)
      if (subscriberId) where.recipientId = parseInt(subscriberId)
      if (assetId) where.assetId = parseInt(assetId)

      envelopes = await prisma.envelope.findMany({
        where,
        include: {
          asset: true,
          user: true,
        },
      })

      const delegationsRaw = await prisma.delegation.findMany()
      delegations = delegationsRaw.map(d => ({
        ...d,
        assetScope: d.assetScope === 'ALL' ? 'ALL' : JSON.parse(d.assetScope),
        typeScope: d.typeScope === 'ALL' ? 'ALL' : JSON.parse(d.typeScope),
      }))
    }

    const filteredEnvelopes = filterEnvelopesByAccess(auth, org, envelopes, delegations)

    return NextResponse.json(filteredEnvelopes)
  } catch (error) {
    console.error('Error fetching envelopes:', error)
    return NextResponse.json({ error: 'Failed to fetch envelopes' }, { status: 500 })
  }
})

export const POST = withPermission('envelopes:write')(async (request, auth, user, org) => {
  try {
    const body = await request.json()
    
    const isBatch = Array.isArray(body)
    const envelopesToCreate = isBatch ? body : [body]

    const createdEnvelopes = []

    for (const envelopeData of envelopesToCreate) {
      const validated = envelopeSchema.parse(envelopeData)

      if (validated.publisherId !== auth.orgId && validated.assetOwnerId !== auth.orgId) {
        await logAuditEvent(auth, 'CREATE_ENVELOPE', 'envelopes', undefined, 'failure', request, {
          reason: 'Unauthorized organization',
        })
        return NextResponse.json(
          { error: 'Cannot create envelope for other organizations' },
          { status: 403 }
        )
      }

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
        
        await logAuditEvent(auth, 'CREATE_ENVELOPE', 'envelopes', envelopeId, 'success', request, {
          recipientId: validated.recipientId,
          assetId: validated.assetId,
        })
      } else {
        const envelope = {
          id: 0,
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
        
        await logAuditEvent(auth, 'CREATE_ENVELOPE', 'envelopes', created.id, 'success', request, {
          recipientId: validated.recipientId,
          assetId: validated.assetId,
        })
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
})
