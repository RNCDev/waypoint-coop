import { NextRequest, NextResponse } from 'next/server'
import { getInMemoryDB, isVercel } from '@/lib/in-memory-db'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    if (isVercel()) {
      const db = getInMemoryDB()
      // Return all envelopes as audit log
      const auditLog = db.envelopes.map(e => ({
        id: e.id,
        type: 'PUBLISH',
        publisherId: e.publisherId,
        assetId: e.assetId,
        timestamp: e.timestamp,
        status: e.status,
      }))
      return NextResponse.json(auditLog)
    } else {
      const envelopes = await prisma.envelope.findMany({
        select: {
          id: true,
          publisherId: true,
          assetId: true,
          timestamp: true,
          status: true,
        },
        orderBy: {
          timestamp: 'desc',
        },
      })

      const auditLog = envelopes.map(e => ({
        id: e.id,
        type: 'PUBLISH',
        publisherId: e.publisherId,
        assetId: e.assetId,
        timestamp: e.timestamp,
        status: e.status,
      }))

      return NextResponse.json(auditLog)
    }
  } catch (error) {
    console.error('Error fetching audit log:', error)
    return NextResponse.json({ error: 'Failed to fetch audit log' }, { status: 500 })
  }
}

