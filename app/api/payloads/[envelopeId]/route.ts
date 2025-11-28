import { NextRequest, NextResponse } from 'next/server'
import { getInMemoryDB, isVercel } from '@/lib/in-memory-db'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/iam/middleware'
import { canAccessEnvelope, canAccessEnvelopeViaDelegate, authorize } from '@/lib/iam/authorization'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { envelopeId: string } }
) {
  return withAuth(async (req, auth, user, org) => {
    try {
      authorize(auth, 'payloads:read')
      
      const envelopeId = parseInt(params.envelopeId)

      let envelope
      let delegations = []
      
      if (isVercel()) {
        const db = getInMemoryDB()
        envelope = db.envelopes.find(e => e.id === envelopeId)
        delegations = db.delegations
      } else {
        envelope = await prisma.envelope.findUnique({
          where: { id: envelopeId },
        })
        const delegationsRaw = await prisma.delegation.findMany()
        delegations = delegationsRaw.map(d => ({
          ...d,
          assetScope: d.assetScope === 'ALL' ? 'ALL' : JSON.parse(d.assetScope),
          typeScope: d.typeScope === 'ALL' ? 'ALL' : JSON.parse(d.typeScope),
        }))
      }

      if (!envelope) {
        return NextResponse.json({ error: 'Envelope not found' }, { status: 404 })
      }

      const hasDirectAccess = canAccessEnvelope(auth, envelope, org)
      const hasDelegateAccess = canAccessEnvelopeViaDelegate(auth, envelope, delegations)

      if (!hasDirectAccess && !hasDelegateAccess) {
        return NextResponse.json(
          { error: 'Unauthorized: Organization not authorized to view this envelope' },
          { status: 403 }
        )
      }

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
        data: payloadData,
      })
    } catch (error) {
      console.error('Error fetching payload:', error)
      return NextResponse.json({ error: 'Failed to fetch payload' }, { status: 500 })
    }
  })(request)
}
