import { Permission, RolePermissions } from '@/types/iam'
import { UserRole } from '@/types'

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  'Platform Admin': {
    role: 'Platform Admin',
    description: 'Full access to all platform resources and operations',
    permissions: ['admin:all'],
  },
  'Admin': {
    role: 'Admin',
    description: 'Organization administrator with broad permissions',
    permissions: [
      'envelopes:read',
      'envelopes:write',
      'envelopes:delete',
      'payloads:read',
      'payloads:write',
      'delegations:read',
      'delegations:write',
      'delegations:approve',
      'delegations:revoke',
      'organizations:read',
      'users:read',
      'users:write',
      'assets:read',
      'assets:write',
      'audit:read',
      'receipts:read',
      'receipts:write',
    ],
  },
  'Publisher': {
    role: 'Publisher',
    description: 'Can publish envelopes and view organization data',
    permissions: [
      'envelopes:read',
      'envelopes:write',
      'payloads:read',
      'payloads:write',
      'organizations:read',
      'assets:read',
      'receipts:read',
    ],
  },
  'Asset Owner': {
    role: 'Asset Owner',
    description: 'Can manage assets and approve delegations',
    permissions: [
      'envelopes:read',
      'envelopes:write',
      'payloads:read',
      'payloads:write',
      'delegations:read',
      'delegations:approve',
      'organizations:read',
      'assets:read',
      'assets:write',
      'receipts:read',
    ],
  },
  'Subscriber': {
    role: 'Subscriber',
    description: 'Can view envelopes and manage delegations',
    permissions: [
      'envelopes:read',
      'payloads:read',
      'delegations:read',
      'delegations:write',
      'organizations:read',
      'assets:read',
      'receipts:read',
      'receipts:write',
    ],
  },
  'Auditor': {
    role: 'Auditor',
    description: 'Read-only access to delegated data',
    permissions: [
      'envelopes:read',
      'payloads:read',
      'delegations:read',
      'organizations:read',
      'assets:read',
    ],
  },
  'Viewer': {
    role: 'Viewer',
    description: 'Read-only access to organization data',
    permissions: [
      'envelopes:read',
      'payloads:read',
      'organizations:read',
      'assets:read',
      'receipts:read',
    ],
  },
  'Restricted': {
    role: 'Restricted',
    description: 'Limited read-only access',
    permissions: [
      'envelopes:read',
      'organizations:read',
    ],
  },
  'Analytics': {
    role: 'Analytics',
    description: 'Access to analytics and reporting data',
    permissions: [
      'envelopes:read',
      'payloads:read',
      'delegations:read',
      'organizations:read',
      'assets:read',
    ],
  },
  'Tax': {
    role: 'Tax',
    description: 'Access to tax-related documents',
    permissions: [
      'envelopes:read',
      'payloads:read',
      'organizations:read',
      'assets:read',
    ],
  },
  'Integration': {
    role: 'Integration',
    description: 'API integration access',
    permissions: [
      'envelopes:read',
      'payloads:read',
      'organizations:read',
      'assets:read',
    ],
  },
  'Ops': {
    role: 'Ops',
    description: 'Operational access for publishers',
    permissions: [
      'envelopes:read',
      'envelopes:write',
      'payloads:read',
      'payloads:write',
      'organizations:read',
      'assets:read',
    ],
  },
  'Signer': {
    role: 'Signer',
    description: 'Can sign and approve documents',
    permissions: [
      'envelopes:read',
      'envelopes:write',
      'payloads:read',
      'organizations:read',
      'assets:read',
    ],
  },
  'IR': {
    role: 'IR',
    description: 'Investor relations access',
    permissions: [
      'envelopes:read',
      'payloads:read',
      'organizations:read',
      'assets:read',
      'receipts:read',
    ],
  },
  'Risk': {
    role: 'Risk',
    description: 'Risk management and compliance access',
    permissions: [
      'envelopes:read',
      'payloads:read',
      'organizations:read',
      'assets:read',
      'audit:read',
    ],
  },
}

export function getRolePermissions(role: UserRole): Permission[] {
  const roleConfig = ROLE_PERMISSIONS[role]
  return roleConfig?.permissions || []
}

export function hasPermission(userRole: UserRole, requiredPermission: Permission): boolean {
  const permissions = getRolePermissions(userRole)
  
  if (permissions.includes('admin:all')) {
    return true
  }
  
  return permissions.includes(requiredPermission)
}

export function hasAnyPermission(userRole: UserRole, requiredPermissions: Permission[]): boolean {
  return requiredPermissions.some(permission => hasPermission(userRole, permission))
}

export function hasAllPermissions(userRole: UserRole, requiredPermissions: Permission[]): boolean {
  return requiredPermissions.every(permission => hasPermission(userRole, permission))
}
