'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Check, X, Clock, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'
import { Delegation, DataType } from '@/types'
import { mockOrganizations, mockAssets } from '@/lib/mock-data'

export default function DelegationApprovalsPage() {
  const router = useRouter()
  const { currentUser, currentOrg, _hasHydrated } = useAuthStore()
  const [delegations, setDelegations] = useState<Delegation[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  // Redirect if user doesn't have access (only Asset Owners can approve)
  useEffect(() => {
    if (_hasHydrated && currentUser && currentOrg) {
      const hasAccess = 
        currentOrg.role === 'Asset Owner' || 
        currentOrg.role === 'Platform Admin'
      if (!hasAccess) {
        router.push('/')
      }
    }
  }, [_hasHydrated, currentUser, currentOrg, router])

  useEffect(() => {
    fetchDelegations()
  }, [currentUser])

  const fetchDelegations = async () => {
    if (!currentUser) return
    
    try {
      const response = await fetch('/api/delegations', {
        headers: {
          'x-user-id': currentUser.id.toString(),
        },
      })

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

  const handleApprove = async (id: string) => {
    if (!currentUser) return
    setProcessingId(id)

    try {
      const response = await fetch(`/api/delegations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id.toString(),
        },
        body: JSON.stringify({
          gpApprovalStatus: 'Approved',
        }),
      })

      if (response.ok) {
        fetchDelegations()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to approve delegation')
      }
    } catch (error) {
      console.error('Error approving delegation:', error)
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (id: string) => {
    if (!currentUser) return
    
    if (!confirm('Are you sure you want to reject this delegation request?')) return
    
    setProcessingId(id)

    try {
      const response = await fetch(`/api/delegations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id.toString(),
        },
        body: JSON.stringify({
          gpApprovalStatus: 'Rejected',
        }),
      })

      if (response.ok) {
        fetchDelegations()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to reject delegation')
      }
    } catch (error) {
      console.error('Error rejecting delegation:', error)
    } finally {
      setProcessingId(null)
    }
  }

  const getOrgName = (orgId: number) => {
    const org = mockOrganizations.find(o => o.id === orgId)
    return org?.name || `Org ${orgId}`
  }

  const getAssetNames = (assetScope: number[] | 'ALL') => {
    if (assetScope === 'ALL') return 'All Assets'
    return assetScope.map(id => {
      const asset = mockAssets.find(a => a.id === id)
      return asset?.name || `Asset ${id}`
    }).join(', ')
  }

  const getTypeNames = (typeScope: DataType[] | 'ALL') => {
    if (typeScope === 'ALL') return 'All Types'
    return typeScope.join(', ')
  }

  const pendingDelegations = delegations.filter(
    d => d.status === 'Pending GP Approval' && d.gpApprovalStatus === 'Pending'
  )

  const processedDelegations = delegations.filter(
    d => d.gpApprovalStatus === 'Approved' || d.gpApprovalStatus === 'Rejected'
  )

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
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Delegation Approvals
        </h1>
        <p className="text-muted-foreground text-lg">
          Review and approve LP delegation requests for your assets
        </p>
      </motion.div>

      {pendingDelegations.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          <span className="text-sm">
            You have {pendingDelegations.length} pending delegation request{pendingDelegations.length !== 1 ? 's' : ''} awaiting approval
          </span>
        </div>
      )}

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="relative">
            Pending
            {pendingDelegations.length > 0 && (
              <Badge className="ml-2 h-5 px-1.5" variant="destructive">
                {pendingDelegations.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="processed">Processed</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approval</CardTitle>
              <CardDescription>
                Delegation requests that need your approval before taking effect
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingDelegations.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No pending delegation requests</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subscriber (LP)</TableHead>
                      <TableHead>Delegate</TableHead>
                      <TableHead>Assets</TableHead>
                      <TableHead>Data Types</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead className="w-[150px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingDelegations.map((delegation) => (
                      <TableRow key={delegation.id}>
                        <TableCell className="font-medium">
                          {getOrgName(delegation.subscriberId)}
                        </TableCell>
                        <TableCell>{getOrgName(delegation.delegateId)}</TableCell>
                        <TableCell className="max-w-[150px] truncate">
                          {getAssetNames(delegation.assetScope)}
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate">
                          {getTypeNames(delegation.typeScope)}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {delegation.createdAt 
                            ? new Date(delegation.createdAt).toLocaleDateString()
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(delegation.id)}
                              disabled={processingId === delegation.id}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(delegation.id)}
                              disabled={processingId === delegation.id}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Processed Requests</CardTitle>
              <CardDescription>
                Delegation requests you have already approved or rejected
              </CardDescription>
            </CardHeader>
            <CardContent>
              {processedDelegations.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  No processed delegation requests
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subscriber (LP)</TableHead>
                      <TableHead>Delegate</TableHead>
                      <TableHead>Assets</TableHead>
                      <TableHead>Data Types</TableHead>
                      <TableHead>Decision</TableHead>
                      <TableHead>Processed At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processedDelegations.map((delegation) => (
                      <TableRow key={delegation.id}>
                        <TableCell className="font-medium">
                          {getOrgName(delegation.subscriberId)}
                        </TableCell>
                        <TableCell>{getOrgName(delegation.delegateId)}</TableCell>
                        <TableCell className="max-w-[150px] truncate">
                          {getAssetNames(delegation.assetScope)}
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate">
                          {getTypeNames(delegation.typeScope)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={delegation.gpApprovalStatus === 'Approved' ? 'default' : 'destructive'}
                          >
                            {delegation.gpApprovalStatus === 'Approved' ? (
                              <>
                                <Check className="w-3 h-3 mr-1" />
                                Approved
                              </>
                            ) : (
                              <>
                                <X className="w-3 h-3 mr-1" />
                                Rejected
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {delegation.gpApprovedAt 
                            ? new Date(delegation.gpApprovedAt).toLocaleDateString()
                            : '-'
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

