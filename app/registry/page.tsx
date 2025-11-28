'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion } from 'framer-motion'
import { mockOrganizations, mockUsers } from '@/lib/mock-data'
import { Organization, User } from '@/types'
import { Shield, ShieldOff } from 'lucide-react'

export default function RegistryPage() {
  const router = useRouter()
  const { currentUser, currentOrg, _hasHydrated } = useAuthStore()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  // Redirect if user doesn't have access to registry
  // Only check after hydration is complete to avoid false redirects
  useEffect(() => {
    if (_hasHydrated && currentUser && currentOrg) {
      const hasAccess = currentUser.role === 'Platform Admin' || currentOrg.role === 'Platform Admin'
      if (!hasAccess) {
        router.push('/')
      }
    }
  }, [_hasHydrated, currentUser, currentOrg, router])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // In a real app, these would be API calls
      // For now, we use mock data
      setOrganizations(mockOrganizations)
      setUsers(mockUsers)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrgs = organizations.filter((org) =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mockOrganizations.find(o => o.id === user.orgId)?.name.toLowerCase().includes(searchTerm.toLowerCase()) || ''
  )

  const getOrgName = (orgId: number) => {
    return mockOrganizations.find(o => o.id === orgId)?.name || 'Unknown'
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent leading-[1.2] pb-0.5">
          Entity Registry
        </h1>
        <p className="text-muted-foreground text-lg">Manage organizations and users</p>
      </motion.div>

      <div className="flex items-center gap-4 mb-6">
        <Input
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <Tabs defaultValue="organizations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="organizations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Organizations</CardTitle>
              <CardDescription>{filteredOrgs.length} organizations</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrgs.map((org) => (
                    <TableRow key={org.id}>
                      <TableCell className="font-mono">{org.id}</TableCell>
                      <TableCell className="font-medium">{org.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{org.role}</Badge>
                      </TableCell>
                      <TableCell>{org.type}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            org.status === 'Verified'
                              ? 'default'
                              : org.status === 'Pending'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {org.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>{filteredUsers.length} users</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-mono">{user.id}</TableCell>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getOrgName(user.orgId)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        {user.isOrgAdmin ? (
                          <Badge variant="default" className="bg-green-600/20 text-green-400 border-green-600/30">
                            <Shield className="w-3 h-3 mr-1" />
                            Admin
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            <ShieldOff className="w-3 h-3 mr-1" />
                            Member
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
