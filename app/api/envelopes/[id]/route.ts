import { NextRequest, NextResponse } from 'next/server'
import { getInMemoryDB, isVercel } from '@/lib/in-memory-db'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const updateEnvelopeSchema = z.object({
  status: z.enum(['Delivered', 'Revoked']).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    if (isVercel()) {
      const db = getInMemoryDB()
      const envelope = db.envelopes.find(e => e.id === id)
      if (!envelope) {
        return NextResponse.json({ error: 'Envelope not found' }, { status: 404 })
      }
      return NextResponse.json(envelope)
    } else {
      const envelope = await prisma.envelope.findUnique({
        where: { id },
        include: {
          asset: true,
          user: true,
        },
      })

      if (!envelope) {
        return NextResponse.json({ error: 'Envelope not found' }, { status: 404 })
      }

      return NextResponse.json(envelope)
    }
  } catch (error) {
    console.error('Error fetching envelope:', error)
    return NextResponse.json({ error: 'Failed to fetch envelope' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    const validated = updateEnvelopeSchema.parse(body)

    if (isVercel()) {
      const db = getInMemoryDB()
      const envelope = db.envelopes.find(e => e.id === id)
      if (!envelope) {
        return NextResponse.json({ error: 'Envelope not found' }, { status: 404 })
      }

      // Update status (soft delete - envelope remains in database)
      if (validated.status) {
        envelope.status = validated.status as 'Delivered' | 'Revoked'
      }

      return NextResponse.json(envelope)
    } else {
      const envelope = await prisma.envelope.findUnique({
        where: { id },
      })

      if (!envelope) {
        return NextResponse.json({ error: 'Envelope not found' }, { status: 404 })
      }

      const updated = await prisma.envelope.update({
        where: { id },
        data: {
          status: validated.status || envelope.status,
        },
        include: {
          asset: true,
          user: true,
        },
      })

      return NextResponse.json(updated)
    }
  } catch (error) {
    console.error('Error updating envelope:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update envelope' }, { status: 500 })
  }
}

