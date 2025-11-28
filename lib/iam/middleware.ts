import { NextRequest, NextResponse } from 'next/server'
import { AuthContext, Permission } from '@/types/iam'
import { User, Organization } from '@/types'
import { createAuthContext, authorize, AuthorizationError } from './authorization'
import { getInMemoryDB, isVercel } from '@/lib/in-memory-db'
import { prisma } from '@/lib/prisma'

export interface AuthenticatedRequest extends NextRequest {
  auth?: AuthContext
  user?: User
  org?: Organization
}

export async function getUserFromHeader(request: NextRequest): Promise<{ user: User | null; org: Organization | null }> {
  const userId = request.headers.get('x-user-id')
  
  if (!userId) {
    return { user: null, org: null }
  }

  const parsedUserId = parseInt(userId)

  if (isVercel()) {
    const db = getInMemoryDB()
    const user = db.users.find(u => u.id === parsedUserId)
    const org = user ? db.organizations.find(o => o.id === user.orgId) : null
    return { user: user || null, org: org || null }
  } else {
    try {
      const user = await prisma.user.findUnique({
        where: { id: parsedUserId },
        include: { org: true },
      })
      return { user: user || null, org: user?.org || null }
    } catch (error) {
      return { user: null, org: null }
    }
  }
}

export function withAuth(
  handler: (request: NextRequest, auth: AuthContext, user: User, org: Organization) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any) => {
    const { user, org } = await getUserFromHeader(request)

    if (!user || !org) {
      return NextResponse.json(
        { error: 'Authentication required. Include x-user-id header.' },
        { status: 401 }
      )
    }

    const authContext = createAuthContext(user, org)
    return handler(request, authContext, user, org)
  }
}

export function withPermission(permission: Permission) {
  return function decorator(
    handler: (request: NextRequest, auth: AuthContext, user: User, org: Organization) => Promise<NextResponse>
  ) {
    return async (request: NextRequest, context?: any) => {
      const { user, org } = await getUserFromHeader(request)

      if (!user || !org) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }

      const authContext = createAuthContext(user, org)

      try {
        authorize(authContext, permission)
      } catch (error) {
        if (error instanceof AuthorizationError) {
          return NextResponse.json(
            { error: error.message },
            { status: 403 }
          )
        }
        throw error
      }

      return handler(request, authContext, user, org)
    }
  }
}

export function requirePermissions(...permissions: Permission[]) {
  return function decorator(
    handler: (request: NextRequest, auth: AuthContext, user: User, org: Organization) => Promise<NextResponse>
  ) {
    return async (request: NextRequest, context?: any) => {
      const { user, org } = await getUserFromHeader(request)

      if (!user || !org) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }

      const authContext = createAuthContext(user, org)

      for (const permission of permissions) {
        try {
          authorize(authContext, permission)
        } catch (error) {
          if (error instanceof AuthorizationError) {
            return NextResponse.json(
              { error: error.message },
              { status: 403 }
            )
          }
          throw error
        }
      }

      return handler(request, authContext, user, org)
    }
  }
}

export async function logAuditEvent(
  auth: AuthContext,
  action: string,
  resource: string,
  resourceId: number | undefined,
  status: 'success' | 'failure',
  request: NextRequest,
  details?: any
) {
  const event = {
    userId: auth.userId,
    orgId: auth.orgId,
    action,
    resource,
    resourceId,
    timestamp: new Date().toISOString(),
    ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
    userAgent: request.headers.get('user-agent') || undefined,
    status,
    details,
  }

  if (isVercel()) {
    const db = getInMemoryDB()
    db.auditEvents.push({
      id: db.nextAuditEventId++,
      ...event,
    } as any)
  } else {
    try {
      await prisma.auditEvent.create({
        data: {
          ...event,
          details: details ? JSON.stringify(details) : null,
        } as any,
      })
    } catch (error) {
      console.error('Failed to log audit event:', error)
    }
  }
}
