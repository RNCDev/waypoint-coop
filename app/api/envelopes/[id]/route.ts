import { NextRequest, NextResponse } from 'next/server'
import { getInMemoryDB, isVercel } from '@/lib/in-memory-db'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/iam/middleware'
import { authorize, canAccessEnvelope, canAccessEnvelopeViaDelegate } from '@/lib/iam/authorization'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(async (req, auth, user, org) => {
    try {
      authorize(auth, 'envelopes:read')
      
      const id = parseInt(params.id)

      let envelope
      let delegations = []

      if (isVercel()) {
        const db = getInMemoryDB()
        envelope = db.envelopes.find(e => e.id === id)
        delegations = db.delegations
      } else {
        envelope = await prisma.envelope.findUnique({
          where: { id },
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

      if (!envelope) {
        return NextResponse.json({ error: 'Envelope not found' }, { status: 404 })
      }

      const hasDirectAccess = canAccessEnvelope(auth, envelope, org)
      const hasDelegateAccess = canAccessEnvelopeViaDelegate(auth, envelope, delegations)

      if (!hasDirectAccess && !hasDelegateAccess) {
        return NextResponse.json(
          { error: 'Unauthorized to access this envelope' },
          { status: 403 }
        )
      }

      return NextResponse.json(envelope)
    } catch (error) {
      console.error('Error fetching envelope:', error)
      return NextResponse.json({ error: 'Failed to fetch envelope' }, { status: 500 })
    }
  })(request)
}

