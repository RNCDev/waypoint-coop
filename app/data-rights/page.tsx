'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { Plus, Trash2, Check, X, Building2, FileText, Edit } from 'lucide-react'
import { motion } from 'framer-motion'
import { PublishingRight, Asset, Organization } from '@/types'
import { mockAssets, mockOrganizations } from '@/lib/mock-data'

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
  const [activeTab, setActiveTab] = useState('publishing')
  const [newRight, setNewRight] = useState({
    organizationId: '',
    organizationType: 'Publisher' as 'Publisher' | 'Delegate' | 'Subscriber',
    assetScope: 'ALL' as 'ALL' | number[],
    selectedAssets: [] as number[],
    canManageSubscriptions: false,
    canPublish: true,
    canView: true,
  })
  const [editRight, setEditRight] = useState({
    assetScope: 'ALL' as 'ALL' | number[],
    selectedAssets: [] as number[],
    canManageSubscriptions: false,
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

  useEffect(() => {
    if (currentUser) {
      fetchData()
    }
  }, [currentUser])

  const fetchData = async () => {
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
  }

  const handleCreateRight = async () => {
    if (!currentUser || !newRight.organizationId) return

    // For now, only handle Publishing Rights (Publisher orgs)
    // In the future, this could create other types of data rights
    if (newRight.organizationType === 'Publisher') {
      try {
        const response = await fetch('/api/publishing-rights', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': currentUser.id.toString(),
          },
          body: JSON.stringify({
            publisherId: parseInt(newRight.organizationId),
            assetScope: newRight.assetScope === 'ALL' ? 'ALL' : newRight.selectedAssets,
            canManageSubscriptions: newRight.canManageSubscriptions,
          }),
        })

        if (response.ok) {
          setDialogOpen(false)
          setNewRight({
            organizationId: '',
            organizationType: 'Publisher',
            assetScope: 'ALL',
            selectedAssets: [],
            canManageSubscriptions: false,
            canPublish: true,
            canView: true,
          })
          fetchData()
        } else {
          const error = await response.json()
          alert(error.error || 'Failed to create data right')
        }
      } catch (error) {
        console.error('Error creating data right:', error)
      }
    }
  }

  const handleEditRight = (right: PublishingRight) => {
    setEditingRight(right)
    // Parse assetScope - it can be 'ALL', array, or JSON string
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
    
    setEditRight({
      assetScope: parsedScope,
      selectedAssets: parsedScope === 'ALL' ? [] : parsedScope,
      canManageSubscriptions: right.canManageSubscriptions,
    })
    setEditDialogOpen(true)
  }

  const handleUpdateRight = async () => {
    if (!currentUser || !editingRight) return

    try {
      const response = await fetch(`/api/publishing-rights/${editingRight.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id.toString(),
        },
        body: JSON.stringify({
          assetScope: editRight.assetScope === 'ALL' ? 'ALL' : editRight.selectedAssets,
          canManageSubscriptions: editRight.canManageSubscriptions,
        }),
      })

      if (response.ok) {
        setEditDialogOpen(false)
        setEditingRight(null)
        setEditRight({
          assetScope: 'ALL',
          selectedAssets: [],
          canManageSubscriptions: false,
        })
        fetchData()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update publishing right')
      }
    } catch (error) {
      console.error('Error updating publishing right:', error)
    }
  }

  const handleRevokeRight = async (id: string) => {
    if (!currentUser) return
    
    if (!confirm('Are you sure you want to revoke this data right?')) return

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
      console.error('Error revoking data right:', error)
    }
  }

  const getAssetNames = (assetScope: number[] | 'ALL') => {
    if (assetScope === 'ALL') return 'All Assets'
    return assetScope.map(id => {
      const asset = mockAssets.find(a => a.id === id)
      return asset?.name || `Asset ${id}`
    }).join(', ')
  }

  const getOrgName = (orgId: number) => {
    const org = mockOrganizations.find(o => o.id === orgId)
    return org?.name || `Org ${orgId}`
  }

  // Get available organizations by type
  const getAvailableOrgs = (type: 'Publisher' | 'Delegate' | 'Subscriber') => {
    return mockOrganizations.filter(o => o.role === type)
  }

  // Get available assets for current GP
  const getAvailableAssets = () => {
    if (!currentOrg) return []
    if (currentOrg.role === 'Platform Admin') return mockAssets
    return mockAssets.filter(a => a.ownerId === currentOrg.id)
  }

  const filteredRights = publishingRights.filter((right) => {
    const publisherName = getOrgName(right.publisherId).toLowerCase()
    const assetOwnerName = getOrgName(right.assetOwnerId).toLowerCase()
    return publisherName.includes(searchTerm.toLowerCase()) || 
           assetOwnerName.includes(searchTerm.toLowerCase())
  })

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
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Data Rights
        </h1>
        <p className="text-muted-foreground text-lg">
          Grant organizations access to view, use, or publish data for your assets
        </p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="publishing">
            <FileText className="w-4 h-4 mr-2" />
            Publishing Rights
          </TabsTrigger>
          <TabsTrigger value="access">
            <Building2 className="w-4 h-4 mr-2" />
            Access Rights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="publishing" className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <Input
              placeholder="Search by organization or asset owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Grant Publishing Rights
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Grant Publishing Rights</DialogTitle>
                  <DialogDescription>
                    Authorize an organization to publish data on behalf of your assets
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Organization Type</Label>
                    <Select
                      value={newRight.organizationType}
                      onValueChange={(value) => setNewRight(prev => ({ 
                        ...prev, 
                        organizationType: value as 'Publisher' | 'Delegate' | 'Subscriber',
                        organizationId: '',
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Publisher">Fund Administrator</SelectItem>
                        <SelectItem value="Delegate">Service Provider</SelectItem>
                        <SelectItem value="Subscriber">Limited Partner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>
                      {newRight.organizationType === 'Publisher' ? 'Fund Administrator' :
                       newRight.organizationType === 'Delegate' ? 'Service Provider' :
                       'Limited Partner'}
                    </Label>
                    <Select
                      value={newRight.organizationId}
                      onValueChange={(value) => setNewRight(prev => ({ ...prev, organizationId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Select a ${newRight.organizationType === 'Publisher' ? 'fund administrator' : newRight.organizationType === 'Delegate' ? 'service provider' : 'limited partner'}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableOrgs(newRight.organizationType).map(org => (
                          <SelectItem key={org.id} value={org.id.toString()}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Asset Scope</Label>
                    <Select
                      value={newRight.assetScope === 'ALL' ? 'ALL' : 'SPECIFIC'}
                      onValueChange={(value) => setNewRight(prev => ({
                        ...prev,
                        assetScope: value === 'ALL' ? 'ALL' : [],
                        selectedAssets: [],
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Assets</SelectItem>
                        <SelectItem value="SPECIFIC">Specific Assets</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newRight.assetScope !== 'ALL' && (
                    <div className="space-y-2">
                      <Label>Select Assets</Label>
                      <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                        {getAvailableAssets().map(asset => (
                          <label key={asset.id} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newRight.selectedAssets.includes(asset.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewRight(prev => ({
                                    ...prev,
                                    selectedAssets: [...prev.selectedAssets, asset.id],
                                  }))
                                } else {
                                  setNewRight(prev => ({
                                    ...prev,
                                    selectedAssets: prev.selectedAssets.filter(id => id !== asset.id),
                                  }))
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-sm">{asset.name} ({asset.type})</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {newRight.organizationType === 'Publisher' && (
                    <>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="canManageSubscriptions"
                          checked={newRight.canManageSubscriptions}
                          onChange={(e) => setNewRight(prev => ({
                            ...prev,
                            canManageSubscriptions: e.target.checked,
                          }))}
                          className="rounded"
                        />
                        <Label htmlFor="canManageSubscriptions" className="cursor-pointer">
                          Allow subscription management
                        </Label>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        If enabled, the organization can also add/remove LP subscriptions
                      </p>
                    </>
                  )}
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateRight}
                    disabled={!newRight.organizationId || (newRight.assetScope !== 'ALL' && newRight.selectedAssets.length === 0)}
                  >
                    Grant Rights
                  </Button>
                </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Publishing Rights</DialogTitle>
              <DialogDescription>
                Update asset scope and permissions for {editingRight && getOrgName(editingRight.publisherId)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Asset Scope</Label>
                <Select
                  value={editRight.assetScope === 'ALL' ? 'ALL' : 'SPECIFIC'}
                  onValueChange={(value) => setEditRight(prev => ({
                    ...prev,
                    assetScope: value === 'ALL' ? 'ALL' : [],
                    selectedAssets: [],
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Assets</SelectItem>
                    <SelectItem value="SPECIFIC">Specific Assets</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editRight.assetScope !== 'ALL' && (
                <div className="space-y-2">
                  <Label>Select Assets</Label>
                  <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                    {getAvailableAssets().map(asset => (
                      <label key={asset.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editRight.selectedAssets.includes(asset.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditRight(prev => ({
                                ...prev,
                                selectedAssets: [...prev.selectedAssets, asset.id],
                              }))
                            } else {
                              setEditRight(prev => ({
                                ...prev,
                                selectedAssets: prev.selectedAssets.filter(id => id !== asset.id),
                              }))
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{asset.name} ({asset.type})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editCanManageSubscriptions"
                  checked={editRight.canManageSubscriptions}
                  onChange={(e) => setEditRight(prev => ({
                    ...prev,
                    canManageSubscriptions: e.target.checked,
                  }))}
                  className="rounded"
                />
                <Label htmlFor="editCanManageSubscriptions" className="cursor-pointer">
                  Allow subscription management
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                If enabled, the organization can also add/remove LP subscriptions
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setEditDialogOpen(false)
                setEditingRight(null)
                setEditRight({
                  assetScope: 'ALL',
                  selectedAssets: [],
                  canManageSubscriptions: false,
                })
              }}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateRight}
                disabled={editRight.assetScope !== 'ALL' && editRight.selectedAssets.length === 0}
              >
                Update Rights
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Card>
            <CardHeader>
              <CardTitle>Publishing Rights</CardTitle>
              <CardDescription>
                {filteredRights.length} publishing right{filteredRights.length !== 1 ? 's' : ''} granted
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredRights.length === 0 ? (
                <div className="text-center text-muted-foreground py-12 border border-dashed rounded-lg">
                  No publishing rights granted yet
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Organization</TableHead>
                        <TableHead>Asset Owner</TableHead>
                        <TableHead>Assets</TableHead>
                        <TableHead>Can Manage Subs</TableHead>
                        <TableHead>Granted At</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRights.map((right) => (
                        <TableRow key={right.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            {getOrgName(right.publisherId)}
                          </TableCell>
                          <TableCell>{getOrgName(right.assetOwnerId)}</TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {getAssetNames(right.assetScope)}
                          </TableCell>
                          <TableCell>
                            {right.canManageSubscriptions ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <X className="w-4 h-4 text-muted-foreground" />
                            )}
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
                                  onClick={() => handleEditRight(right)}
                                  title="Edit publishing rights"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRevokeRight(right.id)}
                                  title="Revoke publishing rights"
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
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Access Rights</CardTitle>
              <CardDescription>
                Grant organizations view-only or read-write access to your assets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-12 border border-dashed rounded-lg">
                <p className="text-sm">Access rights management coming soon</p>
                <p className="text-xs mt-1">This will allow you to grant view or use rights to service providers, auditors, and other organizations</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

