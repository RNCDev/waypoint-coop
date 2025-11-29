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
import { Inbox, Filter, Eye, CheckCircle2, Download, Copy, Check, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

interface DataPacketData {
  id: string
  type: string
  hash: string
  version: number
  publisherName: string
  assetName: string
  subscribers: string[] // Array of subscriber names
  createdAt: string
  isRead?: boolean
  payload?: any // Full payload loaded on demand
}

const TYPE_COLORS: Record<string, string> = {
  CAPITAL_CALL: 'bg-red-500/20 text-red-400 border-red-500/30',
  DISTRIBUTION: 'bg-green-500/20 text-green-400 border-green-500/30',
  FINANCIAL_STATEMENT: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  TAX_DOCUMENT: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  LEGAL_DOCUMENT: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

const PAGE_SIZE = 10

export default function LedgerPage() {
  const { currentPersona } = useAuthStore()
  const [dataPackets, setDataPackets] = useState<DataPacketData[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [readDataPackets, setReadDataPackets] = useState<Set<string>>(new Set())
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [loadingPayloads, setLoadingPayloads] = useState<Set<string>>(new Set())
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<string>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    async function fetchDataPackets() {
      setLoading(true)
      try {
        const offset = (currentPage - 1) * PAGE_SIZE
        let url = `/api/data-packets?subscriberId=${currentPersona.organizationId}&userId=${currentPersona.userId}&limit=${PAGE_SIZE}&offset=${offset}&sortBy=${sortBy}&sortOrder=${sortOrder}`
        
        if (filter !== 'all') {
          url += `&type=${filter}`
        }

        const response = await fetch(url)
        const data = await response.json()

        const transformed: DataPacketData[] = data.dataPackets.map((env: any) => {
          const subscriptions = env.asset?.subscriptions || []
          const subscribers = Array.isArray(subscriptions)
            ? subscriptions.map((sub: any) => sub.subscriber?.name).filter(Boolean)
            : []
          
          return {
            id: env.id,
            type: env.type,
            hash: env.hash,
            version: env.version,
            publisherName: env.publisher?.name || 'Unknown',
            assetName: env.asset?.name || 'Unknown',
            subscribers: subscribers,
            createdAt: env.createdAt,
            isRead: env.readReceipts && env.readReceipts.length > 0 ? true : readDataPackets.has(env.id),
          }
        })

        setDataPackets(transformed)
        setTotal(data.total)
      } catch (error) {
        console.error('Error fetching data packets:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDataPackets()
  }, [currentPersona.organizationId, currentPersona.userId, currentPage, filter, sortBy, sortOrder, readDataPackets])

  const handleMarkAsRead = async (envelopeId: string) => {
    try {
      await fetch(`/api/data-packets/${envelopeId}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentPersona.userId }),
      })

      setReadDataPackets((prev) => new Set([...prev, envelopeId]))
      // Update local state
      setDataPackets((prev) =>
        prev.map((env) => (env.id === envelopeId ? { ...env, isRead: true } : env))
      )
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const toggleRow = async (id: string) => {
    const isExpanding = !expandedRows.has(id)
    
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })

    // Fetch payload if expanding and not already loaded
    if (isExpanding) {
      const dataPacket = dataPackets.find(e => e.id === id)
      if (dataPacket && !dataPacket.payload) {
        setLoadingPayloads((prev) => new Set([...prev, id]))
        try {
          const response = await fetch(`/api/data-packets/${id}`)
          const data = await response.json()
          
          setDataPackets((prev) =>
            prev.map((env) =>
              env.id === id ? { ...env, payload: data.payload } : env
            )
          )
        } catch (error) {
          console.error('Error fetching data packet payload:', error)
        } finally {
          setLoadingPayloads((prev) => {
            const next = new Set(prev)
            next.delete(id)
            return next
          })
        }
      }
    }
  }

  const handleDownload = (dataPacket: DataPacketData) => {
    const dataStr = JSON.stringify(dataPacket.payload, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${dataPacket.id}_${dataPacket.type.toLowerCase()}_v${dataPacket.version}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleCopy = async (dataPacket: DataPacketData) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(dataPacket.payload, null, 2))
      setCopiedId(dataPacket.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
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

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
    setCurrentPage(1) // Reset to first page when sorting changes
  }

  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="w-3 h-3 ml-1 opacity-50" />
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 ml-1" />
    ) : (
      <ArrowDown className="w-3 h-3 ml-1" />
    )
  }

  const unreadCount = dataPackets.filter((env) => !env.isRead).length
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
              Showing {showingStart.toLocaleString()} to {showingEnd.toLocaleString()} of {total.toLocaleString()} data packets
            </span>
          </div>
        </motion.div>

        {/* Data Packet Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Inbox className="w-5 h-5 text-primary" />
                Data Packet Ledger
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="empty-state py-12">
                  <p>Loading...</p>
                </div>
              ) : dataPackets.length === 0 ? (
                <div className="empty-state py-12">
                  <Inbox className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p>No data packets found</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[40px] py-2 text-xs">Read</TableHead>
                          <TableHead 
                            className="w-[90px] py-2 text-xs cursor-pointer hover:bg-secondary/50"
                            onClick={() => handleSort('type')}
                          >
                            <div className="flex items-center">
                              Type
                              <SortIcon column="type" />
                            </div>
                          </TableHead>
                          <TableHead 
                            className="py-2 text-xs cursor-pointer hover:bg-secondary/50"
                            onClick={() => handleSort('asset')}
                          >
                            <div className="flex items-center">
                              Asset
                              <SortIcon column="asset" />
                            </div>
                          </TableHead>
                          <TableHead 
                            className="py-2 text-xs cursor-pointer hover:bg-secondary/50"
                            onClick={() => handleSort('publisher')}
                          >
                            <div className="flex items-center">
                              Publisher
                              <SortIcon column="publisher" />
                            </div>
                          </TableHead>
                          <TableHead 
                            className="w-[150px] py-2 text-xs cursor-pointer hover:bg-secondary/50"
                            onClick={() => handleSort('createdAt')}
                          >
                            <div className="flex items-center">
                              Date
                              <SortIcon column="createdAt" />
                            </div>
                          </TableHead>
                          <TableHead className="w-[80px] py-2 text-xs">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dataPackets.map((dataPacket) => (
                          <Fragment key={dataPacket.id}>
                            <TableRow 
                              className={`cursor-pointer hover:bg-secondary/50 ${!dataPacket.isRead ? 'bg-yellow-500/5' : ''}`}
                            >
                              <TableCell className="py-1.5 px-2">
                                {dataPacket.isRead ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                ) : (
                                  <div className="w-3.5 h-3.5 rounded-full bg-yellow-500" />
                                )}
                              </TableCell>
                              <TableCell className="py-1.5 px-2">
                                <Badge
                                  variant="outline"
                                  className={`text-xs px-1.5 py-0 whitespace-nowrap ${TYPE_COLORS[dataPacket.type] || ''}`}
                                >
                                  {dataPacket.type.replace('_', ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-1.5 px-2 text-xs font-medium">
                                {dataPacket.assetName}
                              </TableCell>
                              <TableCell className="py-1.5 px-2 text-xs text-muted-foreground">
                                {dataPacket.publisherName}
                              </TableCell>
                              <TableCell className="py-1.5 px-2 text-xs text-muted-foreground">
                                {formatDate(dataPacket.createdAt)}
                              </TableCell>
                              <TableCell className="py-1.5 px-2">
                                <div className="flex items-center gap-1">
                                  {!dataPacket.isRead && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0"
                                      onClick={() => handleMarkAsRead(dataPacket.id)}
                                      title="Mark as read"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    onClick={() => toggleRow(dataPacket.id)}
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                            {expandedRows.has(dataPacket.id) && (
                              <TableRow>
                                <TableCell colSpan={6} className="bg-secondary/30 p-0">
                                  <div className="p-6 space-y-4">
                                    {/* Metadata */}
                                    <div className="grid grid-cols-2 gap-4 text-sm border-b border-border/50 pb-4">
                                      <div>
                                        <span className="text-muted-foreground">Data Packet ID:</span>
                                        <code className="ml-2 font-mono text-xs">{dataPacket.id}</code>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Full Hash:</span>
                                        <code className="ml-2 font-mono text-xs break-all">{dataPacket.hash}</code>
                                      </div>
                                      {dataPacket.subscribers && dataPacket.subscribers.length > 0 && (
                                        <div className="col-span-2">
                                          <span className="text-muted-foreground">Subscribers:</span>
                                          <div className="mt-1 flex flex-wrap gap-2">
                                            {dataPacket.subscribers.map((subscriber, idx) => (
                                              <Badge key={idx} variant="outline" className="text-xs">
                                                {subscriber}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    {/* Payload Section */}
                                    <div>
                                      <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-semibold text-sm">Payload Data</h4>
                                        {dataPacket.payload && (
                                          <div className="flex items-center gap-2">
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => handleCopy(dataPacket)}
                                              className="h-8"
                                            >
                                              {copiedId === dataPacket.id ? (
                                                <>
                                                  <Check className="w-3.5 h-3.5 mr-1.5" />
                                                  Copied
                                                </>
                                              ) : (
                                                <>
                                                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                                                  Copy JSON
                                                </>
                                              )}
                                            </Button>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => handleDownload(dataPacket)}
                                              className="h-8"
                                            >
                                              <Download className="w-3.5 h-3.5 mr-1.5" />
                                              Download
                                            </Button>
                                          </div>
                                        )}
                                      </div>

                                      {loadingPayloads.has(dataPacket.id) ? (
                                        <div className="code-block border border-border/50 p-4 text-center text-muted-foreground">
                                          <div className="animate-pulse">Loading payload...</div>
                                        </div>
                                      ) : dataPacket.payload ? (
                                        <div className="code-block border border-border/50 rounded-lg overflow-hidden">
                                          <pre className="text-xs overflow-x-auto font-mono font-light p-4 max-h-[500px] overflow-y-auto scrollbar-thin">
                                            {JSON.stringify(dataPacket.payload, null, 2)}
                                          </pre>
                                        </div>
                                      ) : (
                                        <div className="code-block border border-border/50 p-4 text-center text-muted-foreground">
                                          Unable to load payload
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
