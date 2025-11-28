import { NextRequest, NextResponse } from 'next/server'
import { getInMemoryDB, isVercel } from '@/lib/in-memory-db'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ envelopeId: string }> }
) {
  try {
    const { envelopeId: envelopeIdParam } = await params
    const envelopeId = parseInt(envelopeIdParam)
    const searchParams = request.nextUrl.searchParams
    const orgId = searchParams.get('orgId')

    if (!orgId) {
      return NextResponse.json({ error: 'orgId parameter is required' }, { status: 400 })
    }

    const orgIdNum = parseInt(orgId)

    // Fetch envelope to verify authorization
    let envelope
    if (isVercel()) {
      const db = getInMemoryDB()
      envelope = db.envelopes.find(e => e.id === envelopeId)
    } else {
      envelope = await prisma.envelope.findUnique({
        where: { id: envelopeId },
      })
    }

    if (!envelope) {
      return NextResponse.json({ error: 'Envelope not found' }, { status: 404 })
    }

    // Verify authorization: must be publisher or the recipient
    const isPublisher = envelope.publisherId === orgIdNum
    const isRecipient = envelope.recipientId === orgIdNum

    if (!isPublisher && !isRecipient) {
      return NextResponse.json({ error: 'Unauthorized: Organization not authorized to view this envelope' }, { status: 403 })
    }

    // Fetch the payload - no filtering needed since each envelope is already scoped to one LP
    let payloadData: any
    if (isVercel()) {
      const db = getInMemoryDB()
      const payload = db.payloads.find(p => p.envelopeId === envelopeId)
      if (!payload) {
        return NextResponse.json({ error: 'Payload not found' }, { status: 404 })
      }
      payloadData = payload.data
    } else {
      const payload = await prisma.payload.findUnique({
        where: { envelopeId },
      })

      if (!payload) {
        return NextResponse.json({ error: 'Payload not found' }, { status: 404 })
      }

      payloadData = JSON.parse(payload.data)
    }

    return NextResponse.json({
      id: envelopeId,
      envelopeId,
      data: payloadData, // Already scoped to single LP, no filtering needed
    })
  } catch (error) {
    console.error('Error fetching payload:', error)
    return NextResponse.json({ error: 'Failed to fetch payload' }, { status: 500 })
  }
}
