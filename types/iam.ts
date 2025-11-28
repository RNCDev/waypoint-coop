export type Permission =
  | 'envelopes:read'
  | 'envelopes:write'
  | 'envelopes:delete'
  | 'payloads:read'
  | 'payloads:write'
  | 'delegations:read'
  | 'delegations:write'
  | 'delegations:approve'
  | 'delegations:revoke'
  | 'organizations:read'
  | 'organizations:write'
  | 'organizations:delete'
  | 'users:read'
  | 'users:write'
  | 'users:delete'
  | 'assets:read'
  | 'assets:write'
  | 'audit:read'
  | 'receipts:read'
  | 'receipts:write'
  | 'admin:all'

export type Action = 'read' | 'write' | 'delete' | 'approve' | 'revoke' | 'all'
export type Resource = 'envelopes' | 'payloads' | 'delegations' | 'organizations' | 'users' | 'assets' | 'audit' | 'receipts' | 'admin'

export interface RolePermissions {
  role: string
  permissions: Permission[]
  description: string
}

export interface AccessPolicy {
  subject: 'user' | 'organization'
  subjectId: number
  resource: Resource
  action: Action
  conditions?: AccessCondition[]
}

export interface AccessCondition {
  field: string
  operator: 'eq' | 'ne' | 'in' | 'nin' | 'contains'
  value: any
}

export interface AuthContext {
  userId: number
  orgId: number
  role: string
  permissions: Permission[]
  sessionId?: string
}

export interface Session {
  id: string
  userId: number
  orgId: number
  createdAt: string
  expiresAt: string
  ipAddress?: string
  userAgent?: string
}

export interface AuditEvent {
  id: number
  userId: number
  orgId: number
  action: string
  resource: Resource
  resourceId?: number
  timestamp: string
  ipAddress?: string
  userAgent?: string
  status: 'success' | 'failure'
  details?: any
}
