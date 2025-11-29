'use client'

import { useState, useEffect, Fragment } from 'react'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/shared/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Pagination } from '@/components/ui/pagination'
import { useAuthStore } from '@/store/auth-store'
import { Inbox, Filter, Eye, CheckCircle2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

interface EnvelopeData {
  id: string
  type: string
  hash: string
  version: number
  publisherName: string
  assetName: string
  createdAt: string
  isRead?: boolean
}

const TYPE_COLORS: Record<string, string> = {
  CAPITAL_CALL: 'bg-red-500/20 text-red-400 border-red-500/30',
  DISTRIBUTION: 'bg-green-500/20 text-green-400 border-green-500/30',
  FINANCIAL_STATEMENT: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  TAX_DOCUMENT: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  LEGAL_DOCUMENT: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

const PAGE_SIZE = 50

export default function LedgerPage() {
  const { currentPersona } = useAuthStore()
  const [envelopes, setEnvelopes] = useState<EnvelopeData[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [readEnvelopes, setReadEnvelopes] = useState<Set<string>>(new Set())
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function fetchEnvelopes() {
      setLoading(true)
      try {
        const offset = (currentPage - 1) * PAGE_SIZE
        let url = `/api/envelopes?subscriberId=${currentPersona.organizationId}&userId=${currentPersona.userId}&limit=${PAGE_SIZE}&offset=${offset}`
        
        if (filter !== 'all') {
          url += `&type=${filter}`
        }

        const response = await fetch(url)
        const data = await response.json()

        const transformed: EnvelopeData[] = data.envelopes.map((env: any) => ({
          id: env.id,
          type: env.type,
          hash: env.hash,
          version: env.version,
          publisherName: env.publisher?.name || 'Unknown',
          assetName: env.asset?.name || 'Unknown',
          createdAt: env.createdAt,
          isRead: env.readReceipts && env.readReceipts.length > 0 ? true : readEnvelopes.has(env.id),
        }))

        setEnvelopes(transformed)
        setTotal(data.total)
      } catch (error) {
        console.error('Error fetching envelopes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEnvelopes()
  }, [currentPersona.organizationId, currentPersona.userId, currentPage, filter, readEnvelopes])

  const handleMarkAsRead = async (envelopeId: string) => {
    try {
      await fetch(`/api/envelopes/${envelopeId}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentPersona.userId }),
      })

      setReadEnvelopes((prev) => new Set([...prev, envelopeId]))
      // Update local state
      setEnvelopes((prev) =>
        prev.map((env) => (env.id === envelopeId ? { ...env, isRead: true } : env))
      )
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const unreadCount = envelopes.filter((env) => !env.isRead).length
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const showingStart = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const showingEnd = Math.min(currentPage * PAGE_SIZE, total)

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
            <Select value={filter} onValueChange={(value) => {
              setFilter(value)
              setCurrentPage(1)
            }}>
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
              Showing {showingStart.toLocaleString()} to {showingEnd.toLocaleString()} of {total.toLocaleString()} envelopes
            </span>
          </div>
        </motion.div>

        {/* Envelope Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Inbox className="w-5 h-5 text-primary" />
                Envelope Ledger
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="empty-state py-12">
                  <p>Loading...</p>
                </div>
              ) : envelopes.length === 0 ? (
                <div className="empty-state py-12">
                  <Inbox className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p>No envelopes found</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">Read</TableHead>
                          <TableHead className="w-[100px]">Type</TableHead>
                          <TableHead>Asset</TableHead>
                          <TableHead>Publisher</TableHead>
                          <TableHead className="w-[120px]">Hash</TableHead>
                          <TableHead className="w-[180px]">Date</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {envelopes.map((envelope) => (
                          <Fragment key={envelope.id}>
                            <TableRow 
                              className={`cursor-pointer hover:bg-secondary/50 ${!envelope.isRead ? 'bg-yellow-500/5' : ''}`}
                            >
                              <TableCell>
                                {envelope.isRead ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                                ) : (
                                  <div className="w-4 h-4 rounded-full bg-yellow-500" />
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={TYPE_COLORS[envelope.type] || ''}
                                >
                                  {envelope.type.replace('_', ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">
                                {envelope.assetName}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {envelope.publisherName}
                              </TableCell>
                              <TableCell className="font-mono text-xs">
                                {envelope.hash.slice(0, 8)}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {formatDate(envelope.createdAt)}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {!envelope.isRead && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleMarkAsRead(envelope.id)}
                                      title="Mark as read"
                                    >
                                      <CheckCircle2 className="w-4 h-4" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleRow(envelope.id)}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                            {expandedRows.has(envelope.id) && (
                              <TableRow>
                                <TableCell colSpan={7} className="bg-secondary/30">
                                  <div className="py-4 space-y-2">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <span className="text-muted-foreground">Envelope ID:</span>
                                        <code className="ml-2 font-mono text-xs">{envelope.id}</code>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Full Hash:</span>
                                        <code className="ml-2 font-mono text-xs">{envelope.hash}</code>
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </Fragment>
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
      </main>
    </div>
  )
}
