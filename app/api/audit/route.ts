import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/audit - Get audit logs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const entityType = searchParams.get('entityType')
    const entityId = searchParams.get('entityId')
    const organizationId = searchParams.get('organizationId')
    const actorId = searchParams.get('actorId')
    const action = searchParams.get('action')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: {
          ...(entityType && { entityType }),
          ...(entityId && { entityId }),
          ...(organizationId && { organizationId }),
          ...(actorId && { actorId }),
          ...(action && { action }),
        },
        include: {
          actor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.auditLog.count({
        where: {
          ...(entityType && { entityType }),
          ...(entityId && { entityId }),
          ...(organizationId && { organizationId }),
          ...(actorId && { actorId }),
          ...(action && { action }),
        },
      }),
    ])

    return NextResponse.json({
      logs,
      total,
      limit,
      offset,
      hasMore: offset + logs.length < total,
    })
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    )
  }
}

