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
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, Mail, Check, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { Subscription, Asset, Organization } from '@/types'
import { mockAssets, mockOrganizations, mockSubscriptions } from '@/lib/mock-data'
import { getAccessibleAssets } from '@/lib/permissions'

export default function SubscriptionsPage() {
  const router = useRouter()
  const { currentUser, currentOrg, _hasHydrated } = useAuthStore()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newSubscription, setNewSubscription] = useState({
    assetId: '',
    subscriberId: '',
    expiresAt: '',
    inviteMessage: '',
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
    fetchSubscriptions()
  }, [currentUser])

  const fetchSubscriptions = async () => {
    if (!currentUser) return
    
    try {
      const response = await fetch('/api/subscriptions', {
        headers: {
          'x-user-id': currentUser.id.toString(),
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSubscriptions(data)
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSubscription = async () => {
    if (!currentUser || !currentOrg || !newSubscription.assetId || !newSubscription.subscriberId) return

    // Create the subscription directly in mock data (for demo)
    const subscriptionId = `S-${Date.now()}`
    const timestamp = new Date().toISOString()
    
    const subscription: Subscription = {
      id: subscriptionId,
      assetId: parseInt(newSubscription.assetId),
      subscriberId: parseInt(newSubscription.subscriberId),
      grantedById: currentOrg.id,
      grantedAt: timestamp,
      expiresAt: newSubscription.expiresAt || undefined,
      status: 'Pending LP Acceptance', // Always create as pending invitation
      inviteMessage: newSubscription.inviteMessage || undefined,
    }

    // Add to mock data
    mockSubscriptions.push(subscription)
    
    setDialogOpen(false)
    setNewSubscription({ assetId: '', subscriberId: '', expiresAt: '', inviteMessage: '' })
    fetchSubscriptions()
  }

  const handleRevokeSubscription = async (id: string) => {
    if (!currentUser) return
    
    if (!confirm('Are you sure you want to revoke this subscription?')) return

    try {
      const response = await fetch(`/api/subscriptions/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': currentUser.id.toString(),
        },
      })

      if (response.ok) {
        fetchSubscriptions()
      }
    } catch (error) {
      console.error('Error revoking subscription:', error)
    }
  }

  const getAssetName = (assetId: number) => {
    const asset = mockAssets.find(a => a.id === assetId)
    return asset?.name || `Asset ${assetId}`
  }

  const getOrgName = (orgId: number) => {
    const org = mockOrganizations.find(o => o.id === orgId)
    return org?.name || `Org ${orgId}`
  }

  // Get available assets based on current org
  const getAvailableAssets = () => {
    if (!currentUser || !currentOrg) return []
    if (currentOrg.role === 'Platform Admin') return mockAssets
    if (currentOrg.role === 'Asset Owner') {
      return mockAssets.filter(a => a.ownerId === currentOrg.id)
    }
    // For publishers, show assets they have publishing rights for
    if (currentOrg.role === 'Publisher') {
      return getAccessibleAssets(currentUser)
    }
    return []
  }

  // Get available subscribers (LPs)
  const getAvailableLPs = () => {
    return mockOrganizations.filter(o => o.role === 'Subscriber')
  }

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const assetName = getAssetName(sub.assetId).toLowerCase()
    const subscriberName = getOrgName(sub.subscriberId).toLowerCase()
    return assetName.includes(searchTerm.toLowerCase()) || 
           subscriberName.includes(searchTerm.toLowerCase())
  })

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
          Subscriptions
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage which LPs can access your assets
        </p>
      </motion.div>

      <div className="flex items-center justify-between gap-4 mb-6">
        <Input
          placeholder="Search by asset or subscriber..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Mail className="w-4 h-4 mr-2" />
              Invite LP
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite LP to Feed</DialogTitle>
              <DialogDescription>
                Send an invitation to an LP to subscribe to your asset's data feed. The LP must accept to activate the subscription.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Asset</Label>
                <Select
                  value={newSubscription.assetId}
                  onValueChange={(value) => setNewSubscription(prev => ({ ...prev, assetId: value }))}
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
                <Label>Subscriber (LP)</Label>
                <Select
                  value={newSubscription.subscriberId}
                  onValueChange={(value) => setNewSubscription(prev => ({ ...prev, subscriberId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subscriber" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableLPs().map(org => (
                      <SelectItem key={org.id} value={org.id.toString()}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Invitation Message (Optional)</Label>
                <Textarea
                  placeholder="Add a personalized message for the LP..."
                  value={newSubscription.inviteMessage}
                  onChange={(e) => setNewSubscription(prev => ({ ...prev, inviteMessage: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Expiration Date (Optional)</Label>
                <Input
                  type="date"
                  value={newSubscription.expiresAt}
                  onChange={(e) => setNewSubscription(prev => ({ ...prev, expiresAt: e.target.value }))}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSubscription}>
                <Mail className="w-4 h-4 mr-2" />
                Send Invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>LP Subscriptions</CardTitle>
          <CardDescription>
            {filteredSubscriptions.filter(s => s.status === 'Pending LP Acceptance').length} pending invitation{filteredSubscriptions.filter(s => s.status === 'Pending LP Acceptance').length !== 1 ? 's' : ''} • {filteredSubscriptions.filter(s => s.status === 'Active').length} active
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSubscriptions.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              No subscriptions found. Invite LPs to access your fund data.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Subscriber</TableHead>
                  <TableHead>Invited</TableHead>
                  <TableHead>Accepted</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">
                      {getAssetName(sub.assetId)}
                    </TableCell>
                    <TableCell>{getOrgName(sub.subscriberId)}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {new Date(sub.grantedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {sub.acceptedAt ? new Date(sub.acceptedAt).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {sub.expiresAt ? new Date(sub.expiresAt).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          sub.status === 'Active' ? 'default' :
                          sub.status === 'Pending LP Acceptance' ? 'secondary' :
                          sub.status === 'Declined' ? 'outline' :
                          'destructive'
                        }
                        className={sub.status === 'Pending LP Acceptance' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : ''}
                      >
                        {sub.status === 'Pending LP Acceptance' ? (
                          <>
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </>
                        ) : sub.status === 'Active' ? (
                          <>
                            <Check className="w-3 h-3 mr-1" />
                            Active
                          </>
                        ) : sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {(sub.status === 'Active' || sub.status === 'Pending LP Acceptance') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRevokeSubscription(sub.id)}
                          title={sub.status === 'Pending LP Acceptance' ? 'Cancel invitation' : 'Revoke subscription'}
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

