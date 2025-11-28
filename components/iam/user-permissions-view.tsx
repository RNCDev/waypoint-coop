'use client'

import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PermissionBadge } from './permission-badge'
import { Shield, User, Building2 } from 'lucide-react'

export function UserPermissionsView() {
  const { currentUser, currentOrg, getPermissions, getAuthContext } = useAuthStore()

  if (!currentUser || !currentOrg) {
    return null
  }

  const permissions = getPermissions()
  const authContext = getAuthContext()

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Current User Access
          </CardTitle>
          <CardDescription>Your current permissions and access levels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4" />
                User Information
              </div>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="text-muted-foreground">Name:</span>{' '}
                  <span className="font-medium">{currentUser.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>{' '}
                  <span className="font-medium">{currentUser.email}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Role:</span>{' '}
                  <Badge variant="outline">{currentUser.role}</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Building2 className="h-4 w-4" />
                Organization
              </div>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="text-muted-foreground">Name:</span>{' '}
                  <span className="font-medium">{currentOrg.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Type:</span>{' '}
                  <span className="font-medium">{currentOrg.type}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>{' '}
                  <Badge variant={currentOrg.status === 'Verified' ? 'default' : 'secondary'}>
                    {currentOrg.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="text-sm font-medium mb-3">
              Permissions ({permissions.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {permissions.map((permission) => (
                <PermissionBadge key={permission} permission={permission} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
