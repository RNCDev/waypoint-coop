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
import { Plus, Trash2, Check, X, Edit, FileText, Eye, Settings, Shield } from 'lucide-react'
import { motion } from 'framer-motion'
import { PublishingRight, Asset, Organization } from '@/types'
import { mockAssets, mockOrganizations } from '@/lib/mock-data'

type AccessType = 'publish' | 'view' | 'manageSubscriptions' | 'approveDelegations' | 'approveSubscriptions'

interface AssetAccess {
  asset: Asset
  rights: PublishingRight[]
}

export default function DataRightsPage() {
  const router = useRouter()
  const { currentUser, currentOrg, _hasHydrated } = useAuthStore()
  const [publishingRights, setPublishingRights] = useState<PublishingRight[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingRight, setEditingRight] = useState<PublishingRight | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [newAccess, setNewAccess] = useState({
    assetId: '',
    organizationId: '',
    accessTypes: [] as AccessType[],
  })
  const [editAccess, setEditAccess] = useState({
    assetScope: 'ALL' as 'ALL' | number[],
    selectedAssets: [] as number[],
    accessTypes: [] as AccessType[],
  })

  // Redirect if user doesn't have access
  useEffect(() => {
    if (_hasHydrated && currentUser && currentOrg) {
      const hasAccess = currentOrg.role === 'Asset Owner' || currentOrg.role === 'Platform Admin'
      if (!hasAccess) {
        router.push('/')
      }
    }
  }, [_hasHydrated, currentUser, currentOrg, router])

  const fetchData = useCallback(async () => {
    if (!currentUser || !currentOrg) return
    
    try {
      // Fetch publishing rights
      const rightsResponse = await fetch('/api/publishing-rights', {
        headers: {
          'x-user-id': currentUser.id.toString(),
        },
      })
      if (rightsResponse.ok) {
        const rightsData = await rightsResponse.json()
        setPublishingRights(rightsData)
      }

      // Use mock assets filtered by owner
      const availableAssets = currentOrg.role === 'Platform Admin' 
        ? mockAssets 
        : mockAssets.filter(a => a.ownerId === currentOrg.id)
      setAssets(availableAssets)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }, [currentUser, currentOrg])

  useEffect(() => {
    if (currentUser) {
      fetchData()
    }
  }, [currentUser, fetchData])

  // Group rights by asset
  const getAssetAccess = (): AssetAccess[] => {
    return assets.map(asset => {
      const assetRights = publishingRights.filter(right => {
        if (right.assetScope === 'ALL') {
          return right.assetOwnerId === currentOrg?.id
        }
        return Array.isArray(right.assetScope) && right.assetScope.includes(asset.id) && right.assetOwnerId === currentOrg?.id
      })
      return { asset, rights: assetRights }
    }).filter(item => item.rights.length > 0 || searchTerm === '')
  }

  const getAccessTypes = (right: PublishingRight): AccessType[] => {
    const types: AccessType[] = []
    // Having a PublishingRight means they can publish
    types.push('publish')
    if (right.canViewData) types.push('view')
    if (right.canManageSubscriptions) types.push('manageSubscriptions')
    if (right.canApproveDelegations) types.push('approveDelegations')
    if (right.canApproveSubscriptions) types.push('approveSubscriptions')
    return types
  }

  const handleCreateAccess = async () => {
    if (!currentUser || !newAccess.assetId || !newAccess.organizationId || newAccess.accessTypes.length === 0) return

    try {
      // Determine asset scope - if only one asset selected, use array, otherwise could be ALL
      const assetScope = [parseInt(newAccess.assetId)]
      
      // Map access types to PublishingRight flags
      const canManageSubscriptions = newAccess.accessTypes.includes('manageSubscriptions')
      const canApproveDelegations = newAccess.accessTypes.includes('approveDelegations')
      const canApproveSubscriptions = newAccess.accessTypes.includes('approveSubscriptions')
      const canViewData = newAccess.accessTypes.includes('view') || newAccess.accessTypes.includes('publish')

        const response = await fetch('/api/publishing-rights', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': currentUser.id.toString(),
          },
          body: JSON.stringify({
          publisherId: parseInt(newAccess.organizationId),
          assetScope,
          canManageSubscriptions,
          canApproveDelegations,
          canApproveSubscriptions,
          canViewData,
          }),
        })

        if (response.ok) {
          setDialogOpen(false)
        setNewAccess({
          assetId: '',
            organizationId: '',
          accessTypes: [],
        })
        setSelectedAsset(null)
          fetchData()
        } else {
          const error = await response.json()
        alert(error.error || 'Failed to delegate access')
      }
    } catch (error) {
      console.error('Error creating access:', error)
    }
  }

  const handleEditAccess = (right: PublishingRight, asset: Asset) => {
    setEditingRight(right)
    setSelectedAsset(asset)
    
    // Parse assetScope
    let parsedScope: 'ALL' | number[] = 'ALL'
    if (right.assetScope === 'ALL') {
      parsedScope = 'ALL'
    } else if (Array.isArray(right.assetScope)) {
      parsedScope = right.assetScope
    } else if (typeof right.assetScope === 'string') {
      try {
        const parsed = JSON.parse(right.assetScope)
        parsedScope = parsed === 'ALL' ? 'ALL' : (Array.isArray(parsed) ? parsed : 'ALL')
      } catch {
        parsedScope = 'ALL'
      }
    }
    
    const accessTypes = getAccessTypes(right)
    
    setEditAccess({
      assetScope: parsedScope,
      selectedAssets: parsedScope === 'ALL' ? [] : parsedScope,
      accessTypes,
    })
    setEditDialogOpen(true)
  }

  const handleUpdateAccess = async () => {
    if (!currentUser || !editingRight) return

    try {
      const canManageSubscriptions = editAccess.accessTypes.includes('manageSubscriptions')
      const canApproveDelegations = editAccess.accessTypes.includes('approveDelegations')
      const canApproveSubscriptions = editAccess.accessTypes.includes('approveSubscriptions')
      const canViewData = editAccess.accessTypes.includes('view') || editAccess.accessTypes.includes('publish')

      const response = await fetch(`/api/publishing-rights/${editingRight.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id.toString(),
        },
        body: JSON.stringify({
          assetScope: editAccess.assetScope === 'ALL' ? 'ALL' : editAccess.selectedAssets,
          canManageSubscriptions,
          canApproveDelegations,
          canApproveSubscriptions,
          canViewData,
        }),
      })

      if (response.ok) {
        setEditDialogOpen(false)
        setEditingRight(null)
        setSelectedAsset(null)
        setEditAccess({
          assetScope: 'ALL',
          selectedAssets: [],
          accessTypes: [],
        })
        fetchData()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update access')
      }
    } catch (error) {
      console.error('Error updating access:', error)
    }
  }

  const handleRevokeAccess = async (id: string) => {
    if (!currentUser) return
    
    if (!confirm('Are you sure you want to revoke this access?')) return

    try {
      const response = await fetch(`/api/publishing-rights/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': currentUser.id.toString(),
        },
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error revoking access:', error)
    }
  }

  const getOrgName = (orgId: number) => {
    const org = mockOrganizations.find(o => o.id === orgId)
    return org?.name || `Org ${orgId}`
  }

  const getAvailableOrgs = () => {
    // Can delegate to Publishers, Delegates, or potentially other Asset Owners
    return mockOrganizations.filter(o => 
      o.role === 'Publisher' || o.role === 'Delegate' || o.role === 'Asset Owner'
    )
  }

  const getAvailableAssets = () => {
    if (!currentOrg) return []
    if (currentOrg.role === 'Platform Admin') return mockAssets
    return mockAssets.filter(a => a.ownerId === currentOrg.id)
  }

  const filteredAssetAccess = getAssetAccess().filter(item => {
    const assetName = item.asset.name.toLowerCase()
    const orgNames = item.rights.map(r => getOrgName(r.publisherId).toLowerCase()).join(' ')
    return assetName.includes(searchTerm.toLowerCase()) || orgNames.includes(searchTerm.toLowerCase())
  })

  const accessTypeLabels: Record<AccessType, { label: string; icon: React.ReactNode }> = {
    publish: { label: 'Publish Data', icon: <FileText className="w-4 h-4" /> },
    view: { label: 'View Data', icon: <Eye className="w-4 h-4" /> },
    manageSubscriptions: { label: 'Manage Subscriptions', icon: <Settings className="w-4 h-4" /> },
    approveDelegations: { label: 'Approve Delegations', icon: <Shield className="w-4 h-4" /> },
    approveSubscriptions: { label: 'Approve Subscriptions', icon: <Shield className="w-4 h-4" /> },
  }

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
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent leading-[1.2] pb-0.5">
          Delegations
        </h1>
        <p className="text-muted-foreground text-lg">
          Delegate access permissions for organizations by asset. Grant publishing, viewing, subscription management, and approval rights.
        </p>
      </motion.div>

      <div className="flex items-center justify-between gap-4 mb-6">
            <Input
          placeholder="Search by asset or organization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
              Delegate Access
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
              <DialogTitle>Delegate Access to Organization</DialogTitle>
                  <DialogDescription>
                Grant an organization access to a specific asset with defined permissions
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                <Label>Asset</Label>
                    <Select
                  value={newAccess.assetId}
                  onValueChange={(value) => {
                    setNewAccess(prev => ({ ...prev, assetId: value }))
                    const asset = getAvailableAssets().find(a => a.id === parseInt(value))
                    setSelectedAsset(asset || null)
                  }}
                    >
                      <SelectTrigger>
                    <SelectValue placeholder="Select an asset" />
                      </SelectTrigger>
                      <SelectContent>
                    {getAvailableAssets().map(asset => (
                      <SelectItem key={asset.id} value={asset.id.toString()}>
                        {asset.name} ({asset.type})
                      </SelectItem>
                    ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                <Label>Organization</Label>
                    <Select
                  value={newAccess.organizationId}
                  onValueChange={(value) => setNewAccess(prev => ({ ...prev, organizationId: value }))}
                    >
                      <SelectTrigger>
                    <SelectValue placeholder="Select an organization" />
                      </SelectTrigger>
                      <SelectContent>
                    {getAvailableOrgs().map(org => (
                          <SelectItem key={org.id} value={org.id.toString()}>
                        {org.name} ({org.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                <Label>Access Types</Label>
                <div className="border rounded-md p-3 space-y-2">
                  {Object.entries(accessTypeLabels).map(([key, { label, icon }]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                        checked={newAccess.accessTypes.includes(key as AccessType)}
                              onChange={(e) => {
                                if (e.target.checked) {
                            setNewAccess(prev => ({
                                    ...prev,
                              accessTypes: [...prev.accessTypes, key as AccessType],
                                  }))
                                } else {
                            setNewAccess(prev => ({
                                    ...prev,
                              accessTypes: prev.accessTypes.filter(t => t !== key),
                                  }))
                                }
                              }}
                              className="rounded"
                            />
                      <span className="flex items-center gap-2 text-sm">
                        {icon}
                        {label}
                      </span>
                          </label>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                  Select one or more access types to grant to this organization
                      </p>
              </div>
                </div>

                <DialogFooter>
              <Button variant="outline" onClick={() => {
                setDialogOpen(false)
                setNewAccess({ assetId: '', organizationId: '', accessTypes: [] })
                setSelectedAsset(null)
              }}>
                    Cancel
                  </Button>
                  <Button 
                onClick={handleCreateAccess}
                disabled={!newAccess.assetId || !newAccess.organizationId || newAccess.accessTypes.length === 0}
                  >
                Delegate Access
                  </Button>
                </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
            <DialogTitle>Edit Access Permissions</DialogTitle>
              <DialogDescription>
              Update access types for {editingRight && getOrgName(editingRight.publisherId)} on {selectedAsset?.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
              <Label>Access Types</Label>
              <div className="border rounded-md p-3 space-y-2">
                {Object.entries(accessTypeLabels).map(([key, { label, icon }]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                      checked={editAccess.accessTypes.includes(key as AccessType)}
                          onChange={(e) => {
                            if (e.target.checked) {
                          setEditAccess(prev => ({
                                ...prev,
                            accessTypes: [...prev.accessTypes, key as AccessType],
                              }))
                            } else {
                          setEditAccess(prev => ({
                                ...prev,
                            accessTypes: prev.accessTypes.filter(t => t !== key),
                              }))
                            }
                          }}
                          className="rounded"
                        />
                    <span className="flex items-center gap-2 text-sm">
                      {icon}
                      {label}
                    </span>
                      </label>
                    ))}
              </div>
            </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setEditDialogOpen(false)
                setEditingRight(null)
              setSelectedAsset(null)
              setEditAccess({
                  assetScope: 'ALL',
                  selectedAssets: [],
                accessTypes: [],
                })
              }}>
                Cancel
              </Button>
              <Button 
              onClick={handleUpdateAccess}
              disabled={editAccess.accessTypes.length === 0}
              >
              Update Access
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      {filteredAssetAccess.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <p className="text-sm">No access delegations found</p>
              <p className="text-xs mt-1">Delegate access to organizations to get started</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredAssetAccess.map(({ asset, rights }) => (
            <Card key={asset.id}>
            <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{asset.name}</CardTitle>
              <CardDescription>
                      {asset.type} • {rights.length} organization{rights.length !== 1 ? 's' : ''} with access
              </CardDescription>
                  </div>
                </div>
            </CardHeader>
            <CardContent>
                {rights.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8 border border-dashed rounded-lg">
                    No organizations have access to this asset
                </div>
              ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Organization</TableHead>
                        <TableHead>Access Types</TableHead>
                        <TableHead>Granted At</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rights.map((right) => (
                        <TableRow key={right.id}>
                          <TableCell className="font-medium">
                            {getOrgName(right.publisherId)}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              {getAccessTypes(right).map(type => (
                                <Badge key={type} variant="outline" className="text-xs">
                                  {accessTypeLabels[type].icon}
                                  <span className="ml-1">{accessTypeLabels[type].label}</span>
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {new Date(right.grantedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={right.status === 'Active' ? 'default' : 'destructive'}
                            >
                              {right.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {right.status === 'Active' && right.assetOwnerId === currentOrg?.id && (
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditAccess(right, asset)}
                                  title="Edit access"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRevokeAccess(right.id)}
                                  title="Revoke access"
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
              )}
            </CardContent>
          </Card>
          ))}
              </div>
      )}
    </div>
  )
}
