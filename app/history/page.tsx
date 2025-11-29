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
import { History, Filter, Eye } from 'lucide-react'
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
  parentId: string | null
  publisherName: string
  assetName: string
  createdAt: string
}

const TYPE_COLORS: Record<string, string> = {
  CAPITAL_CALL: 'bg-red-500/20 text-red-400 border-red-500/30',
  DISTRIBUTION: 'bg-green-500/20 text-green-400 border-green-500/30',
  FINANCIAL_STATEMENT: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  TAX_DOCUMENT: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  LEGAL_DOCUMENT: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

const PAGE_SIZE = 50

export default function HistoryPage() {
  const { currentPersona } = useAuthStore()
  const [envelopes, setEnvelopes] = useState<EnvelopeData[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function fetchEnvelopes() {
      setLoading(true)
      try {
        const isGP = currentPersona.organizationType === 'GP'
        const isLP = currentPersona.organizationType === 'LP'
        const isAuditor = ['AUDITOR', 'CONSULTANT', 'TAX_ADVISOR'].includes(currentPersona.organizationType)
        const offset = (currentPage - 1) * PAGE_SIZE
        let url = ''

        if (isGP) {
          // GPs see envelopes for assets they manage
          url = `/api/envelopes?managerId=${currentPersona.organizationId}&limit=${PAGE_SIZE}&offset=${offset}`
        } else if (isLP) {
          // LPs see envelopes for assets they're subscribed to
          url = `/api/envelopes?subscriberId=${currentPersona.organizationId}&limit=${PAGE_SIZE}&offset=${offset}`
        } else if (isAuditor) {
          // Auditors/Consultants see envelopes they have access to through grants
          // The API will handle this via subscriberId which checks both subscriptions and grants
          url = `/api/envelopes?subscriberId=${currentPersona.organizationId}&limit=${PAGE_SIZE}&offset=${offset}`
        } else {
          // Others (Fund Admin, etc.) see envelopes they published
          url = `/api/envelopes?publisherId=${currentPersona.organizationId}&limit=${PAGE_SIZE}&offset=${offset}`
        }
        
        if (filter !== 'all') {
          if (filter === 'corrections') {
            // We'll filter corrections client-side for now
          } else {
            url += `&type=${filter}`
          }
        }

        const response = await fetch(url)
        const data = await response.json()

        const transformed: EnvelopeData[] = data.envelopes.map((env: any) => ({
          id: env.id,
          type: env.type,
          hash: env.hash,
          version: env.version,
          parentId: env.parentId,
          publisherName: env.publisher?.name || 'Unknown',
          assetName: env.asset?.name || 'Unknown',
          createdAt: env.createdAt,
        }))

        // Filter corrections if needed
        const filtered = filter === 'corrections' 
          ? transformed.filter((env) => env.version > 1)
          : transformed

        setEnvelopes(filtered)
        setTotal(data.total)
      } catch (error) {
        console.error('Error fetching envelopes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEnvelopes()
  }, [currentPersona.organizationId, currentPersona.organizationType, currentPage, filter])

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

  const correctionCount = envelopes.filter((env) => env.version > 1).length
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
              <h1 className="text-4xl font-semibold mb-3 gradient-text">History</h1>
              <p className="text-muted-foreground text-base">
                {currentPersona.organizationType === 'GP'
                  ? 'View all envelopes published for your assets'
                  : currentPersona.organizationType === 'LP'
                  ? 'View all envelopes from your subscribed funds'
                  : ['AUDITOR', 'CONSULTANT', 'TAX_ADVISOR'].includes(currentPersona.organizationType)
                  ? 'View all envelopes you have access to through grants'
                  : 'View all envelopes published by your organization'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{total.toLocaleString()} total</Badge>
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
            <Select value={filter} onValueChange={(value) => {
              setFilter(value)
              setCurrentPage(1) // Reset to first page when filter changes
            }}>
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
                <History className="w-5 h-5 text-primary" />
                Envelope History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="empty-state py-12">
                  <p>Loading...</p>
                </div>
              ) : envelopes.length === 0 ? (
                <div className="empty-state py-12">
                  <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p>No envelopes found</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">Type</TableHead>
                          <TableHead>Asset</TableHead>
                          <TableHead>Publisher</TableHead>
                          <TableHead className="w-[120px]">Hash</TableHead>
                          <TableHead className="w-[120px]">Version</TableHead>
                          <TableHead className="w-[180px]">Date</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {envelopes.map((envelope) => (
                          <Fragment key={envelope.id}>
                            <TableRow className="cursor-pointer hover:bg-secondary/50">
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
                              <TableCell>
                                {envelope.version > 1 ? (
                                  <Badge variant="outline" className="bg-orange-500/20 text-orange-400">
                                    v{envelope.version}
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground">v{envelope.version}</span>
                                )}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {formatDate(envelope.createdAt)}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleRow(envelope.id)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
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
                                      {envelope.parentId && (
                                        <div>
                                          <span className="text-muted-foreground">Parent:</span>
                                          <code className="ml-2 font-mono text-xs">{envelope.parentId}</code>
                                        </div>
                                      )}
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
