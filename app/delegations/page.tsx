'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { mockOrganizations } from '@/lib/mock-data'

interface Delegation {
  id: string
  subscriberId: number
  delegateId: number
  assetScope: number[] | 'ALL'
  typeScope: string[] | 'ALL'
  status: string
  gpApprovalStatus?: string
}

export default function DelegationsPage() {
  const router = useRouter()
  const { currentUser } = useAuthStore()
  const [delegations, setDelegations] = useState<Delegation[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [delegateEmail, setDelegateEmail] = useState('')
  const [selectedDelegateId, setSelectedDelegateId] = useState('')

  // Redirect if user doesn't have access to delegations
  useEffect(() => {
    if (currentUser) {
      const hasAccess = currentUser.role === 'Subscriber' || currentUser.role === 'Analytics' || currentUser.role === 'Auditor'
      if (!hasAccess) {
        router.push('/')
      }
    }
  }, [currentUser, router])

  useEffect(() => {
    if (currentUser?.orgId) {
      fetchDelegations()
    }
  }, [currentUser])

  const fetchDelegations = async () => {
    try {
      const subscriberId = currentUser?.orgId
      const response = await fetch(`/api/delegations?subscriberId=${subscriberId}`)
      if (response.ok) {
        const data = await response.json()
        setDelegations(data)
      }
    } catch (error) {
      console.error('Error fetching delegations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddDelegate = async () => {
    if (!selectedDelegateId || !currentUser) return

    try {
      const response = await fetch('/api/delegations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriberId: currentUser.orgId,
          delegateId: parseInt(selectedDelegateId),
          assetScope: 'ALL',
          typeScope: 'ALL',
        }),
      })

      if (response.ok) {
        alert('Delegation request created. Waiting for GP approval.')
        setIsDialogOpen(false)
        setDelegateEmail('')
        setSelectedDelegateId('')
        fetchDelegations()
      } else {
        alert('Failed to create delegation')
      }
    } catch (error) {
      console.error('Error creating delegation:', error)
      alert('Error creating delegation')
    }
  }

  const getDelegateName = (delegateId: number) => {
    return mockOrganizations.find(o => o.id === delegateId)?.name || `Delegate ${delegateId}`
  }

  const delegates = mockOrganizations.filter(o => o.role === 'Delegate')

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Delegation Center</h1>
          <p className="text-muted-foreground">Manage delegate access to your data</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Delegate</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Delegate</DialogTitle>
              <DialogDescription>
                Grant access to a third-party service provider
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Delegate Email</Label>
                <Input
                  placeholder="delegate@example.com"
                  value={delegateEmail}
                  onChange={(e) => setDelegateEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Select Delegate Organization</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={selectedDelegateId}
                  onChange={(e) => setSelectedDelegateId(e.target.value)}
                >
                  <option value="">Select delegate...</option>
                  {delegates.map((delegate) => (
                    <option key={delegate.id} value={delegate.id}>
                      {delegate.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-sm text-muted-foreground">
                A magic link will be sent to the delegate email. GP approval is required.
              </div>
              <Button onClick={handleAddDelegate} className="w-full" disabled={!selectedDelegateId}>
                Create Delegation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Delegates</CardTitle>
          <CardDescription>{delegations.length} active delegations</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Delegate</TableHead>
                <TableHead>Asset Scope</TableHead>
                <TableHead>Type Scope</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>GP Approval</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {delegations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No delegations found
                  </TableCell>
                </TableRow>
              ) : (
                delegations.map((delegation) => (
                  <TableRow key={delegation.id}>
                    <TableCell className="font-medium">
                      {getDelegateName(delegation.delegateId)}
                    </TableCell>
                    <TableCell>
                      {delegation.assetScope === 'ALL' ? (
                        <Badge variant="outline">All Assets</Badge>
                      ) : (
                        <span className="text-sm">{delegation.assetScope.length} assets</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {delegation.typeScope === 'ALL' ? (
                        <Badge variant="outline">All Types</Badge>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {(delegation.typeScope as string[]).map((type) => (
                            <Badge key={type} variant="secondary" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          delegation.status === 'Active'
                            ? 'default'
                            : delegation.status === 'Pending GP Approval'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {delegation.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {delegation.gpApprovalStatus && (
                        <Badge
                          variant={
                            delegation.gpApprovalStatus === 'Approved'
                              ? 'default'
                              : delegation.gpApprovalStatus === 'Pending'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {delegation.gpApprovalStatus}
                        </Badge>
                      )}
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

