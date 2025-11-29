'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/shared/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Building2, Users, Plus, Shield, FolderOpen } from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { AssetType } from '@prisma/client'

interface Organization {
  id: string
  name: string
  type: string
  lei: string | null
  createdAt: string
  _count: {
    users: number
    managedAssets: number
    subscriptions: number
  }
}

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  organization: {
    id: string
    name: string
    type: string
  }
}

interface Asset {
  id: string
  name: string
  type: AssetType
  vintage: number | null
  createdAt: string
  manager: {
    id: string
    name: string
  }
  _count: {
    subscriptions: number
    envelopes: number
  }
}

const ORG_TYPES = [
  'GP',
  'LP',
  'FUND_ADMIN',
  'AUDITOR',
  'CONSULTANT',
  'TAX_ADVISOR',
  'PLATFORM_ADMIN',
]

export default function RegistryPage() {
  const { currentPersona } = useAuthStore()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [orgDialogOpen, setOrgDialogOpen] = useState(false)
  const [userDialogOpen, setUserDialogOpen] = useState(false)
  const [assetDialogOpen, setAssetDialogOpen] = useState(false)

  // Form state
  const [newOrg, setNewOrg] = useState({ name: '', type: '', lei: '' })
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    organizationId: '',
    role: 'MEMBER',
  })
  const [newAsset, setNewAsset] = useState({
    name: '',
    type: 'FUND' as AssetType,
    vintage: '',
    requireGPApprovalForDelegations: false,
  })

  useEffect(() => {
    async function fetchData() {
      try {
        if (currentPersona.organizationType === 'GP') {
          // For GP: fetch their assets
          const assetsRes = await fetch(`/api/assets?managerId=${currentPersona.organizationId}`)
          const assetsData = await assetsRes.json()
          setAssets(assetsData)
        } else {
          // For Platform Admin: fetch organizations and users
          const [orgsRes, usersRes] = await Promise.all([
            fetch('/api/organizations'),
            fetch('/api/users'),
          ])

          const [orgsData, usersData] = await Promise.all([
            orgsRes.json(),
            usersRes.json(),
          ])

          setOrganizations(orgsData)
          setUsers(usersData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentPersona.organizationType, currentPersona.organizationId])

  const handleCreateOrg = async () => {
    try {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrg),
      })

      if (response.ok) {
        const created = await response.json()
        setOrganizations((prev) => [...prev, { ...created, _count: { users: 0, managedAssets: 0, subscriptions: 0 } }])
        setOrgDialogOpen(false)
        setNewOrg({ name: '', type: '', lei: '' })
      }
    } catch (error) {
      console.error('Error creating organization:', error)
    }
  }

  const handleCreateUser = async () => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      })

      if (response.ok) {
        const created = await response.json()
        setUsers((prev) => [...prev, created])
        setUserDialogOpen(false)
        setNewUser({ name: '', email: '', organizationId: '', role: 'MEMBER' })
      }
    } catch (error) {
      console.error('Error creating user:', error)
    }
  }

  const handleCreateAsset = async () => {
    try {
      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newAsset,
          managerId: currentPersona.organizationId,
          vintage: newAsset.vintage ? parseInt(newAsset.vintage) : null,
        }),
      })

      if (response.ok) {
        const created = await response.json()
        setAssets((prev) => [...prev, { ...created, _count: { subscriptions: 0, envelopes: 0 } }])
        setAssetDialogOpen(false)
        setNewAsset({ name: '', type: 'FUND', vintage: '', requireGPApprovalForDelegations: false })
      }
    } catch (error) {
      console.error('Error creating asset:', error)
    }
  }

  const getOrgTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      PLATFORM_ADMIN: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      GP: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      LP: 'bg-green-500/20 text-green-400 border-green-500/30',
      FUND_ADMIN: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      AUDITOR: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      CONSULTANT: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      TAX_ADVISOR: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    }
    return colors[type] || ''
  }

  const getAssetTypeColor = (type: AssetType) => {
    const colors: Record<string, string> = {
      FUND: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      PORTFOLIO: 'bg-green-500/20 text-green-400 border-green-500/30',
      COMPANY: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    }
    return colors[type] || ''
  }

  // GP view: Asset management
  if (currentPersona.organizationType === 'GP') {
    return (
      <div className="flex-1 bg-background">
        <Navbar />

        <main className="container mx-auto px-4 py-12 max-w-7xl">
          {/* Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-semibold mb-3 gradient-text">Registry</h1>
                <p className="text-muted-foreground text-base">
                  Manage assets for {currentPersona.organizationName}
                </p>
              </div>
              <Dialog open={assetDialogOpen} onOpenChange={setAssetDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Asset
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Asset</DialogTitle>
                    <DialogDescription>
                      Add a new asset to your organization
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={newAsset.name}
                        onChange={(e) =>
                          setNewAsset((prev) => ({ ...prev, name: e.target.value }))
                        }
                        placeholder="Asset name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={newAsset.type}
                        onValueChange={(v) =>
                          setNewAsset((prev) => ({ ...prev, type: v as AssetType }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FUND">Fund</SelectItem>
                          <SelectItem value="PORTFOLIO">Portfolio</SelectItem>
                          <SelectItem value="COMPANY">Company</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Vintage (Optional)</Label>
                      <Input
                        type="number"
                        value={newAsset.vintage}
                        onChange={(e) =>
                          setNewAsset((prev) => ({ ...prev, vintage: e.target.value }))
                        }
                        placeholder="e.g., 2024"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="requireApproval"
                        checked={newAsset.requireGPApprovalForDelegations}
                        onChange={(e) =>
                          setNewAsset((prev) => ({
                            ...prev,
                            requireGPApprovalForDelegations: e.target.checked,
                          }))
                        }
                        className="rounded border-border"
                      />
                      <Label htmlFor="requireApproval" className="cursor-pointer">
                        Require GP approval for delegations
                      </Label>
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleCreateAsset}
                      disabled={!newAsset.name || !newAsset.type}
                    >
                      Create Asset
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>

          {/* Assets Table */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card>
              <CardContent className="pt-6">
                {loading ? (
                  <div className="empty-state">Loading...</div>
                ) : assets.length === 0 ? (
                  <div className="empty-state">
                    <FolderOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p>No assets found</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Create your first asset to get started
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Vintage</TableHead>
                          <TableHead>Subscriptions</TableHead>
                          <TableHead>Envelopes</TableHead>
                          <TableHead>Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assets.map((asset) => (
                          <TableRow key={asset.id}>
                            <TableCell className="font-medium">
                              {asset.name}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={getAssetTypeColor(asset.type)}
                              >
                                {asset.type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {asset.vintage || '-'}
                            </TableCell>
                            <TableCell>{asset._count.subscriptions}</TableCell>
                            <TableCell>{asset._count.envelopes}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(asset.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    )
  }

  // Platform Admin view: Organizations and Users

  return (
    <div className="flex-1 bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-4xl font-semibold mb-3 gradient-text">Registry</h1>
          <p className="text-muted-foreground text-base">
            Platform-wide organization and user registry
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Organizations</p>
                  <p className="text-2xl font-bold">{organizations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Users</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">LEI Verified</p>
                  <p className="text-2xl font-bold">
                    {organizations.filter((o) => o.lei).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Tabs defaultValue="organizations">
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="organizations">Organizations</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
              </TabsList>

              <div className="flex gap-2">
                <Dialog open={orgDialogOpen} onOpenChange={setOrgDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Org
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Organization</DialogTitle>
                      <DialogDescription>
                        Add a new organization to the platform
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          value={newOrg.name}
                          onChange={(e) =>
                            setNewOrg((prev) => ({ ...prev, name: e.target.value }))
                          }
                          placeholder="Organization name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select
                          value={newOrg.type}
                          onValueChange={(v) =>
                            setNewOrg((prev) => ({ ...prev, type: v }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type..." />
                          </SelectTrigger>
                          <SelectContent>
                            {ORG_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>LEI (Optional)</Label>
                        <Input
                          value={newOrg.lei}
                          onChange={(e) =>
                            setNewOrg((prev) => ({ ...prev, lei: e.target.value }))
                          }
                          placeholder="Legal Entity Identifier"
                        />
                      </div>
                      <Button
                        className="w-full"
                        onClick={handleCreateOrg}
                        disabled={!newOrg.name || !newOrg.type}
                      >
                        Create Organization
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create User</DialogTitle>
                      <DialogDescription>
                        Add a new user to an organization
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          value={newUser.name}
                          onChange={(e) =>
                            setNewUser((prev) => ({ ...prev, name: e.target.value }))
                          }
                          placeholder="Full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={newUser.email}
                          onChange={(e) =>
                            setNewUser((prev) => ({ ...prev, email: e.target.value }))
                          }
                          placeholder="email@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Organization</Label>
                        <Select
                          value={newUser.organizationId}
                          onValueChange={(v) =>
                            setNewUser((prev) => ({ ...prev, organizationId: v }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select organization..." />
                          </SelectTrigger>
                          <SelectContent>
                            {organizations.map((org) => (
                              <SelectItem key={org.id} value={org.id}>
                                {org.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Select
                          value={newUser.role}
                          onValueChange={(v) =>
                            setNewUser((prev) => ({ ...prev, role: v }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="MEMBER">Member</SelectItem>
                            <SelectItem value="VIEWER">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        className="w-full"
                        onClick={handleCreateUser}
                        disabled={
                          !newUser.name || !newUser.email || !newUser.organizationId
                        }
                      >
                        Create User
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <TabsContent value="organizations">
              <Card>
                <CardContent className="pt-6">
                  {loading ? (
                    <div className="empty-state">Loading...</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>LEI</TableHead>
                            <TableHead>Users</TableHead>
                            <TableHead>Assets</TableHead>
                            <TableHead>Subscriptions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {organizations.map((org) => (
                            <TableRow key={org.id}>
                              <TableCell className="font-medium">
                                {org.name}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={getOrgTypeColor(org.type)}
                                >
                                  {org.type}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-mono text-xs">
                                {org.lei || '-'}
                              </TableCell>
                              <TableCell>{org._count.users}</TableCell>
                              <TableCell>{org._count.managedAssets}</TableCell>
                              <TableCell>{org._count.subscriptions}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users">
              <Card>
                <CardContent className="pt-6">
                  {loading ? (
                    <div className="empty-state">Loading...</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Organization</TableHead>
                            <TableHead>Role</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">
                                {user.name}
                              </TableCell>
                              <TableCell className="font-mono text-xs">
                                {user.email}
                              </TableCell>
                              <TableCell>{user.organization.name}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{user.role}</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  )
}

