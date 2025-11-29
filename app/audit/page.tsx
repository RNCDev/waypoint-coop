'use client'

import { useState, useEffect } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollText, Filter } from 'lucide-react'

interface AuditLog {
  id: string
  action: string
  entityType: string
  entityId: string
  details: any
  createdAt: string
  actor: {
    id: string
    name: string
    email: string
  } | null
  organization: {
    id: string
    name: string
    type: string
  } | null
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-green-500/20 text-green-400 border-green-500/30',
  UPDATE: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  DELETE: 'bg-red-500/20 text-red-400 border-red-500/30',
  PUBLISH: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  CORRECT: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  APPROVE: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  REVOKE: 'bg-red-500/20 text-red-400 border-red-500/30',
  VIEW: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [entityFilter, setEntityFilter] = useState<string>('all')

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true)
      try {
        let url = '/api/audit?limit=100'
        if (actionFilter !== 'all') url += `&action=${actionFilter}`
        if (entityFilter !== 'all') url += `&entityType=${entityFilter}`

        const response = await fetch(url)
        const data = await response.json()

        setLogs(data.logs)
        setTotal(data.total)
      } catch (error) {
        console.error('Error fetching audit logs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [actionFilter, entityFilter])

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const uniqueActions = ['CREATE', 'UPDATE', 'DELETE', 'PUBLISH', 'CORRECT', 'APPROVE', 'REVOKE', 'VIEW']
  const uniqueEntities = ['Organization', 'Asset', 'Subscription', 'AccessGrant', 'Envelope', 'User']

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
              <h1 className="text-4xl font-semibold mb-3 gradient-text">Audit Log</h1>
              <p className="text-muted-foreground text-base">
                Complete audit trail of all platform actions
              </p>
            </div>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {total} events
            </Badge>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="mb-6 flex items-center gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Filter className="w-4 h-4 text-muted-foreground" />

          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {uniqueActions.map((action) => (
                <SelectItem key={action} value={action}>
                  {action}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Entity Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entities</SelectItem>
              {uniqueEntities.map((entity) => (
                <SelectItem key={entity} value={entity}>
                  {entity}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="text-sm text-muted-foreground">
            Showing {logs.length} of {total} events
          </span>
        </motion.div>

        {/* Audit Log Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ScrollText className="w-5 h-5 text-primary" />
                Event Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="empty-state">Loading...</div>
              ) : logs.length === 0 ? (
                <div className="empty-state">
                  <ScrollText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p>No audit logs found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Entity</TableHead>
                        <TableHead>Actor</TableHead>
                        <TableHead>Organization</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-xs whitespace-nowrap">
                            {formatDate(log.createdAt)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={ACTION_COLORS[log.action] || ''}
                            >
                              {log.action}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{log.entityType}</span>
                              <span className="text-xs text-muted-foreground font-mono">
                                {log.entityId.slice(0, 12)}...
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {log.actor ? (
                              <div className="flex flex-col">
                                <span>{log.actor.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {log.actor.email}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">System</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {log.organization?.name || '-'}
                          </TableCell>
                          <TableCell className="max-w-[200px]">
                            {log.details ? (
                              <code className="text-xs bg-secondary px-2 py-1 rounded block overflow-x-auto">
                                {JSON.stringify(log.details).slice(0, 50)}...
                              </code>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}

