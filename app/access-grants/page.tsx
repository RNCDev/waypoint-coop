'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/shared/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { GrantBuilder, type GrantFormData, type DelegatableAsset } from '@/components/shared/grant-builder'
import { useAuthStore } from '@/store/auth-store'
import { Shield, CheckCircle, Clock, XCircle } from 'lucide-react'

interface AccessGrant {
  id: string
  status: string
  canPublish: boolean
  canViewData: boolean
  canManageSubscriptions: boolean
  canApproveDelegations: boolean
  validFrom: string
  expiresAt: string | null
  approvedAt: string | null
  grantor: {
    id: string
    name: string
    type: string | null
  }
  grantee: {
    id: string
    name: string
    type: string | null
  }
  asset: {
    id: string
    name: string
    type: string
  } | null
  grantAssets?: {
    asset: {
      id: string
      name: string
      type: string
    }
  }[]
}

interface Organization {
  id: string
  name: string
  type: string | null
}

export default function AccessGrantsPage() {
  const { currentPersona } = useAuthStore()
  const [grants, setGrants] = useState<AccessGrant[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [delegatableAssets, setDelegatableAssets] = useState<DelegatableAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [activeTab, setActiveTab] = useState('given')

  useEffect(() => {
    async function fetchData() {
      try {
        const [grantsRes, orgsRes, assetsRes] = await Promise.all([
          fetch('/api/access-grants'),
          fetch('/api/organizations'),
          fetch(`/api/assets/delegatable?orgId=${currentPersona.organizationId}`),
        ])

        const [grantsData, orgsData, assetsData] = await Promise.all([
          grantsRes.json(),
          orgsRes.json(),
          assetsRes.json(),
        ])

        setGrants(grantsData)
        setOrganizations(orgsData)
        setDelegatableAssets(assetsData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentPersona.organizationId])

  const handleCreateGrant = async (data: GrantFormData) => {
    setCreating(true)
    try {
      const response = await fetch('/api/access-grants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grantorId: currentPersona.organizationId,
          granteeId: data.granteeId,
          assetIds: data.assetIds, // Now sending array of asset IDs
          ...data.capabilities,
          expiresAt: data.expiresAt,
        }),
      })

      if (response.ok) {
        const created = await response.json()
        // Handle both single and array responses
        if (Array.isArray(created)) {
          setGrants((prev) => [...created, ...prev])
        } else {
          setGrants((prev) => [created, ...prev])
        }
      }
    } catch (error) {
      console.error('Error creating grant:', error)
    } finally {
      setCreating(false)
    }
  }

  const handleApprove = async (grantId: string) => {
    try {
      const response = await fetch(`/api/access-grants/${grantId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approverId: currentPersona.userId }),
      })

      if (response.ok) {
        const updated = await response.json()
        setGrants((prev) =>
          prev.map((g) => (g.id === grantId ? updated : g))
        )
      }
    } catch (error) {
      console.error('Error approving grant:', error)
    }
  }

  const handleRevoke = async (grantId: string) => {
    try {
      const response = await fetch(`/api/access-grants/${grantId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setGrants((prev) =>
          prev.map((g) =>
            g.id === grantId ? { ...g, status: 'REVOKED' } : g
          )
        )
      }
    } catch (error) {
      console.error('Error revoking grant:', error)
    }
  }

  const givenGrants = grants.filter(
    (g) => g.grantor.id === currentPersona.organizationId
  )
  const receivedGrants = grants.filter(
    (g) => g.grantee.id === currentPersona.organizationId
  )
  const pendingApprovals = grants.filter(
    (g) => g.status === 'PENDING_APPROVAL'
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'PENDING_APPROVAL':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'REVOKED':
      case 'EXPIRED':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  const getCapabilities = (grant: AccessGrant) => {
    const caps = []
    if (grant.canPublish) caps.push('Publish')
    if (grant.canViewData) caps.push('View')
    if (grant.canManageSubscriptions) caps.push('Subscriptions')
    if (grant.canApproveDelegations) caps.push('Approve')
    return caps.join(', ')
  }

  const getAssetDisplay = (grant: AccessGrant) => {
    // Check for multi-asset grants first
    if (grant.grantAssets && grant.grantAssets.length > 0) {
      if (grant.grantAssets.length === 1) {
        return grant.grantAssets[0].asset.name
      }
      return `${grant.grantAssets.length} assets`
    }
    // Fall back to legacy single asset
    if (grant.asset) {
      return grant.asset.name
    }
    return (
      <Badge variant="outline" className="bg-purple-500/20 text-purple-400">
        All Assets
      </Badge>
    )
  }

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
          <h1 className="text-4xl font-semibold mb-3 gradient-text">Access Grants</h1>
          <p className="text-muted-foreground text-base">
            Manage delegated capabilities and permissions
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Grant Builder */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <GrantBuilder
              organizations={organizations}
              delegatableAssets={delegatableAssets}
              currentOrgId={currentPersona.organizationId}
              onSubmit={handleCreateGrant}
              isLoading={creating}
            />
          </motion.div>

          {/* Grants List */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="given">
                  Given ({givenGrants.length})
                </TabsTrigger>
                <TabsTrigger value="received">
                  Received ({receivedGrants.length})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pending ({pendingApprovals.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="given" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      Grants You've Given
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <GrantsTable
                      grants={givenGrants}
                      showGrantee
                      getStatusIcon={getStatusIcon}
                      getCapabilities={getCapabilities}
                      getAssetDisplay={getAssetDisplay}
                      onRevoke={handleRevoke}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="received" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      Grants You've Received
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <GrantsTable
                      grants={receivedGrants}
                      showGrantor
                      getStatusIcon={getStatusIcon}
                      getCapabilities={getCapabilities}
                      getAssetDisplay={getAssetDisplay}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="pending" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-yellow-500" />
                      Pending Approvals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <GrantsTable
                      grants={pendingApprovals}
                      showGrantor
                      showGrantee
                      getStatusIcon={getStatusIcon}
                      getCapabilities={getCapabilities}
                      getAssetDisplay={getAssetDisplay}
                      onApprove={handleApprove}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

function GrantsTable({
  grants,
  showGrantor,
  showGrantee,
  getStatusIcon,
  getCapabilities,
  getAssetDisplay,
  onApprove,
  onRevoke,
}: {
  grants: AccessGrant[]
  showGrantor?: boolean
  showGrantee?: boolean
  getStatusIcon: (status: string) => React.ReactNode
  getCapabilities: (grant: AccessGrant) => string
  getAssetDisplay: (grant: AccessGrant) => React.ReactNode
  onApprove?: (id: string) => void
  onRevoke?: (id: string) => void
}) {
  if (grants.length === 0) {
    return (
      <div className="empty-state">
        <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p>No grants found</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {showGrantor && <TableHead>Grantor</TableHead>}
            {showGrantee && <TableHead>Grantee</TableHead>}
            <TableHead>Asset(s)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Capabilities</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {grants.map((grant) => (
            <TableRow key={grant.id}>
              {showGrantor && (
                <TableCell className="font-medium">{grant.grantor.name}</TableCell>
              )}
              {showGrantee && (
                <TableCell className="font-medium">{grant.grantee.name}</TableCell>
              )}
              <TableCell>{getAssetDisplay(grant)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getStatusIcon(grant.status)}
                  <span>{grant.status.replace('_', ' ')}</span>
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {getCapabilities(grant)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {grant.status === 'PENDING_APPROVAL' && onApprove && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onApprove(grant.id)}
                    >
                      Approve
                    </Button>
                  )}
                  {grant.status === 'ACTIVE' && onRevoke && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-400 hover:text-red-300"
                      onClick={() => onRevoke(grant.id)}
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
