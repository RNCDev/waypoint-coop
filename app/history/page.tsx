'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/shared/navbar'
import { EnvelopeCard, type EnvelopeData } from '@/components/shared/envelope-card'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/store/auth-store'
import { History, Filter } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function HistoryPage() {
  const { currentPersona } = useAuthStore()
  const [envelopes, setEnvelopes] = useState<EnvelopeData[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    async function fetchEnvelopes() {
      try {
        // Fetch envelopes published by the current org or its delegates
        const response = await fetch(
          `/api/envelopes?publisherId=${currentPersona.organizationId}`
        )
        const data = await response.json()

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
        }))

        setEnvelopes(transformed)
      } catch (error) {
        console.error('Error fetching envelopes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEnvelopes()
  }, [currentPersona.organizationId])

  const filteredEnvelopes = envelopes.filter((env) => {
    if (filter === 'all') return true
    if (filter === 'corrections') return env.version > 1
    return env.type === filter
  })

  const correctionCount = envelopes.filter((env) => env.version > 1).length

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-semibold mb-3 gradient-text">History</h1>
              <p className="text-muted-foreground text-base">
                View all envelopes published by your organization
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{envelopes.length} total</Badge>
              {correctionCount > 0 && (
                <Badge variant="outline" className="bg-orange-500/20 text-orange-400">
                  {correctionCount} corrections
                </Badge>
              )}
            </div>
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
                <SelectItem value="corrections">Corrections Only</SelectItem>
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
              <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p>No published envelopes found</p>
            </div>
          ) : (
            filteredEnvelopes.map((envelope, index) => (
              <motion.div
                key={envelope.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <EnvelopeCard envelope={envelope} />
              </motion.div>
            ))
          )}
        </motion.div>
      </main>
    </div>
  )
}

