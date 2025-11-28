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
import { Plus, Trash2, Check, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { PublishingRight, Asset, Organization } from '@/types'
import { mockAssets, mockOrganizations } from '@/lib/mock-data'

export default function PublishingRightsPage() {
  const router = useRouter()
  const { currentUser, currentOrg, _hasHydrated } = useAuthStore()
  const [publishingRights, setPublishingRights] = useState<PublishingRight[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newRight, setNewRight] = useState({
    publisherId: '',
    assetScope: 'ALL' as 'ALL' | number[],
    selectedAssets: [] as number[],
    canManageSubscriptions: false,
  })

  // Redirect if user doesn't have access
  useEffect(() => {
    if (_hasHydrated && currentUser && currentOrg) {
      const hasAccess = 
        currentOrg.role === 'Asset Owner' || 
        currentOrg.role === 'Publisher' ||
        currentOrg.role === 'Platform Admin'
      if (!hasAccess) {
        router.push('/')
      }
    }
  }, [_hasHydrated, currentUser, currentOrg, router])

  useEffect(() => {
    fetchPublishingRights()
  }, [currentUser])

  const fetchPublishingRights = async () => {
    if (!currentUser) return
    
    try {
      const response = await fetch('/api/publishing-rights', {
        headers: {
          'x-user-id': currentUser.id.toString(),
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPublishingRights(data)
      }
    } catch (error) {
      console.error('Error fetching publishing rights:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRight = async () => {
    if (!currentUser || !newRight.publisherId) return

    try {
      const response = await fetch('/api/publishing-rights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id.toString(),
        },
        body: JSON.stringify({
          publisherId: parseInt(newRight.publisherId),
          assetScope: newRight.assetScope === 'ALL' ? 'ALL' : newRight.selectedAssets,
          canManageSubscriptions: newRight.canManageSubscriptions,
        }),
      })

      if (response.ok) {
        setDialogOpen(false)
        setNewRight({
          publisherId: '',
          assetScope: 'ALL',
          selectedAssets: [],
          canManageSubscriptions: false,
        })
        fetchPublishingRights()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create publishing right')
      }
    } catch (error) {
      console.error('Error creating publishing right:', error)
    }
  }

  const handleRevokeRight = async (id: string) => {
    if (!currentUser) return
    
    if (!confirm('Are you sure you want to revoke this publishing right?')) return

    try {
      const response = await fetch(`/api/publishing-rights/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': currentUser.id.toString(),
        },
      })

      if (response.ok) {
        fetchPublishingRights()
      }
    } catch (error) {
      console.error('Error revoking publishing right:', error)
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

  // Get available publishers (Fund Admins)
  const getAvailablePublishers = () => {
    return mockOrganizations.filter(o => o.role === 'Publisher')
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

  // Only Asset Owners can create publishing rights
  const canCreateRights = currentOrg?.role === 'Asset Owner' || currentOrg?.role === 'Platform Admin'

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
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Publishing Rights
        </h1>
        <p className="text-muted-foreground text-lg">
          {canCreateRights 
            ? 'Grant fund administrators the right to publish on your behalf'
            : 'View publishing rights granted to your organization'
          }
        </p>
      </motion.div>

      <div className="flex items-center justify-between gap-4 mb-6">
        <Input
          placeholder="Search by publisher or asset owner..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />

        {canCreateRights && (
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
                  Authorize a fund administrator to publish data on behalf of your organization
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Fund Administrator</Label>
                  <Select
                    value={newRight.publisherId}
                    onValueChange={(value) => setNewRight(prev => ({ ...prev, publisherId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a fund administrator" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailablePublishers().map(org => (
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
                  If enabled, the fund administrator can also add/remove LP subscriptions
                </p>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateRight}
                  disabled={!newRight.publisherId || (newRight.assetScope !== 'ALL' && newRight.selectedAssets.length === 0)}
                >
                  Grant Rights
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Publishing Rights</CardTitle>
          <CardDescription>
            {filteredRights.length} publishing right{filteredRights.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRights.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              No publishing rights found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Publisher</TableHead>
                  <TableHead>Asset Owner</TableHead>
                  <TableHead>Assets</TableHead>
                  <TableHead>Can Manage Subs</TableHead>
                  <TableHead>Granted At</TableHead>
                  <TableHead>Status</TableHead>
                  {canCreateRights && <TableHead className="w-[80px]">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRights.map((right) => (
                  <TableRow key={right.id}>
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
                    {canCreateRights && (
                      <TableCell>
                        {right.status === 'Active' && right.assetOwnerId === currentOrg?.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRevokeRight(right.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

