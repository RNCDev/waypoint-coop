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
import { Checkbox } from '@/components/ui/checkbox'
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
import { Plus, Trash2, Check, X, Shield, Eye, Send, Users, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { AccessGrant, DataType, Organization } from '@/types'
import { mockAssets, mockOrganizations } from '@/lib/mock-data'

const DATA_TYPES: DataType[] = [
  'CAPITAL_CALL',
  'DISTRIBUTION',
  'NAV_UPDATE',
  'QUARTERLY_REPORT',
  'K-1_TAX_FORM',
  'SOI_UPDATE',
  'LEGAL_NOTICE',
]

export default function AccessGrantsPage() {
  const router = useRouter()
  const { currentUser, currentOrg, _hasHydrated } = useAuthStore()
  const [accessGrants, setAccessGrants] = useState<AccessGrant[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'gp' | 'lp'>('all')
  
  // Form state for creating new grants
  const [newGrant, setNewGrant] = useState({
    granteeId: '',
    assetScope: 'ALL' as 'ALL' | 'SELECTED',
    selectedAssets: [] as number[],
    dataTypeScope: 'ALL' as 'ALL' | 'SELECTED',
    selectedTypes: [] as DataType[],
    canPublish: false,
    canViewData: true,
    canManageSubscriptions: false,
    canApproveSubscriptions: false,
    canApproveDelegations: false,
  })

  // Redirect if user doesn't have access
  useEffect(() => {
    if (_hasHydrated && currentUser && currentOrg) {
      const hasAccess = 
        currentOrg.role === 'Asset Manager' || 
        currentOrg.role === 'Limited Partner' ||
        currentOrg.role === 'Delegate' ||
        currentOrg.role === 'Platform Admin'
      if (!hasAccess) {
        router.push('/')
      }
    }
  }, [_hasHydrated, currentUser, currentOrg, router])

  const fetchAccessGrants = useCallback(async () => {
    if (!currentUser) return
    
    try {
      const response = await fetch('/api/access-grants', {
        headers: {
          'x-user-id': currentUser.id.toString(),
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAccessGrants(data)
      }
    } catch (error) {
      console.error('Error fetching access grants:', error)
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  useEffect(() => {
    fetchAccessGrants()
  }, [fetchAccessGrants])

  const handleCreateGrant = async () => {
    if (!currentUser || !newGrant.granteeId) return

    try {
      const response = await fetch('/api/access-grants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id.toString(),
        },
        body: JSON.stringify({
          granteeId: parseInt(newGrant.granteeId),
          assetScope: newGrant.assetScope === 'ALL' ? 'ALL' : newGrant.selectedAssets,
          dataTypeScope: newGrant.dataTypeScope === 'ALL' ? 'ALL' : newGrant.selectedTypes,
          canPublish: newGrant.canPublish,
          canViewData: newGrant.canViewData,
          canManageSubscriptions: newGrant.canManageSubscriptions,
          canApproveSubscriptions: newGrant.canApproveSubscriptions,
          canApproveDelegations: newGrant.canApproveDelegations,
        }),
      })

      if (response.ok) {
        setDialogOpen(false)
        resetForm()
        fetchAccessGrants()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create access grant')
      }
    } catch (error) {
      console.error('Error creating access grant:', error)
    }
  }

  const resetForm = () => {
    setNewGrant({
      granteeId: '',
      assetScope: 'ALL',
      selectedAssets: [],
      dataTypeScope: 'ALL',
      selectedTypes: [],
      canPublish: false,
      canViewData: true,
      canManageSubscriptions: false,
      canApproveSubscriptions: false,
      canApproveDelegations: false,
    })
  }

  const handleRevokeGrant = async (id: string) => {
    if (!currentUser) return
    
    if (!confirm('Are you sure you want to revoke this access grant?')) return

    try {
      const response = await fetch(`/api/access-grants/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': currentUser.id.toString(),
        },
      })

      if (response.ok) {
        fetchAccessGrants()
      }
    } catch (error) {
      console.error('Error revoking access grant:', error)
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

  const getOrgRole = (orgId: number): string => {
    const org = mockOrganizations.find(o => o.id === orgId)
    return org?.role || 'Unknown'
  }

  // Get available grantees (Delegates for GP grants, any Delegate for LP grants)
  const getAvailableGrantees = (): Organization[] => {
    return mockOrganizations.filter(o => o.role === 'Delegate')
  }

  // Get available assets based on user role
  const getAvailableAssets = () => {
    if (!currentOrg) return []
    if (currentOrg.role === 'Platform Admin') return mockAssets
    if (currentOrg.role === 'Asset Manager') {
      return mockAssets.filter(a => a.ownerId === currentOrg.id)
    }
    // For LPs, show assets they have subscriptions to (in real app, fetch from subscriptions)
    return mockAssets
  }

  // Filter grants based on tab and search
  const filteredGrants = accessGrants.filter((grant) => {
    // Tab filter
    if (activeTab === 'gp' && !grant.canPublish) return false
    if (activeTab === 'lp' && grant.canPublish) return false
    
    // Search filter
    const grantorName = getOrgName(grant.grantorId).toLowerCase()
    const granteeName = getOrgName(grant.granteeId).toLowerCase()
    return grantorName.includes(searchTerm.toLowerCase()) || 
           granteeName.includes(searchTerm.toLowerCase())
  })

  // Determine if user can create grants
  const canCreateGrants = 
    currentOrg?.role === 'Asset Manager' || 
    currentOrg?.role === 'Limited Partner' ||
    currentOrg?.role === 'Platform Admin'

  // Determine if user can revoke a specific grant
  const canRevokeGrant = (grant: AccessGrant) => {
    if (!currentOrg) return false
    if (currentOrg.role === 'Platform Admin') return true
    return grant.grantorId === currentOrg.id
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
          Access Grants
        </h1>
        <p className="text-muted-foreground text-lg">
          {currentOrg?.role === 'Asset Manager' && 'Grant publishing rights and data access to delegates'}
          {currentOrg?.role === 'Limited Partner' && 'Manage data access delegations to service providers'}
          {currentOrg?.role === 'Delegate' && 'View access grants from Asset Managers and Limited Partners'}
          {currentOrg?.role === 'Platform Admin' && 'View all access grants in the platform'}
        </p>
      </motion.div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 flex-1">
          <Input
            placeholder="Search by organization name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'gp' | 'lp')}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="gp">Publishing Rights</TabsTrigger>
              <TabsTrigger value="lp">Data Access</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {canCreateGrants && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Access Grant
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Access Grant</DialogTitle>
                <DialogDescription>
                  {currentOrg?.role === 'Asset Manager' 
                    ? 'Grant capabilities to a delegate organization'
                    : 'Delegate data access to a service provider'
                  }
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Grantee Selection */}
                <div className="space-y-2">
                  <Label>Grantee (Delegate Organization)</Label>
                  <Select
                    value={newGrant.granteeId}
                    onValueChange={(value) => setNewGrant(prev => ({ ...prev, granteeId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a delegate organization" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableGrantees().map(org => (
                        <SelectItem key={org.id} value={org.id.toString()}>
                          {org.name} ({org.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Asset Scope */}
                <div className="space-y-2">
                  <Label>Asset Scope</Label>
                  <Select
                    value={newGrant.assetScope}
                    onValueChange={(value) => setNewGrant(prev => ({
                      ...prev,
                      assetScope: value as 'ALL' | 'SELECTED',
                      selectedAssets: value === 'ALL' ? [] : prev.selectedAssets,
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Assets</SelectItem>
                      <SelectItem value="SELECTED">Specific Assets</SelectItem>
                    </SelectContent>
                  </Select>
                  {newGrant.assetScope === 'SELECTED' && (
                    <div className="border rounded-md p-3 max-h-32 overflow-y-auto space-y-2">
                      {getAvailableAssets().map(asset => (
                        <div key={asset.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`asset-${asset.id}`}
                            checked={newGrant.selectedAssets.includes(asset.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewGrant(prev => ({
                                  ...prev,
                                  selectedAssets: [...prev.selectedAssets, asset.id],
                                }))
                              } else {
                                setNewGrant(prev => ({
                                  ...prev,
                                  selectedAssets: prev.selectedAssets.filter(id => id !== asset.id),
                                }))
                              }
                            }}
                          />
                          <Label htmlFor={`asset-${asset.id}`} className="font-normal cursor-pointer">
                            {asset.name} ({asset.type})
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Data Type Scope */}
                <div className="space-y-2">
                  <Label>Data Type Scope</Label>
                  <Select
                    value={newGrant.dataTypeScope}
                    onValueChange={(value) => setNewGrant(prev => ({
                      ...prev,
                      dataTypeScope: value as 'ALL' | 'SELECTED',
                      selectedTypes: value === 'ALL' ? [] : prev.selectedTypes,
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Data Types</SelectItem>
                      <SelectItem value="SELECTED">Specific Types</SelectItem>
                    </SelectContent>
                  </Select>
                  {newGrant.dataTypeScope === 'SELECTED' && (
                    <div className="border rounded-md p-3 max-h-32 overflow-y-auto space-y-2">
                      {DATA_TYPES.map(type => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={`type-${type}`}
                            checked={newGrant.selectedTypes.includes(type)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewGrant(prev => ({
                                  ...prev,
                                  selectedTypes: [...prev.selectedTypes, type],
                                }))
                              } else {
                                setNewGrant(prev => ({
                                  ...prev,
                                  selectedTypes: prev.selectedTypes.filter(t => t !== type),
                                }))
                              }
                            }}
                          />
                          <Label htmlFor={`type-${type}`} className="font-normal cursor-pointer">
                            {type.replace(/_/g, ' ')}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Capabilities */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Capabilities</Label>
                  
                  {currentOrg?.role === 'Asset Manager' && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="canPublish"
                        checked={newGrant.canPublish}
                        onCheckedChange={(checked) => setNewGrant(prev => ({
                          ...prev,
                          canPublish: checked as boolean,
                        }))}
                      />
                      <Label htmlFor="canPublish" className="font-normal cursor-pointer flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        Can Publish Data
                      </Label>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="canViewData"
                      checked={newGrant.canViewData}
                      onCheckedChange={(checked) => setNewGrant(prev => ({
                        ...prev,
                        canViewData: checked as boolean,
                      }))}
                    />
                    <Label htmlFor="canViewData" className="font-normal cursor-pointer flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Can View Data
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="canManageSubscriptions"
                      checked={newGrant.canManageSubscriptions}
                      onCheckedChange={(checked) => setNewGrant(prev => ({
                        ...prev,
                        canManageSubscriptions: checked as boolean,
                      }))}
                    />
                    <Label htmlFor="canManageSubscriptions" className="font-normal cursor-pointer flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Can Manage Subscriptions
                    </Label>
                  </div>

                  {currentOrg?.role === 'Asset Manager' && newGrant.canPublish && (
                    <>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="canApproveSubscriptions"
                          checked={newGrant.canApproveSubscriptions}
                          onCheckedChange={(checked) => setNewGrant(prev => ({
                            ...prev,
                            canApproveSubscriptions: checked as boolean,
                          }))}
                        />
                        <Label htmlFor="canApproveSubscriptions" className="font-normal cursor-pointer flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Can Approve Subscription Requests
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="canApproveDelegations"
                          checked={newGrant.canApproveDelegations}
                          onCheckedChange={(checked) => setNewGrant(prev => ({
                            ...prev,
                            canApproveDelegations: checked as boolean,
                          }))}
                        />
                        <Label htmlFor="canApproveDelegations" className="font-normal cursor-pointer flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Can Approve LP Data Delegations
                        </Label>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateGrant}
                  disabled={!newGrant.granteeId || (newGrant.assetScope === 'SELECTED' && newGrant.selectedAssets.length === 0)}
                >
                  Create Grant
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {activeTab === 'all' && 'All Access Grants'}
            {activeTab === 'gp' && 'Publishing Rights (GP Grants)'}
            {activeTab === 'lp' && 'Data Access (LP Grants)'}
          </CardTitle>
          <CardDescription>
            {filteredGrants.length} access grant{filteredGrants.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredGrants.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              No access grants found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Grantor</TableHead>
                  <TableHead>Grantee</TableHead>
                  <TableHead>Assets</TableHead>
                  <TableHead>Capabilities</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGrants.map((grant) => (
                  <TableRow key={grant.id}>
                    <TableCell>
                      <Badge variant={grant.canPublish ? 'default' : 'secondary'}>
                        {grant.canPublish ? 'GP Grant' : 'LP Grant'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>
                        {getOrgName(grant.grantorId)}
                        <div className="text-xs text-muted-foreground">
                          {getOrgRole(grant.grantorId)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        {getOrgName(grant.granteeId)}
                        <div className="text-xs text-muted-foreground">
                          {getOrgRole(grant.granteeId)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[150px]">
                      <span className="truncate block" title={getAssetNames(grant.assetScope)}>
                        {grant.assetScope === 'ALL' ? (
                          <Badge variant="outline">All Assets</Badge>
                        ) : (
                          `${grant.assetScope.length} asset${grant.assetScope.length !== 1 ? 's' : ''}`
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {grant.canPublish && (
                          <Badge variant="outline" className="gap-1 text-xs">
                            <Send className="w-3 h-3" /> Publish
                          </Badge>
                        )}
                        {grant.canViewData && (
                          <Badge variant="outline" className="gap-1 text-xs">
                            <Eye className="w-3 h-3" /> View
                          </Badge>
                        )}
                        {grant.canManageSubscriptions && (
                          <Badge variant="outline" className="gap-1 text-xs">
                            <Users className="w-3 h-3" /> Subs
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          grant.status === 'Active' ? 'default' : 
                          grant.status === 'Pending Approval' ? 'secondary' : 
                          'destructive'
                        }
                      >
                        {grant.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {grant.status === 'Active' && canRevokeGrant(grant) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRevokeGrant(grant.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
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

