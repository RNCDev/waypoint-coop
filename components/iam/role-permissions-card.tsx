'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PermissionBadge } from './permission-badge'
import { ROLE_PERMISSIONS } from '@/lib/iam/permissions'
import { UserRole } from '@/types'

interface RolePermissionsCardProps {
  role: UserRole
}

export function RolePermissionsCard({ role }: RolePermissionsCardProps) {
  const roleConfig = ROLE_PERMISSIONS[role]

  if (!roleConfig) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {roleConfig.role}
          <Badge variant="outline" className="ml-auto">
            {roleConfig.permissions.length} {roleConfig.permissions.length === 1 ? 'permission' : 'permissions'}
          </Badge>
        </CardTitle>
        <CardDescription>{roleConfig.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {roleConfig.permissions.map((permission) => (
            <PermissionBadge key={permission} permission={permission} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
