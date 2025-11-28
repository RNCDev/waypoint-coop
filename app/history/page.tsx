'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { Eye, FileEdit, X } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface Envelope {
  id: number
  publisherId: number
  assetId: number
  timestamp: string
  version: number
  status: string
  dataType?: string
  recipientId: number // Single recipient per envelope
}

export default function HistoryPage() {
  const router = useRouter()
  const { currentUser, currentOrg, _hasHydrated } = useAuthStore()
  const [envelopes, setEnvelopes] = useState<Envelope[]>([])
  const [selectedEnvelope, setSelectedEnvelope] = useState<Envelope | null>(null)
  const [payload, setPayload] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Redirect if user doesn't have access to history
  // Only check after hydration is complete to avoid false redirects
  useEffect(() => {
    if (_hasHydrated && currentUser && currentOrg) {
      const hasAccess = (currentUser.role === 'Publisher' || currentUser.role === 'Asset Owner') && currentOrg.role !== 'Platform Admin'
      if (!hasAccess) {
        router.push('/')
      }
    }
  }, [_hasHydrated, currentUser, currentOrg, router])

  useEffect(() => {
    if (currentOrg?.id) {
      fetchEnvelopes()
    }
  }, [currentOrg])

  const fetchEnvelopes = async () => {
    try {
      const response = await fetch(`/api/envelopes?publisherId=${currentOrg?.id}`)
      if (response.ok) {
        const data = await response.json()
        setEnvelopes(data)
      }
    } catch (error) {
      console.error('Error fetching envelopes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleView = async (envelope: Envelope) => {
    setSelectedEnvelope(envelope)
    try {
      // Publishers see full payload, so pass their orgId
      const orgId = currentUser?.orgId
      const response = await fetch(`/api/payloads/${envelope.id}?orgId=${orgId}`)
      if (response.ok) {
        const data = await response.json()
        setPayload(data.data)
      } else if (response.status === 403) {
        alert('You are not authorized to view this envelope')
      }
    } catch (error) {
      console.error('Error fetching payload:', error)
    }
  }

  const handleCorrect = async (envelope: Envelope) => {
    // Create a new version
    const newVersion = {
      ...envelope,
      version: envelope.version + 1,
      timestamp: new Date().toISOString(),
    }
    // In a real app, this would open the composer with pre-filled data
    alert(`Creating version ${newVersion.version} for envelope ${envelope.id}`)
  }

  const handleRevoke = async (envelope: Envelope) => {
    if (confirm('Are you sure you want to revoke this envelope? This is a soft delete - the envelope will remain in the system but marked as revoked.')) {
      try {
        const response = await fetch(`/api/envelopes/${envelope.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Revoked' }),
        })

        if (response.ok) {
          // Refresh the envelopes list to show updated status
          await fetchEnvelopes()
        } else {
          const error = await response.json()
          alert(`Failed to revoke envelope: ${error.error || 'Unknown error'}`)
        }
      } catch (error) {
        console.error('Error revoking envelope:', error)
        alert('Error revoking envelope')
      }
    }
  }

  // Show loading while auth state is hydrating or data is loading
  if (!_hasHydrated || loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Published History</h1>
        <p className="text-muted-foreground">View and manage your published envelopes</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Envelopes</CardTitle>
          <CardDescription>{envelopes.length} total envelopes</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Date Sent</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {envelopes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No envelopes found
                  </TableCell>
                </TableRow>
              ) : (
                envelopes.map((envelope) => (
                  <TableRow key={envelope.id}>
                    <TableCell className="font-mono">{envelope.id}</TableCell>
                    <TableCell>
                      {format(new Date(envelope.timestamp), 'MMM d, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>Asset {envelope.assetId}</TableCell>
                    <TableCell>
                      {envelope.dataType && (
                        <Badge variant="outline">{envelope.dataType}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge>v{envelope.version}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={envelope.status === 'Delivered' ? 'default' : 'destructive'}
                      >
                        {envelope.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(envelope)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Envelope {envelope.id}</DialogTitle>
                              <DialogDescription>
                                Published on {format(new Date(envelope.timestamp), 'PPpp')}
                              </DialogDescription>
                            </DialogHeader>
                            {payload && (
                              <div className="mt-4">
                                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                                  {JSON.stringify(payload, null, 2)}
                                </pre>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCorrect(envelope)}
                        >
                          <FileEdit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevoke(envelope)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
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

