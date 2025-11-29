'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Shield, ShieldOff, Mail } from 'lucide-react'
import { motion } from 'framer-motion'
import { User, UserRole } from '@/types'
import { mockUsers } from '@/lib/mock-data'

export default function IAMSettingsPage() {
  const router = useRouter()
  const { currentUser, currentOrg, _hasHydrated } = useAuthStore()
  const [orgUsers, setOrgUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: '' as UserRole | '',
  })

  // Redirect if user doesn't have org admin access
  useEffect(() => {
    if (_hasHydrated && currentUser && currentOrg) {
      if (!currentUser.isOrgAdmin) {
        router.push('/')
      }
    }
  }, [_hasHydrated, currentUser, currentOrg, router])

  const fetchOrgUsers = useCallback(async () => {
    if (!currentOrg) return
    
    // Filter mock users by current org
    const users = mockUsers.filter(u => u.orgId === currentOrg.id)
    setOrgUsers(users)
    setLoading(false)
  }, [currentOrg])

  useEffect(() => {
    fetchOrgUsers()
  }, [fetchOrgUsers])

  const handleInviteUser = async () => {
    // In a real app, this would send an API request
    // For the mock, we'll just show a success message
    alert(`Invitation sent to ${newUser.email}`)
    setInviteDialogOpen(false)
    setNewUser({ name: '', email: '', role: '' })
  }

  const handleToggleAdmin = (userId: number) => {
    // In a real app, this would update via API
    setOrgUsers(users => users.map(u => {
      if (u.id === userId) {
        return { ...u, isOrgAdmin: !u.isOrgAdmin }
      }
      return u
    }))
  }

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'Platform Admin':
        return 'destructive'
      case 'Admin':
      case 'Asset Manager':
        return 'default'
      case 'Delegate':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getAvailableRoles = (): UserRole[] => {
    if (!currentOrg) return []
    
    switch (currentOrg.role) {
      case 'Platform Admin':
        return ['Platform Admin', 'Admin', 'Viewer']
      case 'Asset Manager':
        return ['Asset Manager', 'Admin', 'Viewer', 'Signer', 'IR']
      case 'Limited Partner':
        return ['Limited Partner', 'Admin', 'Viewer', 'Risk']
      case 'Delegate':
        return ['Delegate', 'Admin', 'Viewer', 'Ops', 'Analytics', 'Auditor', 'Tax', 'Integration']
      default:
        return ['Viewer']
    }
  }

  const filteredUsers = orgUsers.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-2">
          <div className="flex-1 min-w-0 pr-4">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent break-words leading-[1.2] pb-0.5">
              {currentOrg?.role === 'Platform Admin' ? 'IAM' : 'IAM'}
            </h1>
            <p className="text-muted-foreground text-lg">
              {currentOrg?.role === 'Platform Admin' 
                ? 'Manage Waypoint team members and platform permissions'
                : `Manage users and permissions for ${currentOrg?.name}`}
            </p>
          </div>
          {currentOrg?.role !== 'Platform Admin' && (
            <div className="flex items-center gap-3 shrink-0">
              <Badge variant="outline" className="text-sm">{currentOrg?.type}</Badge>
              <Badge variant={currentOrg?.status === 'Verified' ? 'default' : 'secondary'} className="text-sm">
                {currentOrg?.status}
              </Badge>
            </div>
          )}
        </div>
      </motion.div>

      <div className="space-y-6">
        {/* User Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  {filteredUsers.length} member{filteredUsers.length !== 1 ? 's' : ''} in your organization
                </CardDescription>
              </div>
              <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Invite User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite New User</DialogTitle>
                    <DialogDescription>
                      Send an invitation to join your organization
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input
                        value={newUser.name}
                        onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <Input
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="john@example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Select
                        value={newUser.role}
                        onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value as UserRole }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableRoles().map(role => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleInviteUser}
                      disabled={!newUser.name || !newUser.email || !newUser.role}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Send Invitation
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            {filteredUsers.length === 0 ? (
              <div className="text-center text-muted-foreground py-12 border border-dashed rounded-lg">
                <p className="text-sm">No users found</p>
                {searchTerm && (
                  <p className="text-xs mt-1">Try adjusting your search</p>
                )}
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="w-[140px]">Role</TableHead>
                      <TableHead className="w-[120px]">Status</TableHead>
                      <TableHead className="w-[140px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <span>{user.name}</span>
                            {user.id === currentUser?.id && (
                              <Badge variant="outline" className="text-xs">You</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm text-muted-foreground">{user.email}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleColor(user.role) as any} className="text-xs">
                            {user.role}
                          </Badge>
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
                        <TableCell className="text-right">
                          {user.id !== currentUser?.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleAdmin(user.id)}
                              className="h-8"
                            >
                              {user.isOrgAdmin ? 'Remove Admin' : 'Make Admin'}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

