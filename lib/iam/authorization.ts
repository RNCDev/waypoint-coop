import { AuthContext, Permission, Resource, Action } from '@/types/iam'
import { User, Organization, Envelope, Delegation } from '@/types'
import { hasPermission } from './permissions'

export class AuthorizationError extends Error {
  constructor(message: string, public code: string = 'UNAUTHORIZED') {
    super(message)
    this.name = 'AuthorizationError'
  }
}

export function createAuthContext(user: User, org: Organization): AuthContext {
  const { getRolePermissions } = require('./permissions')
  return {
    userId: user.id,
    orgId: user.orgId,
    role: user.role,
    permissions: getRolePermissions(user.role),
  }
}

export function authorize(
  context: AuthContext,
  requiredPermission: Permission
): void {
  if (!hasPermission(context.role as any, requiredPermission)) {
    throw new AuthorizationError(
      `Permission denied: ${requiredPermission} required`,
      'FORBIDDEN'
    )
  }
}

export function canAccessEnvelope(
  context: AuthContext,
  envelope: Envelope,
  org: Organization
): boolean {
  if (context.permissions.includes('admin:all')) {
    return true
  }

  if (org.role === 'Publisher' || org.role === 'Asset Owner') {
    return envelope.publisherId === context.orgId || envelope.assetOwnerId === context.orgId
  }

  if (org.role === 'Subscriber') {
    return envelope.recipientId === context.orgId
  }

  if (org.role === 'Delegate') {
    return false
  }

  return false
}

export function canAccessEnvelopeViaDelegate(
  context: AuthContext,
  envelope: Envelope,
  delegations: Delegation[]
): boolean {
  for (const delegation of delegations) {
    if (delegation.delegateId !== context.orgId || delegation.status !== 'Active') {
      continue
    }

    if (envelope.recipientId !== delegation.subscriberId) {
      continue
    }

    const assetMatch = delegation.assetScope === 'ALL' || 
      (Array.isArray(delegation.assetScope) && delegation.assetScope.includes(envelope.assetId))

    const typeMatch = delegation.typeScope === 'ALL' ||
      (Array.isArray(delegation.typeScope) && envelope.dataType && delegation.typeScope.includes(envelope.dataType))

    if (assetMatch && typeMatch) {
      return true
    }
  }

  return false
}

export function filterEnvelopesByAccess(
  context: AuthContext,
  org: Organization,
  envelopes: Envelope[],
  delegations: Delegation[] = []
): Envelope[] {
  if (context.permissions.includes('admin:all')) {
    return envelopes
  }

  return envelopes.filter(envelope => {
    const directAccess = canAccessEnvelope(context, envelope, org)
    if (directAccess) return true

    if (org.role === 'Delegate') {
      return canAccessEnvelopeViaDelegate(context, envelope, delegations)
    }

    return false
  })
}

export function canCreateEnvelope(
  context: AuthContext,
  org: Organization
): boolean {
  if (context.permissions.includes('admin:all')) {
    return true
  }

  const canWrite = hasPermission(context.role as any, 'envelopes:write')
  const isPublisherOrOwner = org.role === 'Publisher' || org.role === 'Asset Owner'
  
  return canWrite && isPublisherOrOwner
}

export function canManageDelegation(
  context: AuthContext,
  org: Organization,
  delegation: Delegation
): boolean {
  if (context.permissions.includes('admin:all')) {
    return true
  }

  if (org.role === 'Subscriber' && delegation.subscriberId === context.orgId) {
    return hasPermission(context.role as any, 'delegations:write')
  }

  if ((org.role === 'Asset Owner' || org.role === 'Publisher') && 
      hasPermission(context.role as any, 'delegations:approve')) {
    return true
  }

  return false
}

export function canAccessOrganization(
  context: AuthContext,
  targetOrgId: number
): boolean {
  if (context.permissions.includes('admin:all')) {
    return true
  }

  return context.orgId === targetOrgId
}

export function canAccessAuditLog(context: AuthContext, org: Organization): boolean {
  if (context.permissions.includes('admin:all')) {
    return true
  }

  return hasPermission(context.role as any, 'audit:read')
}
