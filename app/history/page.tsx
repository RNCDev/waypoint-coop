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
import { History, Filter, Eye, Copy, Check, ArrowUpDown, ArrowUp, ArrowDown, Map } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ToastContainer } from '@/components/ui/toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { RouteMap } from '@/components/shared/route-map'

interface DataPacketData {
  id: string
  type: string
  hash: string
  version: number
  parentId: string | null
  publisherId: string
  publisherName: string
  assetId: string
  assetName: string
  subscribers: string[] // Array of subscriber names
  createdAt: string
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

export default function HistoryPage() {
  const { currentPersona } = useAuthStore()
  const [dataPackets, setDataPackets] = useState<DataPacketData[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [loadingPayloads, setLoadingPayloads] = useState<Set<string>>(new Set())
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<string>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [toasts, setToasts] = useState<Array<{ id: string; message: string }>>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [routeMapPacket, setRouteMapPacket] = useState<DataPacketData | null>(null)

  useEffect(() => {
    async function fetchDataPackets() {
      setLoading(true)
      try {
        const isGP = currentPersona.organizationType === 'GP'
        const isLP = currentPersona.organizationType === 'LP'
        const isAuditor = ['AUDITOR', 'CONSULTANT', 'TAX_ADVISOR'].includes(currentPersona.organizationType)
        const offset = (currentPage - 1) * PAGE_SIZE
        let url = ''

        if (isGP) {
          // GPs see envelopes for assets they manage
          url = `/api/data-packets?managerId=${currentPersona.organizationId}&limit=${PAGE_SIZE}&offset=${offset}&sortBy=${sortBy}&sortOrder=${sortOrder}`
        } else if (isLP) {
          // LPs see data packets for assets they're subscribed to
          url = `/api/data-packets?subscriberId=${currentPersona.organizationId}&limit=${PAGE_SIZE}&offset=${offset}&sortBy=${sortBy}&sortOrder=${sortOrder}`
        } else if (isAuditor) {
          // Auditors/Consultants see data packets they have access to through grants
          // The API will handle this via subscriberId which checks both subscriptions and grants
          url = `/api/data-packets?subscriberId=${currentPersona.organizationId}&limit=${PAGE_SIZE}&offset=${offset}&sortBy=${sortBy}&sortOrder=${sortOrder}`
        } else {
          // Others (Fund Admin, etc.) see data packets they published
          url = `/api/data-packets?publisherId=${currentPersona.organizationId}&limit=${PAGE_SIZE}&offset=${offset}&sortBy=${sortBy}&sortOrder=${sortOrder}`
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
            parentId: env.parentId,
            publisherId: env.publisher?.id || '',
            publisherName: env.publisher?.name || 'Unknown',
            assetId: env.asset?.id || '',
            assetName: env.asset?.name || 'Unknown',
            subscribers: subscribers,
            createdAt: env.createdAt,
          }
        })

        // Filter corrections if needed
        const filtered = filter === 'corrections' 
          ? transformed.filter((env) => env.version > 1)
          : transformed

        setDataPackets(filtered)
        setTotal(data.total)
      } catch (error) {
        console.error('Error fetching data packets:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDataPackets()
  }, [currentPersona.organizationId, currentPersona.organizationType, currentPage, filter, sortBy, sortOrder])

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

  const showToast = (message: string) => {
    const id = Math.random().toString(36).substring(7)
    setToasts((prev) => [...prev, { id, message }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(dataPackets.map((dp) => dp.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(id)
      } else {
        next.delete(id)
      }
      return next
    })
  }

  const handleExport = (format: string) => {
    const count = selectedIds.size
    if (count === 0) {
      showToast('Please select at least one data packet to export')
      return
    }
    const message = count === 1 
      ? `Exporting to ${format}` 
      : `Exporting ${count} data packets to ${format}`
    showToast(message)
  }

  const isAllSelected = dataPackets.length > 0 && selectedIds.size === dataPackets.length

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

  const correctionCount = dataPackets.filter((env) => env.version > 1).length
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
                  ? 'View all data packets published for your assets'
                  : currentPersona.organizationType === 'LP'
                  ? 'View all data packets from your subscribed funds'
                  : ['AUDITOR', 'CONSULTANT', 'TAX_ADVISOR'].includes(currentPersona.organizationType)
                  ? 'View all data packets you have access to through grants'
                  : 'View all data packets published by your organization'}
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
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  Data Packet History
                </CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={selectedIds.size === 0}
                    >
                      EXPORT {selectedIds.size > 0 && `(${selectedIds.size})`}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleExport('Excel')}>
                      Excel
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('CSV')}>
                      CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('Carta')}>
                      Carta
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('LP Analyst')}>
                      LP Analyst
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('eFront')}>
                      eFront
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('Cobalt')}>
                      Cobalt
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="empty-state py-12">
                  <p>Loading...</p>
                </div>
              ) : dataPackets.length === 0 ? (
                <div className="empty-state py-12">
                  <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p>No data packets found</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[40px] py-2">
                            <Checkbox
                              checked={isAllSelected}
                              onCheckedChange={handleSelectAll}
                            />
                          </TableHead>
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
                            className="w-[100px] py-2 text-xs cursor-pointer hover:bg-secondary/50"
                            onClick={() => handleSort('version')}
                          >
                            <div className="flex items-center">
                              Version
                              <SortIcon column="version" />
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
                            <TableRow className="cursor-pointer hover:bg-secondary/50">
                              <TableCell className="py-1.5 px-2">
                                <Checkbox
                                  checked={selectedIds.has(dataPacket.id)}
                                  onCheckedChange={(checked) => handleSelectOne(dataPacket.id, checked as boolean)}
                                  onClick={(e) => e.stopPropagation()}
                                />
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
                              <TableCell className="py-1.5 px-2">
                                {dataPacket.version > 1 ? (
                                  <Badge variant="outline" className="text-xs px-1.5 py-0 bg-orange-500/20 text-orange-400">
                                    v{dataPacket.version}
                                  </Badge>
                                ) : (
                                  <span className="text-xs text-muted-foreground">v{dataPacket.version}</span>
                                )}
                              </TableCell>
                              <TableCell className="py-1.5 px-2 text-xs text-muted-foreground">
                                {formatDate(dataPacket.createdAt)}
                              </TableCell>
                              <TableCell className="py-1.5 px-2">
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    onClick={() => toggleRow(dataPacket.id)}
                                    title="View payload"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    onClick={() => setRouteMapPacket(dataPacket)}
                                    title="View route map"
                                  >
                                    <Map className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                            {expandedRows.has(dataPacket.id) && (
                              <TableRow>
                                <TableCell colSpan={7} className="bg-secondary/30 p-0">
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
                                      {dataPacket.parentId && (
                                        <div>
                                          <span className="text-muted-foreground">Parent:</span>
                                          <code className="ml-2 font-mono text-xs">{dataPacket.parentId}</code>
                                        </div>
                                      )}
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

      {/* Route Map Dialog */}
      <Dialog open={!!routeMapPacket} onOpenChange={(open) => !open && setRouteMapPacket(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Map className="w-5 h-5 text-primary" />
              Data Packet Route Map
            </DialogTitle>
            <DialogDescription>
              Visualization of the permission topology for {routeMapPacket?.assetName}
            </DialogDescription>
          </DialogHeader>
          {routeMapPacket && (
            <RouteMap
              assetId={routeMapPacket.assetId}
              publisherId={routeMapPacket.publisherId}
              assetName={routeMapPacket.assetName}
              viewerOrgId={currentPersona.organizationId}
            />
          )}
        </DialogContent>
      </Dialog>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
