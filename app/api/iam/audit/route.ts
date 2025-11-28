import { NextRequest, NextResponse } from 'next/server'
import { withPermission } from '@/lib/iam/middleware'
import { getInMemoryDB, isVercel } from '@/lib/in-memory-db'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export const GET = withPermission('audit:read')(async (request, auth) => {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const orgId = searchParams.get('orgId')
    const resource = searchParams.get('resource')
    const limit = searchParams.get('limit')

    if (isVercel()) {
      const db = getInMemoryDB()
      let events = db.auditEvents

      if (userId) {
        events = events.filter(e => e.userId === parseInt(userId))
      }
      if (orgId) {
        events = events.filter(e => e.orgId === parseInt(orgId))
      }
      if (resource) {
        events = events.filter(e => e.resource === resource)
      }

      events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      if (limit) {
        events = events.slice(0, parseInt(limit))
      }

      return NextResponse.json(events)
    } else {
      const where: any = {}
      if (userId) where.userId = parseInt(userId)
      if (orgId) where.orgId = parseInt(orgId)
      if (resource) where.resource = resource

      const events = await prisma.auditEvent.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit ? parseInt(limit) : undefined,
      })

      return NextResponse.json(events.map(e => ({
        ...e,
        details: e.details ? JSON.parse(e.details) : null,
      })))
    }
  } catch (error) {
    console.error('Error fetching audit events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audit events' },
      { status: 500 }
    )
  }
})
