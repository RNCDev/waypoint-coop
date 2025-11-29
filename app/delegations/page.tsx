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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { motion } from 'framer-motion'
import { Edit, Settings } from 'lucide-react'
import { mockOrganizations, mockAssets } from '@/lib/mock-data'
import { DataType } from '@/types'

interface Delegation {
  id: string
  subscriberId: number
  delegateId: number
  assetScope: number[] | 'ALL'
  typeScope: string[] | 'ALL'
  status: string
  gpApprovalStatus?: string
  canManageSubscriptions?: boolean
}

const DATA_TYPES: DataType[] = [
  'CAPITAL_CALL',
  'DISTRIBUTION',
  'NAV_UPDATE',
  'QUARTERLY_REPORT',
  'K-1_TAX_FORM',
  'SOI_UPDATE',
  'LEGAL_NOTICE',
]

export default function DelegationsPage() {
  const router = useRouter()
  const { currentUser, currentOrg, _hasHydrated } = useAuthStore()
  const [delegations, setDelegations] = useState<Delegation[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingDelegation, setEditingDelegation] = useState<Delegation | null>(null)
  const [delegateEmail, setDelegateEmail] = useState('')
  const [selectedDelegateId, setSelectedDelegateId] = useState('')
  
  // Edit form state
  const [editAssetScope, setEditAssetScope] = useState<'ALL' | 'SELECTED'>('ALL')
  const [editSelectedAssets, setEditSelectedAssets] = useState<number[]>([])
  const [editTypeScope, setEditTypeScope] = useState<'ALL' | 'SELECTED'>('ALL')
  const [editSelectedTypes, setEditSelectedTypes] = useState<DataType[]>([])
  const [editCanManageSubscriptions, setEditCanManageSubscriptions] = useState(false)

  // Redirect if user doesn't have access to delegations
  // Only check after hydration is complete to avoid false redirects
  useEffect(() => {
    if (_hasHydrated && currentUser) {
      const { currentOrg } = useAuthStore.getState()
      const hasAccess = 
        currentUser.role === 'Limited Partner' || 
        currentUser.role === 'Analytics' || 
        currentUser.role === 'Auditor' ||
        currentOrg?.role === 'Delegate'
      if (!hasAccess) {
        router.push('/')
      }
    }
  }, [_hasHydrated, currentUser, router])

  const fetchDelegations = useCallback(async () => {
    try {
      // For Subscribers, fetch by subscriberId
      // For Delegates, fetch by delegateId
      if (currentOrg?.role === 'Delegate') {
        const response = await fetch(`/api/delegations?delegateId=${currentOrg.id}`, {
          headers: {
            'x-user-id': currentUser?.id.toString() || '',
          },
        })
        if (response.ok) {
          const data = await response.json()
          setDelegations(data)
        }
      } else {
        const subscriberId = currentUser?.orgId
        const response = await fetch(`/api/delegations?subscriberId=${subscriberId}`, {
          headers: {
            'x-user-id': currentUser?.id.toString() || '',
          },
        })
        if (response.ok) {
          const data = await response.json()
          setDelegations(data)
        }
      }
    } catch (error) {
      console.error('Error fetching delegations:', error)
    } finally {
      setLoading(false)
    }
  }, [currentUser, currentOrg])

  useEffect(() => {
    if (currentUser?.orgId || currentOrg?.id) {
      fetchDelegations()
    }
  }, [currentUser, currentOrg, fetchDelegations])

  const handleAddDelegate = async () => {
    if (!selectedDelegateId || !currentUser) return

    try {
      const response = await fetch('/api/delegations', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id.toString(),
        },
        body: JSON.stringify({
          subscriberId: currentUser.orgId,
          delegateId: parseInt(selectedDelegateId),
          assetScope: 'ALL',
          typeScope: 'ALL',
        }),
      })

      if (response.ok) {
        alert('Delegation request created. Waiting for GP approval.')
        setIsDialogOpen(false)
        setDelegateEmail('')
        setSelectedDelegateId('')
        fetchDelegations()
      } else {
        alert('Failed to create delegation')
      }
    } catch (error) {
      console.error('Error creating delegation:', error)
      alert('Error creating delegation')
    }
  }

  const handleEdit = (delegation: Delegation) => {
    setEditingDelegation(delegation)
    
    // Initialize edit form with delegation values
    if (delegation.assetScope === 'ALL') {
      setEditAssetScope('ALL')
      setEditSelectedAssets([])
    } else {
      setEditAssetScope('SELECTED')
      setEditSelectedAssets(delegation.assetScope as number[])
    }
    
    if (delegation.typeScope === 'ALL') {
      setEditTypeScope('ALL')
      setEditSelectedTypes([])
    } else {
      setEditTypeScope('SELECTED')
      setEditSelectedTypes(delegation.typeScope as DataType[])
    }
    
    setEditCanManageSubscriptions(delegation.canManageSubscriptions || false)
    setEditDialogOpen(true)
  }

  const handleUpdateDelegation = async () => {
    if (!editingDelegation || !currentUser) return

    try {
      const assetScope = editAssetScope === 'ALL' ? 'ALL' : editSelectedAssets
      const typeScope = editTypeScope === 'ALL' ? 'ALL' : editSelectedTypes

      const response = await fetch(`/api/delegations/${editingDelegation.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id.toString(),
        },
        body: JSON.stringify({
          assetScope,
          typeScope,
          canManageSubscriptions: editCanManageSubscriptions,
        }),
      })

      if (response.ok) {
        setEditDialogOpen(false)
        setEditingDelegation(null)
        fetchDelegations()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update delegation')
      }
    } catch (error) {
      console.error('Error updating delegation:', error)
      alert('Error updating delegation')
    }
  }

  const getDelegateName = (delegateId: number) => {
    return mockOrganizations.find(o => o.id === delegateId)?.name || `Delegate ${delegateId}`
  }

  const getSubscriberName = (subscriberId: number) => {
    return mockOrganizations.find(o => o.id === subscriberId)?.name || `Subscriber ${subscriberId}`
  }

  const getAvailableAssets = () => {
    if (!currentUser || !currentOrg) return []
    // For subscribers, show assets they're subscribed to
    // For now, show all assets - could be filtered based on subscriptions
    return mockAssets
  }

  const delegates = mockOrganizations.filter(o => o.role === 'Delegate')

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent leading-[1.2] pb-0.5">
            Delegations
          </h1>
          <p className="text-muted-foreground text-lg">
            {currentOrg?.role === 'Delegate' 
              ? 'View your delegations from subscribers'
              : 'Manage access to your data with other organizations'
            }
          </p>
        </div>
        {currentOrg?.role !== 'Delegate' && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add Delegate</Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Delegate</DialogTitle>
              <DialogDescription>
                Grant access to a third-party service provider
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Delegate Email</Label>
                <Input
                  placeholder="delegate@example.com"
                  value={delegateEmail}
                  onChange={(e) => setDelegateEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Select Delegate Organization</Label>
                <Select value={selectedDelegateId} onValueChange={setSelectedDelegateId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select delegate..." />
                  </SelectTrigger>
                  <SelectContent>
                    {delegates.map((delegate) => (
                      <SelectItem key={delegate.id} value={delegate.id.toString()}>
                        {delegate.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-muted-foreground">
                A magic link will be sent to the delegate email. GP approval is required.
              </div>
              <Button onClick={handleAddDelegate} className="w-full" disabled={!selectedDelegateId}>
                Create Delegation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        )}
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>{currentOrg?.role === 'Delegate' ? 'My Delegations' : 'My Delegates'}</CardTitle>
          <CardDescription>
            {currentOrg?.role === 'Delegate' 
              ? `${delegations.length} delegation${delegations.length !== 1 ? 's' : ''} (approved or pending)`
              : `${delegations.length} active delegation${delegations.length !== 1 ? 's' : ''}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{currentOrg?.role === 'Delegate' ? 'Subscriber' : 'Delegate'}</TableHead>
                <TableHead>Asset Scope</TableHead>
                <TableHead>Type Scope</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>GP Approval</TableHead>
                <TableHead>Subscription Management</TableHead>
                {currentOrg?.role !== 'Delegate' && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {delegations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={currentOrg?.role === 'Delegate' ? 6 : 7} className="text-center text-muted-foreground py-8">
                    No delegations found
                  </TableCell>
                </TableRow>
              ) : (
                delegations.map((delegation) => (
                  <TableRow key={delegation.id}>
                    <TableCell className="font-medium">
                      {currentOrg?.role === 'Delegate' 
                        ? getSubscriberName(delegation.subscriberId)
                        : getDelegateName(delegation.delegateId)
                      }
                    </TableCell>
                    <TableCell>
                      {delegation.assetScope === 'ALL' ? (
                        <Badge variant="outline">All Assets</Badge>
                      ) : (
                        <span className="text-sm">{delegation.assetScope.length} assets</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {delegation.typeScope === 'ALL' ? (
                        <Badge variant="outline">All Types</Badge>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {(delegation.typeScope as string[]).map((type) => (
                            <Badge key={type} variant="secondary" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          delegation.status === 'Active'
                            ? 'default'
                            : delegation.status === 'Pending GP Approval'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {delegation.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {delegation.gpApprovalStatus && (
                        <Badge
                          variant={
                            delegation.gpApprovalStatus === 'Approved'
                              ? 'default'
                              : delegation.gpApprovalStatus === 'Pending'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {delegation.gpApprovalStatus}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {delegation.canManageSubscriptions ? (
                        <Badge variant="default" className="gap-1">
                          <Settings className="w-3 h-3" />
                          Can Request & Approve
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">No</span>
                      )}
                    </TableCell>
                    {currentOrg?.role !== 'Delegate' && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(delegation)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Delegation</DialogTitle>
            <DialogDescription>
              Update the delegation scope and permissions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label>Asset Scope</Label>
              <Select value={editAssetScope} onValueChange={(value) => {
                setEditAssetScope(value as 'ALL' | 'SELECTED')
                if (value === 'ALL') {
                  setEditSelectedAssets([])
                }
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Assets</SelectItem>
                  <SelectItem value="SELECTED">Selected Assets</SelectItem>
                </SelectContent>
              </Select>
              {editAssetScope === 'SELECTED' && (
                <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                  {getAvailableAssets().map((asset) => (
                    <div key={asset.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`asset-${asset.id}`}
                        checked={editSelectedAssets.includes(asset.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setEditSelectedAssets([...editSelectedAssets, asset.id])
                          } else {
                            setEditSelectedAssets(editSelectedAssets.filter(id => id !== asset.id))
                          }
                        }}
                      />
                      <Label htmlFor={`asset-${asset.id}`} className="font-normal cursor-pointer">
                        {asset.name}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Type Scope</Label>
              <Select value={editTypeScope} onValueChange={(value) => {
                setEditTypeScope(value as 'ALL' | 'SELECTED')
                if (value === 'ALL') {
                  setEditSelectedTypes([])
                }
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="SELECTED">Selected Types</SelectItem>
                </SelectContent>
              </Select>
              {editTypeScope === 'SELECTED' && (
                <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                  {DATA_TYPES.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${type}`}
                        checked={editSelectedTypes.includes(type)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setEditSelectedTypes([...editSelectedTypes, type])
                          } else {
                            setEditSelectedTypes(editSelectedTypes.filter(t => t !== type))
                          }
                        }}
                      />
                      <Label htmlFor={`type-${type}`} className="font-normal cursor-pointer">
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="canManageSubscriptions"
                  checked={editCanManageSubscriptions}
                  onCheckedChange={(checked) => setEditCanManageSubscriptions(checked as boolean)}
                />
                <Label htmlFor="canManageSubscriptions" className="font-normal cursor-pointer">
                  Can request and approve subscriptions on behalf of subscriber
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                When enabled, this delegate can accept subscription invitations and request new subscriptions for the subscriber.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateDelegation}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
