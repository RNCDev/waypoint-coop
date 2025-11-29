'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { format } from 'date-fns'
import { ChevronDown, ChevronUp, Download, Printer, CheckCircle2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Eye, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { mockAssets, mockOrganizations } from '@/lib/mock-data'
import { motion } from 'framer-motion'

interface Envelope {
  id: number
  publisherId: number
  assetId: number
  timestamp: string
  dataType?: string
  recipientId: number
}

type SortField = 'timestamp' | 'asset' | 'publisher' | 'dataType'
type SortDirection = 'asc' | 'desc'

export default function LedgerPage() {
  const router = useRouter()
  const { currentUser, currentOrg, _hasHydrated } = useAuthStore()
  const [envelopes, setEnvelopes] = useState<Envelope[]>([])
  const [payloads, setPayloads] = useState<Record<number, any>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  
  // Sorting state
  const [sortField, setSortField] = useState<SortField>('timestamp')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  
  // Detail dialog state
  const [selectedEnvelope, setSelectedEnvelope] = useState<Envelope | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  // Redirect if user doesn't have access to ledger
  // Only check after hydration is complete to avoid false redirects
  useEffect(() => {
    if (_hasHydrated && currentUser) {
      const hasAccess = 
        currentUser.role === 'Limited Partner' || 
        currentUser.role === 'Analytics' || 
        currentUser.role === 'Auditor' ||
        currentOrg?.role === 'Delegate'
      if (!hasAccess) {
        router.push('/')
      }
    }
  }, [_hasHydrated, currentUser, currentOrg, router])

  const fetchEnvelopes = useCallback(async () => {
    try {
      // For subscribers, filter by subscriberId
      // For delegates, fetch all and let the API filter based on delegations
      let url = '/api/envelopes'
      if (currentOrg?.role === 'Limited Partner' && currentUser?.orgId) {
        url = `/api/envelopes?subscriberId=${currentUser.orgId}`
      }
      // For delegates, don't add subscriberId - the API will filter based on delegations
      
      const response = await fetch(url, {
        headers: {
          'x-user-id': currentUser?.id.toString() || '',
        },
      })
      if (response.ok) {
        const data = await response.json()
        setEnvelopes(data)
      }
    } catch (error) {
      console.error('Error fetching envelopes:', error)
    } finally {
      setLoading(false)
    }
  }, [currentUser, currentOrg])

  useEffect(() => {
    if (currentUser?.orgId) {
      fetchEnvelopes()
    }
  }, [currentUser, fetchEnvelopes])

  const handleViewDetails = async (envelope: Envelope) => {
    setSelectedEnvelope(envelope)
    setDetailDialogOpen(true)

    // Fetch payload if not already loaded
    if (!payloads[envelope.id]) {
      try {
        const orgId = currentUser?.orgId
        const response = await fetch(`/api/payloads/${envelope.id}?orgId=${orgId}`, {
          headers: {
            'x-user-id': currentUser?.id.toString() || '',
          },
        })
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

  // Toggle sort direction or change sort field
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
    setCurrentPage(1) // Reset to first page when sorting changes
  }

  // Get sort icon for column header
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-3 w-3 ml-1" />
      : <ArrowDown className="h-3 w-3 ml-1" />
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

  // Filter, sort, and paginate envelopes
  const { paginatedEnvelopes, totalPages, totalCount } = useMemo(() => {
    // Filter
    let filtered = envelopes.filter((env) => {
      const assetName = getAssetName(env.assetId).toLowerCase()
      const publisherName = getPublisherName(env.publisherId).toLowerCase()
      const search = searchTerm.toLowerCase()
      return assetName.includes(search) || publisherName.includes(search) || env.dataType?.toLowerCase().includes(search)
    })

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'timestamp':
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          break
        case 'asset':
          comparison = getAssetName(a.assetId).localeCompare(getAssetName(b.assetId))
          break
        case 'publisher':
          comparison = getPublisherName(a.publisherId).localeCompare(getPublisherName(b.publisherId))
          break
        case 'dataType':
          comparison = (a.dataType || '').localeCompare(b.dataType || '')
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    const totalCount = filtered.length
    const totalPages = Math.ceil(totalCount / pageSize)
    
    // Paginate
    const startIndex = (currentPage - 1) * pageSize
    const paginatedEnvelopes = filtered.slice(startIndex, startIndex + pageSize)

    return { paginatedEnvelopes, totalPages, totalCount }
  }, [envelopes, searchTerm, sortField, sortDirection, currentPage, pageSize])

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent leading-[1.2] pb-0.5">
          Ledger
        </h1>
        <p className="text-muted-foreground">Your data feed</p>
      </motion.div>

      {/* Controls Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <Input
          placeholder="Search by fund, publisher, or type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Show</span>
          <Select value={pageSize.toString()} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1); }}>
            <SelectTrigger className="w-[70px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span>per page</span>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {totalCount === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No envelopes found
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">
                      <button 
                        onClick={() => handleSort('timestamp')} 
                        className="flex items-center hover:text-foreground transition-colors"
                      >
                        Date {getSortIcon('timestamp')}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button 
                        onClick={() => handleSort('asset')} 
                        className="flex items-center hover:text-foreground transition-colors"
                      >
                        Asset {getSortIcon('asset')}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button 
                        onClick={() => handleSort('dataType')} 
                        className="flex items-center hover:text-foreground transition-colors"
                      >
                        Type {getSortIcon('dataType')}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button 
                        onClick={() => handleSort('publisher')} 
                        className="flex items-center hover:text-foreground transition-colors"
                      >
                        Publisher {getSortIcon('publisher')}
                      </button>
                    </TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEnvelopes.map((envelope) => (
                    <TableRow 
                      key={envelope.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleViewDetails(envelope)}
                    >
                      <TableCell className="text-sm tabular-nums">
                        {format(new Date(envelope.timestamp), 'MMM d, yyyy')}
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(envelope.timestamp), 'HH:mm')}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {getAssetName(envelope.assetId)}
                      </TableCell>
                      <TableCell>
                        {envelope.dataType && (
                          <Badge variant="outline" className="text-xs">
                            {envelope.dataType.replace(/_/g, ' ')}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {getPublisherName(envelope.publisherId)}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={(e) => { e.stopPropagation(); handleViewDetails(envelope); }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalCount)} of {totalCount}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="px-3 text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {selectedEnvelope && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {getAssetName(selectedEnvelope.assetId)}
                  {selectedEnvelope.dataType && (
                    <Badge variant="outline">{selectedEnvelope.dataType.replace(/_/g, ' ')}</Badge>
                  )}
                </DialogTitle>
                <DialogDescription>
                  Published by {getPublisherName(selectedEnvelope.publisherId)} on{' '}
                  {format(new Date(selectedEnvelope.timestamp), 'MMMM d, yyyy \'at\' HH:mm')}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Read receipt sent</span>
                </div>

                <div className="border rounded-lg p-4 bg-muted/30">
                  {payloads[selectedEnvelope.id] ? (
                    renderPayloadTable(payloads[selectedEnvelope.id])
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading payload...
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download JSON
                  </Button>
                  <Button variant="outline" size="sm">
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

