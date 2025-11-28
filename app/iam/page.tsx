'use client'

import { UserPermissionsView } from '@/components/iam/user-permissions-view'
import { RolePermissionsCard } from '@/components/iam/role-permissions-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserRole } from '@/types'

const allRoles: UserRole[] = [
  'Platform Admin',
  'Admin',
  'Publisher',
  'Asset Owner',
  'Subscriber',
  'Auditor',
  'Viewer',
  'Analytics',
  'Tax',
  'Integration',
  'Ops',
  'Signer',
  'IR',
  'Risk',
  'Restricted',
]

export default function IAMPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-light mb-2">Identity & Access Management</h1>
        <p className="text-muted-foreground">
          Manage user permissions and view role-based access controls
        </p>
      </div>

      <Tabs defaultValue="my-access" className="w-full">
        <TabsList>
          <TabsTrigger value="my-access">My Access</TabsTrigger>
          <TabsTrigger value="roles">Role Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="my-access" className="space-y-4 mt-6">
          <UserPermissionsView />
        </TabsContent>

        <TabsContent value="roles" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allRoles.map((role) => (
              <RolePermissionsCard key={role} role={role} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
