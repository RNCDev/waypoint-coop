'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Activity, TrendingUp, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

interface AuditEntry {
  id: number
  type: string
  publisherId: number
  assetId: number
  timestamp: string
  status: string
}

export default function AuditPage() {
  const router = useRouter()
  const { currentUser, currentOrg, _hasHydrated } = useAuthStore()
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)

  // Redirect if user doesn't have access to audit
  // Only check after hydration is complete to avoid false redirects
  useEffect(() => {
    if (_hasHydrated && currentUser && currentOrg) {
      const hasAccess = currentUser.role === 'Platform Admin' || currentOrg.role === 'Platform Admin'
      if (!hasAccess) {
        router.push('/')
      }
    }
  }, [_hasHydrated, currentUser, currentOrg, router])

  useEffect(() => {
    fetchAuditLog()
    const interval = setInterval(fetchAuditLog, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchAuditLog = async () => {
    try {
      const response = await fetch('/api/audit')
      if (response.ok) {
        const data = await response.json()
        setAuditLog(data.slice(0, 50)) // Show latest 50 entries
      }
    } catch (error) {
      console.error('Error fetching audit log:', error)
    } finally {
      setLoading(false)
    }
  }

  const recentEntries = auditLog.slice(0, 5)
  const totalPackets = auditLog.length
  const deliveredCount = auditLog.filter(e => e.status === 'Delivered').length
  const avgLatency = '45ms' // Mock value

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent leading-[1.2] pb-0.5">
          Global Audit
        </h1>
        <p className="text-muted-foreground text-lg">System-wide transaction log</p>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Packets</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPackets}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deliveredCount}</div>
            <p className="text-xs text-muted-foreground">
              {totalPackets > 0 ? Math.round((deliveredCount / totalPackets) * 100) : 0}% success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgLatency}</div>
            <p className="text-xs text-muted-foreground">API response time</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Live Ticker</CardTitle>
          <CardDescription>Recent packet processing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-6">
            {recentEntries.map((entry, idx) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-4 p-2 bg-muted rounded-lg text-sm"
              >
                <Badge variant="outline">Packet #{entry.id}</Badge>
                <span className="text-muted-foreground">
                  Publisher {entry.publisherId} → Asset {entry.assetId}
                </span>
                <span className="ml-auto text-muted-foreground">
                  {format(new Date(entry.timestamp), 'HH:mm:ss')}
                </span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Audit Log</CardTitle>
          <CardDescription>Immutable transaction history</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Publisher</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLog.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No audit entries found
                  </TableCell>
                </TableRow>
              ) : (
                auditLog.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-mono">{entry.id}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{entry.type}</Badge>
                    </TableCell>
                    <TableCell>{entry.publisherId}</TableCell>
                    <TableCell>{entry.assetId}</TableCell>
                    <TableCell>
                      {format(new Date(entry.timestamp), 'MMM d, yyyy HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={entry.status === 'Delivered' ? 'default' : 'destructive'}
                      >
                        {entry.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

