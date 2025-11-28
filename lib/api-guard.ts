import { NextRequest, NextResponse } from 'next/server'
import { User, Resource, Action } from '@/types'
import { mockUsers } from '@/lib/mock-data'
import { canAccess, getUserOrganization, filterEnvelopesByAccess } from '@/lib/permissions'

// Get current user from request headers (mock authentication)
export function getCurrentUser(req: NextRequest): User | null {
  // In mock auth, we pass user ID in a header
  const userIdHeader = req.headers.get('x-user-id')
  
  if (!userIdHeader) {
    // Default to first user for demo purposes
    return mockUsers[0]
  }

  const userId = parseInt(userIdHeader, 10)
  if (isNaN(userId)) {
    return null
  }

  return mockUsers.find(u => u.id === userId) || null
}

// Permission check result
export interface PermissionCheckResult {
  allowed: boolean
  user: User | null
  error?: string
}

// Check if the current user has permission for a resource/action
export function checkPermission(
  req: NextRequest,
  resource: Resource,
  action: Action,
  context?: { assetId?: number; delegationId?: string; subscriptionId?: string }
): PermissionCheckResult {
  const user = getCurrentUser(req)
  
  if (!user) {
    return {
      allowed: false,
      user: null,
      error: 'Authentication required'
    }
  }

  const org = getUserOrganization(user)
  if (!org) {
    return {
      allowed: false,
      user,
      error: 'User organization not found'
    }
  }

  const allowed = canAccess(user, resource, action, context)
  
  return {
    allowed,
    user,
    error: allowed ? undefined : `Access denied: Cannot ${action} ${resource}`
  }
}

// Middleware wrapper for API routes
export function withPermission(
  resource: Resource,
  action: Action
) {
  return function(handler: (req: NextRequest, user: User) => Promise<NextResponse>) {
    return async function(req: NextRequest): Promise<NextResponse> {
      const result = checkPermission(req, resource, action)
      
      if (!result.allowed || !result.user) {
        return NextResponse.json(
          { error: result.error || 'Access denied' },
          { status: result.user ? 403 : 401 }
        )
      }
      
      return handler(req, result.user)
    }
  }
}

// Helper to create error response
export function errorResponse(message: string, status: number = 400): NextResponse {
  return NextResponse.json({ error: message }, { status })
}

// Helper to create success response
export function successResponse<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json(data, { status })
}

// Filter response data based on user permissions
export function filterByPermission<T extends { id: number; recipientId?: number; assetId?: number; dataType?: string }>(
  user: User,
  data: T[],
  resource: Resource
): T[] {
  if (resource === 'envelopes') {
    return filterEnvelopesByAccess(user, data as any) as T[]
  }
  
  // For other resources, return as-is (permission already checked at route level)
  return data
}

