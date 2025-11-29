'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Check, X, Mail, Rss, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { Subscription } from '@/types'
import { mockAssets, mockOrganizations, mockSubscriptions, mockAccessGrants } from '@/lib/mock-data'
import { getManageableSubscriptionsForUser } from '@/lib/permissions'

export default function FeedsPage() {
  const router = useRouter()
  const { currentUser, currentOrg, _hasHydrated } = useAuthStore()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  // Redirect if user doesn't have access (LP or Delegates with subscription management)
  useEffect(() => {
    if (_hasHydrated && currentUser && currentOrg) {
      const isPlatformAdmin = currentOrg.isPlatformAdmin || currentOrg.type === 'Platform Operator' || currentOrg.role === 'Platform Admin'
      const isLimitedPartner = mockSubscriptions.some(s => s.subscriberId === currentOrg.id && s.status === 'Active')
      const canManageForLP = getManageableSubscriptionsForUser(currentUser).length > 0
      
      const hasAccess = isPlatformAdmin || isLimitedPartner || canManageForLP
      if (!hasAccess) {
        router.push('/')
      }
    }
  }, [_hasHydrated, currentUser, currentOrg, router])

  const fetchSubscriptions = useCallback(async () => {
    if (!currentOrg || !currentUser) return
    
    const isPlatformAdmin = currentOrg.isPlatformAdmin || currentOrg.type === 'Platform Operator' || currentOrg.role === 'Platform Admin'
    const isLimitedPartner = mockSubscriptions.some(s => s.subscriberId === currentOrg.id)
    
    // For LP, get their own subscriptions
    // For Delegates, get subscriptions they can manage
    let subs: Subscription[] = []
    if (isPlatformAdmin) {
      subs = mockSubscriptions
    } else if (isLimitedPartner) {
      subs = mockSubscriptions.filter(s => s.subscriberId === currentOrg.id)
    } else {
      // Delegate with LP grant subscription management
      subs = getManageableSubscriptionsForUser(currentUser)
    }
    
    setSubscriptions(subs)
    setLoading(false)
  }, [currentOrg, currentUser])

  useEffect(() => {
    fetchSubscriptions()
  }, [fetchSubscriptions])

  const handleAccept = async (id: string) => {
    setProcessingId(id)
    
    // Update the subscription status
    const subIndex = subscriptions.findIndex(s => s.id === id)
    if (subIndex !== -1) {
      const updatedSubscriptions = [...subscriptions]
      updatedSubscriptions[subIndex] = {
        ...updatedSubscriptions[subIndex],
        status: 'Active',
        acceptedAt: new Date().toISOString(),
      }
      setSubscriptions(updatedSubscriptions)
      
      // Also update in the global mock data
      const mockIndex = mockSubscriptions.findIndex(s => s.id === id)
      if (mockIndex !== -1) {
        mockSubscriptions[mockIndex] = updatedSubscriptions[subIndex]
      }
    }
    
    setProcessingId(null)
  }

  const handleDecline = async (id: string) => {
    if (!confirm('Are you sure you want to decline this feed invitation?')) return
    
    setProcessingId(id)
    
    // Update the subscription status
    const subIndex = subscriptions.findIndex(s => s.id === id)
    if (subIndex !== -1) {
      const updatedSubscriptions = [...subscriptions]
      updatedSubscriptions[subIndex] = {
        ...updatedSubscriptions[subIndex],
        status: 'Declined',
      }
      setSubscriptions(updatedSubscriptions)
      
      // Also update in the global mock data
      const mockIndex = mockSubscriptions.findIndex(s => s.id === id)
      if (mockIndex !== -1) {
        mockSubscriptions[mockIndex] = updatedSubscriptions[subIndex]
      }
    }
    
    setProcessingId(null)
  }

  const getAssetName = (assetId: number) => {
    const asset = mockAssets.find(a => a.id === assetId)
    return asset?.name || `Asset ${assetId}`
  }

  const getAssetType = (assetId: number) => {
    const asset = mockAssets.find(a => a.id === assetId)
    return asset?.type || 'Fund'
  }

  const getAssetOwner = (assetId: number) => {
    const asset = mockAssets.find(a => a.id === assetId)
    if (!asset) return 'Unknown'
    const owner = mockOrganizations.find(o => o.id === asset.ownerId)
    return owner?.name || `Org ${asset.ownerId}`
  }

  const getOrgName = (orgId: number) => {
    const org = mockOrganizations.find(o => o.id === orgId)
    return org?.name || `Org ${orgId}`
  }

  const pendingInvitations = subscriptions.filter(s => s.status === 'Pending LP Acceptance')
  const activeSubscriptions = subscriptions.filter(s => s.status === 'Active')
  const declinedSubscriptions = subscriptions.filter(s => s.status === 'Declined')

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
          Subscriptions
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage your data feed subscriptions and accept new invitations
        </p>
      </motion.div>

      {pendingInvitations.length > 0 && (
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center gap-3">
          <Mail className="w-5 h-5 text-blue-500" />
          <span className="text-sm">
            You have {pendingInvitations.length} pending feed invitation{pendingInvitations.length !== 1 ? 's' : ''} from GPs
          </span>
        </div>
      )}

      <Tabs defaultValue="invitations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invitations" className="relative">
            <Mail className="w-4 h-4 mr-2" />
            Invitations
            {pendingInvitations.length > 0 && (
              <Badge className="ml-2 h-5 px-1.5" variant="default">
                {pendingInvitations.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="active">
            <Rss className="w-4 h-4 mr-2" />
            Active Feeds ({activeSubscriptions.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            <Clock className="w-4 h-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Pending Invitations Tab */}
        <TabsContent value="invitations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feed Invitations</CardTitle>
              <CardDescription>
                Accept invitations from General Partners to receive data feeds for their assets
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingInvitations.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No pending invitations</p>
                  <p className="text-sm mt-2">GPs will invite you to subscribe to their fund data feeds</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingInvitations.map((sub) => (
                    <Card key={sub.id} className="border-primary/20">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{getAssetName(sub.assetId)}</h3>
                              <Badge variant="outline">{getAssetType(sub.assetId)}</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <p><span className="font-medium">From:</span> {getAssetOwner(sub.assetId)}</p>
                              <p><span className="font-medium">Invited:</span> {new Date(sub.grantedAt).toLocaleDateString()}</p>
                            </div>
                            {sub.inviteMessage && (
                              <div className="mt-3 p-3 bg-secondary/30 rounded-md">
                                <p className="text-sm italic">&ldquo;{sub.inviteMessage}&rdquo;</p>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              onClick={() => handleAccept(sub.id)}
                              disabled={processingId === sub.id}
                              className="w-28"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Accept
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleDecline(sub.id)}
                              disabled={processingId === sub.id}
                              className="w-28"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Decline
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Feeds Tab */}
        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Feed Subscriptions</CardTitle>
              <CardDescription>
                You are currently receiving data feeds from these assets
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeSubscriptions.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  <Rss className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No active feed subscriptions</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>GP (Asset Owner)</TableHead>
                      <TableHead>Subscribed</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeSubscriptions.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell className="font-medium">
                          {getAssetName(sub.assetId)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getAssetType(sub.assetId)}</Badge>
                        </TableCell>
                        <TableCell>{getAssetOwner(sub.assetId)}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {sub.acceptedAt 
                            ? new Date(sub.acceptedAt).toLocaleDateString()
                            : new Date(sub.grantedAt).toLocaleDateString()
                          }
                        </TableCell>
                        <TableCell>
                          <Badge variant="default" className="bg-green-600">
                            <Rss className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscription History</CardTitle>
              <CardDescription>
                All feed invitations you have received
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subscriptions.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  No subscription history
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead>GP (Asset Owner)</TableHead>
                      <TableHead>Invited</TableHead>
                      <TableHead>Response</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell className="font-medium">
                          {getAssetName(sub.assetId)}
                        </TableCell>
                        <TableCell>{getAssetOwner(sub.assetId)}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {new Date(sub.grantedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {sub.acceptedAt 
                            ? new Date(sub.acceptedAt).toLocaleDateString()
                            : sub.status === 'Declined' ? 'Declined' : '-'
                          }
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              sub.status === 'Active' ? 'default' :
                              sub.status === 'Pending LP Acceptance' ? 'secondary' :
                              sub.status === 'Declined' ? 'destructive' : 'outline'
                            }
                          >
                            {sub.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

