'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import { ChevronDown, ChevronUp, Download, Printer, CheckCircle2 } from 'lucide-react'
import { mockAssets, mockOrganizations } from '@/lib/mock-data'
import { motion, AnimatePresence } from 'framer-motion'

interface Envelope {
  id: number
  publisherId: number
  assetId: number
  timestamp: string
  dataType?: string
  recipientId: number // Single recipient per envelope
}

export default function LedgerPage() {
  const router = useRouter()
  const { currentUser, _hasHydrated } = useAuthStore()
  const [envelopes, setEnvelopes] = useState<Envelope[]>([])
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [payloads, setPayloads] = useState<Record<number, any>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  // Redirect if user doesn't have access to ledger
  // Only check after hydration is complete to avoid false redirects
  useEffect(() => {
    if (_hasHydrated && currentUser) {
      const hasAccess = currentUser.role === 'Subscriber' || currentUser.role === 'Analytics' || currentUser.role === 'Auditor'
      if (!hasAccess) {
        router.push('/')
      }
    }
  }, [_hasHydrated, currentUser, router])

  const fetchEnvelopes = useCallback(async () => {
    try {
      // Get envelopes for subscriber
      const subscriberId = currentUser?.orgId
      const response = await fetch(`/api/envelopes?subscriberId=${subscriberId}`)
      if (response.ok) {
        const data = await response.json()
        setEnvelopes(data)
      }
    } catch (error) {
      console.error('Error fetching envelopes:', error)
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  useEffect(() => {
    if (currentUser?.orgId) {
      fetchEnvelopes()
    }
  }, [currentUser, fetchEnvelopes])

  const handleExpand = async (envelope: Envelope) => {
    if (expandedId === envelope.id) {
      setExpandedId(null)
      return
    }

    setExpandedId(envelope.id)

    // Fetch payload if not already loaded
    if (!payloads[envelope.id]) {
      try {
        // Pass orgId for authorization check (each envelope is already scoped to one LP)
        const orgId = currentUser?.orgId
        const response = await fetch(`/api/payloads/${envelope.id}?orgId=${orgId}`)
        if (response.ok) {
          const data = await response.json()
          setPayloads((prev) => ({ ...prev, [envelope.id]: data.data }))
        } else if (response.status === 403) {
          alert('You are not authorized to view this envelope')
        }
      } catch (error) {
        console.error('Error fetching payload:', error)
      }
    }

    // Create read receipt
    if (currentUser) {
      try {
        await fetch('/api/read-receipts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            envelopeId: envelope.id,
            userId: currentUser.id,
          }),
        })
      } catch (error) {
        console.error('Error creating read receipt:', error)
      }
    }
  }

  const getAssetName = (assetId: number) => {
    return mockAssets.find(a => a.id === assetId)?.name || `Asset ${assetId}`
  }

  const getPublisherName = (publisherId: number) => {
    return mockOrganizations.find(o => o.id === publisherId)?.name || `Publisher ${publisherId}`
  }

  const renderPayloadTable = (data: any) => {
    if (!data || typeof data !== 'object') {
      return <pre className="bg-muted p-4 rounded-lg">{JSON.stringify(data, null, 2)}</pre>
    }

    if (Array.isArray(data)) {
      if (data.length === 0) return <p className="text-muted-foreground">No data</p>
      
      const keys = Object.keys(data[0])
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b">
                {keys.map((key) => (
                  <th key={key} className="text-left p-2 font-semibold">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row: any, idx: number) => (
                <tr key={idx} className="border-b">
                  {keys.map((key) => (
                    <td key={key} className="p-2">
                      {String(row[key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    // Handle nested objects
    return (
      <div className="space-y-4">
        {Object.entries(data).map(([key, value]) => (
          <div key={key}>
            <h4 className="font-semibold mb-2">{key}</h4>
            {Array.isArray(value) ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b">
                      {Object.keys(value[0] || {}).map((k) => (
                        <th key={k} className="text-left p-2 font-semibold">
                          {k}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {value.map((row: any, idx: number) => (
                      <tr key={idx} className="border-b">
                        {Object.values(row).map((v: any, i: number) => (
                          <td key={i} className="p-2">
                            {String(v ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <pre className="bg-muted p-4 rounded-lg">{JSON.stringify(value, null, 2)}</pre>
            )}
          </div>
        ))}
      </div>
    )
  }

  const filteredEnvelopes = envelopes.filter((env) => {
    const assetName = getAssetName(env.assetId).toLowerCase()
    const publisherName = getPublisherName(env.publisherId).toLowerCase()
    const search = searchTerm.toLowerCase()
    return assetName.includes(search) || publisherName.includes(search) || env.dataType?.toLowerCase().includes(search)
  })

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Ledger
        </h1>
        <p className="text-muted-foreground text-lg">Your data feed</p>
      </motion.div>

      <div className="mb-6">
        <Input
          placeholder="Search by fund, publisher, or type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {filteredEnvelopes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No envelopes found
              </CardContent>
            </Card>
          ) : (
            filteredEnvelopes.map((envelope) => (
              <motion.div
                key={envelope.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <Card className="group hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">
                            {getAssetName(envelope.assetId)}
                          </h3>
                          {envelope.dataType && (
                            <Badge variant="outline">{envelope.dataType}</Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            Verified Publisher
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Published by {getPublisherName(envelope.publisherId)} •{' '}
                          {format(new Date(envelope.timestamp), 'MMM d, yyyy HH:mm')}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExpand(envelope)}
                      >
                        {expandedId === envelope.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {expandedId === envelope.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t"
                      >
                        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span>Read receipt sent</span>
                        </div>
                        <div className="mb-4">
                          {payloads[envelope.id] ? (
                            renderPayloadTable(payloads[envelope.id])
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              Loading payload...
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download JSON
                          </Button>
                          <Button variant="outline" size="sm">
                            <Printer className="h-4 w-4 mr-2" />
                            Print
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

