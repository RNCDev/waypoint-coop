import { NextRequest, NextResponse } from 'next/server'
import { getInMemoryDB, isVercel } from '@/lib/in-memory-db'
import { prisma } from '@/lib/prisma'

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

