'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/shared/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { useAuthStore } from '@/store/auth-store'
import { formatCurrency } from '@/lib/utils'
import { Users, Plus, Building2 } from 'lucide-react'

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
}

interface Organization {
  id: string
  name: string
  type: string
}

export default function SubscriptionsPage() {
  const { currentPersona } = useAuthStore()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Form state
  const [newSubscription, setNewSubscription] = useState({
    assetId: '',
    subscriberId: '',
    commitment: '',
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const [subsRes, assetsRes, orgsRes] = await Promise.all([
          fetch('/api/subscriptions'),
          fetch('/api/assets'),
          fetch('/api/organizations?type=LP'),
        ])

        const [subs, assetsData, orgsData] = await Promise.all([
          subsRes.json(),
          assetsRes.json(),
          orgsRes.json(),
        ])

        setSubscriptions(subs)
        setAssets(assetsData)
        setOrganizations(orgsData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleCreateSubscription = async () => {
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: newSubscription.assetId,
          subscriberId: newSubscription.subscriberId,
          commitment: newSubscription.commitment
            ? parseFloat(newSubscription.commitment)
            : null,
          status: 'ACTIVE',
        }),
      })

      if (response.ok) {
        const created = await response.json()
        setSubscriptions((prev) => [created, ...prev])
        setDialogOpen(false)
        setNewSubscription({ assetId: '', subscriberId: '', commitment: '' })
      }
    } catch (error) {
      console.error('Error creating subscription:', error)
    }
  }

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
              Manage LP subscriptions to your funds
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Subscription
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Subscription</DialogTitle>
                <DialogDescription>
                  Add a new LP subscription to an asset
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Asset</Label>
                  <Select
                    value={newSubscription.assetId}
                    onValueChange={(v) =>
                      setNewSubscription((prev) => ({ ...prev, assetId: v }))
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
                    value={newSubscription.subscriberId}
                    onValueChange={(v) =>
                      setNewSubscription((prev) => ({ ...prev, subscriberId: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subscriber..." />
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
                  <Label>Commitment (USD)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 50000000"
                    value={newSubscription.commitment}
                    onChange={(e) =>
                      setNewSubscription((prev) => ({
                        ...prev,
                        commitment: e.target.value,
                      }))
                    }
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleCreateSubscription}
                  disabled={!newSubscription.assetId || !newSubscription.subscriberId}
                >
                  Create Subscription
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Subscriptions Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                All Subscriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="empty-state">Loading...</div>
              ) : subscriptions.length === 0 ? (
                <div className="empty-state">
                  <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p>No subscriptions found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subscriber</TableHead>
                        <TableHead>Asset</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Commitment</TableHead>
                        <TableHead>Access</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscriptions.map((sub) => (
                        <TableRow key={sub.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">
                                {sub.subscriber.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{sub.asset.name}</TableCell>
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
                          <TableCell className="font-mono">
                            {sub.commitment
                              ? formatCurrency(sub.commitment)
                              : '-'}
                          </TableCell>
                          <TableCell>{sub.accessLevel}</TableCell>
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

