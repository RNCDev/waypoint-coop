'use client'

import { Badge } from '@/components/ui/badge'
import { Permission } from '@/types/iam'

interface PermissionBadgeProps {
  permission: Permission
  variant?: 'default' | 'secondary' | 'outline' | 'destructive'
}

const permissionLabels: Record<Permission, string> = {
  'envelopes:read': 'Read Envelopes',
  'envelopes:write': 'Write Envelopes',
  'envelopes:delete': 'Delete Envelopes',
  'payloads:read': 'Read Payloads',
  'payloads:write': 'Write Payloads',
  'delegations:read': 'Read Delegations',
  'delegations:write': 'Write Delegations',
  'delegations:approve': 'Approve Delegations',
  'delegations:revoke': 'Revoke Delegations',
  'organizations:read': 'Read Organizations',
  'organizations:write': 'Write Organizations',
  'organizations:delete': 'Delete Organizations',
  'users:read': 'Read Users',
  'users:write': 'Write Users',
  'users:delete': 'Delete Users',
  'assets:read': 'Read Assets',
  'assets:write': 'Write Assets',
  'audit:read': 'Read Audit Log',
  'receipts:read': 'Read Receipts',
  'receipts:write': 'Write Receipts',
  'admin:all': 'Full Admin Access',
}

export function PermissionBadge({ permission, variant = 'secondary' }: PermissionBadgeProps) {
  return (
    <Badge variant={variant} className="text-xs">
      {permissionLabels[permission] || permission}
    </Badge>
  )
}
