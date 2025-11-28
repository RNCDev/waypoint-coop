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
import { Plus, Trash2, Edit, Building2, Check, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { Asset, Organization } from '@/types'
import { mockOrganizations } from '@/lib/mock-data'

export default function AssetsPage() {
  const router = useRouter()
  const { currentUser, currentOrg, _hasHydrated } = useAuthStore()
  const [assets, setAssets] = useState<Asset[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [newAsset, setNewAsset] = useState({
    name: '',
    type: 'Fund' as 'Fund' | 'Co-Investment' | 'SPV',
    publisherId: '',
    requireGPApprovalForDelegations: false,
  })
  const [editAsset, setEditAsset] = useState({
    name: '',
    type: 'Fund' as 'Fund' | 'Co-Investment' | 'SPV',
    publisherId: '',
    requireGPApprovalForDelegations: false,
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

  const fetchAssets = useCallback(async () => {
    if (!currentUser) return
    
    try {
      const response = await fetch('/api/assets', {
        headers: {
          'x-user-id': currentUser.id.toString(),
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAssets(data)
      }
    } catch (error) {
      console.error('Error fetching assets:', error)
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  useEffect(() => {
    if (currentUser) {
      fetchAssets()
    }
  }, [currentUser, fetchAssets])

  const handleCreateAsset = async () => {
    if (!currentUser || !currentOrg || !newAsset.name || !newAsset.publisherId) return

    try {
      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id.toString(),
        },
        body: JSON.stringify({
          name: newAsset.name,
          ownerId: currentOrg.id,
          publisherId: parseInt(newAsset.publisherId),
          type: newAsset.type,
          requireGPApprovalForDelegations: newAsset.requireGPApprovalForDelegations,
        }),
      })

      if (response.ok) {
        setDialogOpen(false)
        setNewAsset({
          name: '',
          type: 'Fund',
          publisherId: '',
          requireGPApprovalForDelegations: false,
        })
        fetchAssets()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create asset')
      }
    } catch (error) {
      console.error('Error creating asset:', error)
      alert('Error creating asset')
    }
  }

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset)
    setEditAsset({
      name: asset.name,
      type: asset.type as 'Fund' | 'Co-Investment' | 'SPV',
      publisherId: asset.publisherId.toString(),
      requireGPApprovalForDelegations: asset.requireGPApprovalForDelegations || false,
    })
    setEditDialogOpen(true)
  }

  const handleUpdateAsset = async () => {
    if (!currentUser || !editingAsset) return

    // Note: Update endpoint would need to be implemented
    // For now, we'll just show an alert
    alert('Asset update functionality coming soon. Currently, assets are immutable after creation.')
    setEditDialogOpen(false)
    setEditingAsset(null)
  }

  const handleDeleteAsset = async (id: number) => {
    if (!currentUser) return
    
    if (!confirm('Are you sure you want to delete this asset? This action cannot be undone.')) return

    // Note: Delete endpoint would need to be implemented
    alert('Asset deletion functionality coming soon.')
  }

  const getOrgName = (orgId: number) => {
    const org = mockOrganizations.find(o => o.id === orgId)
    return org?.name || `Org ${orgId}`
  }

  const getAvailablePublishers = () => {
    // Asset Owners can publish themselves or delegate to Publishers
    const publishers = mockOrganizations.filter(o => 
      o.role === 'Publisher' || (o.role === 'Asset Owner' && o.id === currentOrg?.id)
    )
    return publishers
  }

  const filteredAssets = assets.filter((asset) =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getOrgName(asset.publisherId).toLowerCase().includes(searchTerm.toLowerCase())
  )

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
          Asset Registry
        </h1>
        <p className="text-muted-foreground text-lg">
          Create and manage your fund assets and their attributes.
        </p>
      </motion.div>

      <div className="flex items-center justify-between gap-4 mb-6">
        <Input
          placeholder="Search by asset name, type, or publisher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Asset
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Asset</DialogTitle>
              <DialogDescription>
                Define a new fund, co-investment, or SPV asset
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Asset Name</Label>
                <Input
                  placeholder="e.g., Fund XVIII, Project SpaceX Co-Invest"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Asset Type</Label>
                <Select
                  value={newAsset.type}
                  onValueChange={(value) => setNewAsset(prev => ({ 
                    ...prev, 
                    type: value as 'Fund' | 'Co-Investment' | 'SPV' 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fund">Fund</SelectItem>
                    <SelectItem value="Co-Investment">Co-Investment</SelectItem>
                    <SelectItem value="SPV">SPV</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Publisher</Label>
                <Select
                  value={newAsset.publisherId}
                  onValueChange={(value) => setNewAsset(prev => ({ ...prev, publisherId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select publisher organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailablePublishers().map(org => (
                      <SelectItem key={org.id} value={org.id.toString()}>
                        {org.name} {org.id === currentOrg?.id ? '(Self)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  The organization that will publish data for this asset
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="requireGPApproval"
                  checked={newAsset.requireGPApprovalForDelegations}
                  onChange={(e) => setNewAsset(prev => ({
                    ...prev,
                    requireGPApprovalForDelegations: e.target.checked,
                  }))}
                  className="rounded"
                />
                <Label htmlFor="requireGPApproval" className="cursor-pointer">
                  Require GP approval for LP delegations
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                If enabled, LPs must get your approval before delegating access to service providers for this asset
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setDialogOpen(false)
                setNewAsset({
                  name: '',
                  type: 'Fund',
                  publisherId: '',
                  requireGPApprovalForDelegations: false,
                })
              }}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateAsset}
                disabled={!newAsset.name || !newAsset.publisherId}
              >
                Create Asset
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Asset</DialogTitle>
            <DialogDescription>
              Update asset attributes and configuration
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Asset Name</Label>
              <Input
                value={editAsset.name}
                onChange={(e) => setEditAsset(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Asset Type</Label>
              <Select
                value={editAsset.type}
                onValueChange={(value) => setEditAsset(prev => ({ 
                  ...prev, 
                  type: value as 'Fund' | 'Co-Investment' | 'SPV' 
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fund">Fund</SelectItem>
                  <SelectItem value="Co-Investment">Co-Investment</SelectItem>
                  <SelectItem value="SPV">SPV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Publisher</Label>
              <Select
                value={editAsset.publisherId}
                onValueChange={(value) => setEditAsset(prev => ({ ...prev, publisherId: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getAvailablePublishers().map(org => (
                    <SelectItem key={org.id} value={org.id.toString()}>
                      {org.name} {org.id === currentOrg?.id ? '(Self)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="editRequireGPApproval"
                checked={editAsset.requireGPApprovalForDelegations}
                onChange={(e) => setEditAsset(prev => ({
                  ...prev,
                  requireGPApprovalForDelegations: e.target.checked,
                }))}
                className="rounded"
              />
              <Label htmlFor="editRequireGPApproval" className="cursor-pointer">
                Require GP approval for LP delegations
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setEditDialogOpen(false)
              setEditingAsset(null)
              setEditAsset({
                name: '',
                type: 'Fund',
                publisherId: '',
                requireGPApprovalForDelegations: false,
              })
            }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateAsset}>
              Update Asset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Assets</CardTitle>
          <CardDescription>
            {filteredAssets.length} asset{filteredAssets.length !== 1 ? 's' : ''} registered
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAssets.length === 0 ? (
            <div className="text-center text-muted-foreground py-12 border border-dashed rounded-lg">
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No assets found</p>
              <p className="text-xs mt-1">Create your first asset to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>GP Approval Required</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell className="font-mono text-sm">{asset.id}</TableCell>
                    <TableCell className="font-medium">{asset.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{asset.type}</Badge>
                    </TableCell>
                    <TableCell>
                      {asset.requireGPApprovalForDelegations ? (
                        <Badge variant="default" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                          <Check className="w-3 h-3 mr-1" />
                          Required
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          <X className="w-3 h-3 mr-1" />
                          Not Required
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditAsset(asset)}
                          title="Edit asset"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteAsset(asset.id)}
                          title="Delete asset"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
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

