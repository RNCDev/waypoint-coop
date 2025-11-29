'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/shared/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/store/auth-store'
import { formatCurrency } from '@/lib/utils'
import { Rss, Building2, TrendingUp, DollarSign } from 'lucide-react'
import Link from 'next/link'

interface Subscription {
  id: string
  status: string
  accessLevel: string
  commitment: number | null
  asset: {
    id: string
    name: string
    type: string
    vintage?: number
    manager: {
      name: string
    }
  }
}

export default function FeedsPage() {
  const { currentPersona } = useAuthStore()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const response = await fetch(
          `/api/subscriptions?subscriberId=${currentPersona.organizationId}`
        )
        const data = await response.json()
        setSubscriptions(data)
      } catch (error) {
        console.error('Error fetching subscriptions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSubscriptions()
  }, [currentPersona.organizationId])

  const totalCommitment = subscriptions.reduce(
    (sum, sub) => sum + (sub.commitment || 0),
    0
  )

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-4xl font-semibold mb-3 gradient-text">Feeds</h1>
          <p className="text-muted-foreground text-base">
            Your subscribed funds and data feeds
          </p>
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Rss className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                  <p className="text-2xl font-bold">
                    {subscriptions.filter((s) => s.status === 'ACTIVE').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Commitment</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalCommitment)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fund Managers</p>
                  <p className="text-2xl font-bold">
                    {new Set(subscriptions.map((s) => s.asset.manager.name)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Subscriptions Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold mb-4">Subscribed Funds</h2>

          {loading ? (
            <div className="empty-state">
              <p>Loading...</p>
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="empty-state">
              <Rss className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p>No subscriptions found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subscriptions.map((subscription, index) => (
                <motion.div
                  key={subscription.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Link href={`/ledger?assetId=${subscription.asset.id}`}>
                    <Card className="card-interactive h-full">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {subscription.asset.name}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              {subscription.asset.manager.name}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              subscription.status === 'ACTIVE'
                                ? 'status-active'
                                : subscription.status === 'PENDING'
                                ? 'status-pending'
                                : 'status-closed'
                            }
                          >
                            {subscription.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Type</span>
                            <Badge variant="outline">{subscription.asset.type}</Badge>
                          </div>
                          {subscription.asset.vintage && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Vintage</span>
                              <span>{subscription.asset.vintage}</span>
                            </div>
                          )}
                          {subscription.commitment && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Commitment</span>
                              <span className="font-medium">
                                {formatCurrency(subscription.commitment)}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Access</span>
                            <span>{subscription.accessLevel}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}

