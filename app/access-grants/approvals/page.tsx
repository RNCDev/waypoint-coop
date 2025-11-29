'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { AccessGrant } from '@/types'
import { mockAssets, mockOrganizations } from '@/lib/mock-data'

export default function AccessGrantApprovalsPage() {
  const router = useRouter()
  const { currentUser, currentOrg, _hasHydrated } = useAuthStore()
  const [pendingGrants, setPendingGrants] = useState<AccessGrant[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  // Only Asset Managers and Delegates with approval rights can view this page
  useEffect(() => {
    if (_hasHydrated && currentUser && currentOrg) {
      const hasAccess = 
        currentOrg.role === 'Asset Manager' || 
        currentOrg.role === 'Delegate' ||
        currentOrg.role === 'Platform Admin'
      if (!hasAccess) {
        router.push('/')
      }
    }
  }, [_hasHydrated, currentUser, currentOrg, router])

  const fetchPendingGrants = useCallback(async () => {
    if (!currentUser) return
    
    try {
      const response = await fetch('/api/access-grants?pendingApproval=true', {
        headers: {
          'x-user-id': currentUser.id.toString(),
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPendingGrants(data)
      }
    } catch (error) {
      console.error('Error fetching pending grants:', error)
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  useEffect(() => {
    fetchPendingGrants()
  }, [fetchPendingGrants])

  const handleApprove = async (id: string) => {
    if (!currentUser) return
    setProcessingId(id)

    try {
      const response = await fetch(`/api/access-grants/${id}/approve`, {
        method: 'POST',
        headers: {
          'x-user-id': currentUser.id.toString(),
        },
      })

      if (response.ok) {
        fetchPendingGrants()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to approve grant')
      }
    } catch (error) {
      console.error('Error approving grant:', error)
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (id: string) => {
    if (!currentUser) return
    if (!confirm('Are you sure you want to reject this access grant?')) return
    setProcessingId(id)

    try {
      const response = await fetch(`/api/access-grants/${id}/reject`, {
        method: 'POST',
        headers: {
          'x-user-id': currentUser.id.toString(),
        },
      })

      if (response.ok) {
        fetchPendingGrants()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to reject grant')
      }
    } catch (error) {
      console.error('Error rejecting grant:', error)
    } finally {
      setProcessingId(null)
    }
  }

  const getAssetNames = (assetScope: number[] | 'ALL') => {
    if (assetScope === 'ALL') return 'All Assets'
    return assetScope.map(id => {
      const asset = mockAssets.find(a => a.id === id)
      return asset?.name || `Asset ${id}`
    }).join(', ')
  }

  const getDataTypeNames = (typeScope: string[] | 'ALL') => {
    if (typeScope === 'ALL') return 'All Types'
    return (typeScope as string[]).map(t => t.replace(/_/g, ' ')).join(', ')
  }

  const getOrgName = (orgId: number) => {
    const org = mockOrganizations.find(o => o.id === orgId)
    return org?.name || `Org ${orgId}`
  }

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
          Grant Approvals
        </h1>
        <p className="text-muted-foreground text-lg">
          Review and approve LP data access grants that require GP approval
        </p>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>
            {pendingGrants.length} grant{pendingGrants.length !== 1 ? 's' : ''} pending approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingGrants.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              No grants pending approval
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Limited Partner</TableHead>
                  <TableHead>Delegate</TableHead>
                  <TableHead>Asset Scope</TableHead>
                  <TableHead>Data Types</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingGrants.map((grant) => (
                  <TableRow key={grant.id}>
                    <TableCell className="font-medium">
                      {getOrgName(grant.grantorId)}
                    </TableCell>
                    <TableCell>
                      {getOrgName(grant.granteeId)}
                    </TableCell>
                    <TableCell className="max-w-[150px]">
                      <span className="truncate block" title={getAssetNames(grant.assetScope)}>
                        {grant.assetScope === 'ALL' ? (
                          <Badge variant="outline">All Assets</Badge>
                        ) : (
                          `${grant.assetScope.length} asset${grant.assetScope.length !== 1 ? 's' : ''}`
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[150px]">
                      <span className="truncate block" title={getDataTypeNames(grant.dataTypeScope)}>
                        {grant.dataTypeScope === 'ALL' ? (
                          <Badge variant="outline">All Types</Badge>
                        ) : (
                          `${grant.dataTypeScope.length} type${grant.dataTypeScope.length !== 1 ? 's' : ''}`
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {new Date(grant.grantedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleApprove(grant.id)}
                          disabled={processingId === grant.id}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(grant.id)}
                          disabled={processingId === grant.id}
                        >
                          <X className="w-4 h-4" />
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
    </div>
  )
}

