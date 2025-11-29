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
import { Pagination } from '@/components/ui/pagination'
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
import { useAuthStore } from '@/store/auth-store'
import { formatCurrency } from '@/lib/utils'
import { Users, Plus, Building2, CheckCircle2, XCircle, Mail } from 'lucide-react'

interface Subscription {
  id: string
  status: string
  accessLevel: string
  commitment: number | null
  createdAt: string
  asset: {
    id: string
    name: string
    type: string
    vintage?: number
    manager: {
      id: string
      name: string
    }
  }
  subscriber: {
    id: string
    name: string
    type: string
  }
}

interface Asset {
  id: string
  name: string
  type: string
  manager?: {
    id: string
    name: string
  }
}

interface Organization {
  id: string
  name: string
  type: string
}

const PAGE_SIZE = 50

export default function SubscriptionsPage() {
  const { currentPersona } = useAuthStore()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [total, setTotal] = useState(0)
  const [assets, setAssets] = useState<Asset[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [requestDialogOpen, setRequestDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'active'>('all')
  const [currentPage, setCurrentPage] = useState(1)

  // Form state
  const [newInvite, setNewInvite] = useState({
    assetId: '',
    subscriberId: '',
    commitment: '',
  })

  const [newRequest, setNewRequest] = useState({
    assetId: '',
    commitment: '',
  })

  const isGP = currentPersona.organizationType === 'GP'
  const isLP = currentPersona.organizationType === 'LP'
  const isFundAdmin = currentPersona.organizationType === 'FUND_ADMIN'
  const canManage = isGP || isFundAdmin

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const offset = (currentPage - 1) * PAGE_SIZE
        let url = ''

        if (canManage) {
          // GPs/Fund Admins see subscriptions to their assets
          url = `/api/subscriptions?managerId=${currentPersona.organizationId}&limit=${PAGE_SIZE}&offset=${offset}`
        } else {
          // LPs see subscriptions they've requested/received
          url = `/api/subscriptions?subscriberId=${currentPersona.organizationId}&limit=${PAGE_SIZE}&offset=${offset}`
        }

        if (activeTab === 'pending') {
          url += '&status=PENDING'
        } else if (activeTab === 'active') {
          url += '&status=ACTIVE'
        }

        const [subsRes, assetsRes, orgsRes] = await Promise.all([
          fetch(url),
          canManage
            ? fetch(`/api/assets?managerId=${currentPersona.organizationId}`)
            : fetch('/api/assets'), // LPs can see all assets to request subscriptions
          canManage
            ? fetch('/api/organizations?type=LP')
            : Promise.resolve({ json: () => Promise.resolve([]) }),
        ])

        const [subsData, assetsData, orgsData] = await Promise.all([
          subsRes.json(),
          assetsRes.json(),
          orgsRes.json(),
        ])

        setSubscriptions(subsData.subscriptions || subsData)
        setTotal(subsData.total || subsData.length)
        setAssets(assetsData)
        setOrganizations(orgsData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [
    currentPersona.organizationId,
    currentPersona.organizationType,
    activeTab,
    currentPage,
    canManage,
  ])

  const handleInvite = async () => {
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: newInvite.assetId,
          subscriberId: newInvite.subscriberId,
          commitment: newInvite.commitment ? parseFloat(newInvite.commitment) : null,
          status: 'PENDING', // Invited subscriptions start as pending
        }),
      })

      if (response.ok) {
        const created = await response.json()
        setSubscriptions((prev) => [created, ...prev])
        setTotal((prev) => prev + 1)
        setInviteDialogOpen(false)
        setNewInvite({ assetId: '', subscriberId: '', commitment: '' })
      }
    } catch (error) {
      console.error('Error creating invitation:', error)
    }
  }

  const handleRequest = async () => {
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: newRequest.assetId,
          subscriberId: currentPersona.organizationId,
          commitment: newRequest.commitment ? parseFloat(newRequest.commitment) : null,
          status: 'PENDING', // Requested subscriptions start as pending
        }),
      })

      if (response.ok) {
        const created = await response.json()
        setSubscriptions((prev) => [created, ...prev])
        setTotal((prev) => prev + 1)
        setRequestDialogOpen(false)
        setNewRequest({ assetId: '', commitment: '' })
      }
    } catch (error) {
      console.error('Error creating request:', error)
    }
  }

  const handleApprove = async (subscriptionId: string) => {
    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACTIVE' }),
      })

      if (response.ok) {
        const updated = await response.json()
        setSubscriptions((prev) =>
          prev.map((sub) => (sub.id === subscriptionId ? updated : sub))
        )
      }
    } catch (error) {
      console.error('Error approving subscription:', error)
    }
  }

  const handleDecline = async (subscriptionId: string) => {
    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSubscriptions((prev) => prev.filter((sub) => sub.id !== subscriptionId))
        setTotal((prev) => prev - 1)
      }
    } catch (error) {
      console.error('Error declining subscription:', error)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const pendingCount = subscriptions.filter((s) => s.status === 'PENDING').length
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const showingStart = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const showingEnd = Math.min(currentPage * PAGE_SIZE, total)

  return (
    <div className="flex-1 bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <motion.div
          className="mb-8 flex items-center justify-between"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div>
            <h1 className="text-4xl font-semibold mb-3 gradient-text">Subscriptions</h1>
            <p className="text-muted-foreground text-base">
              {canManage
                ? 'Manage LP subscriptions to your funds'
                : 'Your subscription requests and active subscriptions'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {canManage && (
              <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Mail className="w-4 h-4 mr-2" />
                    Invite LP
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite LP to Subscribe</DialogTitle>
                    <DialogDescription>
                      Send an invitation to an LP to subscribe to your fund
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Asset</Label>
                      <Select
                        value={newInvite.assetId}
                        onValueChange={(v) =>
                          setNewInvite((prev) => ({ ...prev, assetId: v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select asset..." />
                        </SelectTrigger>
                        <SelectContent>
                          {assets.map((asset) => (
                            <SelectItem key={asset.id} value={asset.id}>
                              {asset.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Subscriber (LP)</Label>
                      <Select
                        value={newInvite.subscriberId}
                        onValueChange={(v) =>
                          setNewInvite((prev) => ({ ...prev, subscriberId: v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select LP..." />
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
                      <Label>Commitment (USD) - Optional</Label>
                      <Input
                        type="number"
                        placeholder="e.g., 50000000"
                        value={newInvite.commitment}
                        onChange={(e) =>
                          setNewInvite((prev) => ({
                            ...prev,
                            commitment: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleInvite}
                      disabled={!newInvite.assetId || !newInvite.subscriberId}
                    >
                      Send Invitation
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            {isLP && (
              <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Request Subscription
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Request Subscription</DialogTitle>
                    <DialogDescription>
                      Request to subscribe to a fund
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Asset</Label>
                      <Select
                        value={newRequest.assetId}
                        onValueChange={(v) =>
                          setNewRequest((prev) => ({ ...prev, assetId: v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select asset..." />
                        </SelectTrigger>
                        <SelectContent>
                          {assets.map((asset) => (
                            <SelectItem key={asset.id} value={asset.id}>
                              {asset.name} ({asset.manager?.name || 'Unknown'})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Commitment (USD) - Optional</Label>
                      <Input
                        type="number"
                        placeholder="e.g., 50000000"
                        value={newRequest.commitment}
                        onChange={(e) =>
                          setNewRequest((prev) => ({
                            ...prev,
                            commitment: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleRequest}
                      disabled={!newRequest.assetId}
                    >
                      Submit Request
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => {
          setActiveTab(v as 'all' | 'pending' | 'active')
          setCurrentPage(1)
        }}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">
              All ({total})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending {pendingCount > 0 && `(${pendingCount})`}
            </TabsTrigger>
            <TabsTrigger value="active">
              Active
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Subscriptions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="empty-state py-12">
                      <p>Loading...</p>
                    </div>
                  ) : subscriptions.length === 0 ? (
                    <div className="empty-state py-12">
                      <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p>No subscriptions found</p>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {canManage && <TableHead>Subscriber</TableHead>}
                              {isLP && <TableHead>Asset Manager</TableHead>}
                              <TableHead>Asset</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Commitment</TableHead>
                              <TableHead>Access</TableHead>
                              <TableHead>Created</TableHead>
                              <TableHead className="w-[150px]">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {subscriptions.map((sub) => (
                              <TableRow key={sub.id}>
                                {canManage && (
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Building2 className="w-4 h-4 text-muted-foreground" />
                                      <span className="font-medium">{sub.subscriber.name}</span>
                                    </div>
                                  </TableCell>
                                )}
                                {isLP && (
                                  <TableCell className="text-muted-foreground">
                                    {sub.asset.manager.name}
                                  </TableCell>
                                )}
                                <TableCell className="font-medium">
                                  {sub.asset.name}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">{sub.asset.type}</Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className={
                                      sub.status === 'ACTIVE'
                                        ? 'status-active'
                                        : sub.status === 'PENDING'
                                        ? 'status-pending'
                                        : 'status-closed'
                                    }
                                  >
                                    {sub.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="font-mono text-sm">
                                  {sub.commitment ? formatCurrency(sub.commitment) : '-'}
                                </TableCell>
                                <TableCell>{sub.accessLevel}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {formatDate(sub.createdAt)}
                                </TableCell>
                                <TableCell>
                                  {sub.status === 'PENDING' && (
                                    <div className="flex items-center gap-2">
                                      {canManage && (
                                        <>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleApprove(sub.id)}
                                            title="Approve"
                                          >
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDecline(sub.id)}
                                            title="Decline"
                                          >
                                            <XCircle className="w-4 h-4 text-red-500" />
                                          </Button>
                                        </>
                                      )}
                                      {isLP && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDecline(sub.id)}
                                          title="Cancel Request"
                                        >
                                          <XCircle className="w-4 h-4 text-red-500" />
                                        </Button>
                                      )}
                                    </div>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      {totalPages > 1 && (
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={setCurrentPage}
                          pageSize={PAGE_SIZE}
                          total={total}
                          showingStart={showingStart}
                          showingEnd={showingEnd}
                        />
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
