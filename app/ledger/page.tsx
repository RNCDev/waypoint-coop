'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/shared/navbar'
import { EnvelopeCard, type EnvelopeData } from '@/components/shared/envelope-card'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/store/auth-store'
import { Inbox, Filter } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function LedgerPage() {
  const { currentPersona } = useAuthStore()
  const [envelopes, setEnvelopes] = useState<EnvelopeData[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [readEnvelopes, setReadEnvelopes] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function fetchEnvelopes() {
      try {
        const response = await fetch(
          `/api/envelopes?subscriberId=${currentPersona.organizationId}&userId=${currentPersona.userId}`
        )
        const data = await response.json()

        // Transform data to match EnvelopeData interface
        const transformed: EnvelopeData[] = data.map((env: any) => ({
          id: env.id,
          type: env.type,
          payload: env.payload,
          hash: env.hash,
          version: env.version,
          parentId: env.parentId,
          publisherId: env.publisherId,
          publisherName: env.publisher?.name || 'Unknown',
          assetId: env.assetId,
          assetName: env.asset?.name || 'Unknown',
          createdAt: env.createdAt,
          // Check if user has read receipt for this envelope
          isRead: env.readReceipts && env.readReceipts.length > 0 ? true : readEnvelopes.has(env.id),
        }))

        setEnvelopes(transformed)
      } catch (error) {
        console.error('Error fetching envelopes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEnvelopes()
  }, [currentPersona.organizationId, currentPersona.userId])

  const handleMarkAsRead = async (envelopeId: string) => {
    try {
      await fetch(`/api/envelopes/${envelopeId}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentPersona.userId }),
      })

      setReadEnvelopes((prev) => new Set([...prev, envelopeId]))
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const filteredEnvelopes = envelopes.filter((env) => {
    if (filter === 'all') return true
    return env.type === filter
  })

  const unreadCount = envelopes.filter((env) => !env.isRead).length

  return (
    <div className="flex-1 bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-semibold mb-3 gradient-text">Ledger</h1>
              <p className="text-muted-foreground text-base">
                Chronological feed of data packets from your subscribed funds
              </p>
            </div>
            {unreadCount > 0 && (
              <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400">
                {unreadCount} unread
              </Badge>
            )}
          </div>
        </motion.div>

        {/* Filter */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex items-center gap-4">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="CAPITAL_CALL">Capital Calls</SelectItem>
                <SelectItem value="DISTRIBUTION">Distributions</SelectItem>
                <SelectItem value="FINANCIAL_STATEMENT">Financial Statements</SelectItem>
                <SelectItem value="TAX_DOCUMENT">Tax Documents</SelectItem>
                <SelectItem value="LEGAL_DOCUMENT">Legal Documents</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              Showing {filteredEnvelopes.length} of {envelopes.length} envelopes
            </span>
          </div>
        </motion.div>

        {/* Envelope Feed */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {loading ? (
            <div className="empty-state">
              <p>Loading...</p>
            </div>
          ) : filteredEnvelopes.length === 0 ? (
            <div className="empty-state">
              <Inbox className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p>No envelopes found</p>
            </div>
          ) : (
            filteredEnvelopes.map((envelope, index) => (
              <motion.div
                key={envelope.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <EnvelopeCard
                  envelope={envelope}
                  showReadStatus
                  onMarkAsRead={handleMarkAsRead}
                />
              </motion.div>
            ))
          )}
        </motion.div>
      </main>
    </div>
  )
}

