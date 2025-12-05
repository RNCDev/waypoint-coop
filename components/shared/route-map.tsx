'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Badge } from '@/components/ui/badge'
import { Building2, Users, Shield, Send } from 'lucide-react'

interface RouteMapData {
  asset: {
    id: string
    name: string
    type: string
  }
  manager: {
    id: string
    name: string
    type: string | null
  }
  subscribers: {
    id: string
    name: string
    type: string | null
  }[]
  grants: {
    id: string
    grantee: {
      id: string
      name: string
      type: string | null
    }
    grantor: {
      id: string
      name: string
      type: string | null
    }
    canPublish: boolean
    canViewData: boolean
    canManageSubscriptions: boolean
    canApproveDelegations: boolean
  }[]
}

interface RouteMapProps {
  assetId: string
  publisherId: string
  assetName: string
  viewerOrgId: string // The organization viewing the route map (for privacy filtering)
}

// Color mapping for organization types
// Note: All class names must be static for Tailwind JIT to compile them
const TYPE_COLORS: Record<string, { bg: string; border: string; text: string; handle: string }> = {
  GP: { bg: 'bg-blue-500/20', border: 'border-blue-500', text: 'text-blue-400', handle: '!bg-blue-500' },
  LP: { bg: 'bg-green-500/20', border: 'border-green-500', text: 'text-green-400', handle: '!bg-green-500' },
  FUND_ADMIN: { bg: 'bg-purple-500/20', border: 'border-purple-500', text: 'text-purple-400', handle: '!bg-purple-500' },
  AUDITOR: { bg: 'bg-yellow-500/20', border: 'border-yellow-500', text: 'text-yellow-400', handle: '!bg-yellow-500' },
  CONSULTANT: { bg: 'bg-orange-500/20', border: 'border-orange-500', text: 'text-orange-400', handle: '!bg-orange-500' },
  TAX_ADVISOR: { bg: 'bg-pink-500/20', border: 'border-pink-500', text: 'text-pink-400', handle: '!bg-pink-500' },
  PLATFORM_ADMIN: { bg: 'bg-red-500/20', border: 'border-red-500', text: 'text-red-400', handle: '!bg-red-500' },
}

const DEFAULT_COLORS = { bg: 'bg-gray-500/20', border: 'border-gray-500', text: 'text-gray-400', handle: '!bg-gray-500' }

// Custom node components
function AssetNode({ data }: { data: { label: string; type: string } }) {
  return (
    <div className="px-4 py-3 rounded-lg bg-primary/20 border-2 border-primary shadow-lg shadow-primary/20 min-w-[140px] text-center">
      <Handle type="target" position={Position.Top} className="!bg-primary" />
      <div className="flex items-center justify-center gap-2 mb-1">
        <Building2 className="w-4 h-4 text-primary" />
        <span className="text-xs text-muted-foreground uppercase">{data.type}</span>
      </div>
      <div className="font-semibold text-sm text-foreground">{data.label}</div>
      <Handle type="source" position={Position.Bottom} className="!bg-primary" />
      <Handle type="source" position={Position.Left} className="!bg-primary" id="left" />
      <Handle type="source" position={Position.Right} className="!bg-primary" id="right" />
    </div>
  )
}

function OrgNode({ data }: { data: { label: string; type: string | null; role: string; isPublisher?: boolean; delegatorName?: string } }) {
  const colors = TYPE_COLORS[data.type || ''] || DEFAULT_COLORS
  const Icon = data.role === 'manager' ? Building2 : data.role === 'subscriber' ? Users : Shield

  return (
    <div className={`px-4 py-3 rounded-lg ${colors.bg} border-2 ${colors.border} min-w-[140px] text-center relative ${data.isPublisher ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}>
      <Handle type="target" position={Position.Top} className={colors.handle} />
      <Handle type="target" position={Position.Left} className={colors.handle} id="left" />
      <Handle type="target" position={Position.Right} className={colors.handle} id="right" />
      <div className="flex items-center justify-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${colors.text}`} />
        <span className={`text-xs uppercase ${colors.text}`}>{data.type || 'ORG'}</span>
      </div>
      <div className="font-semibold text-sm text-foreground">{data.label}</div>
      {data.delegatorName && (
        <div className="mt-1 text-[9px] text-muted-foreground italic">
          Delegated by: {data.delegatorName}
        </div>
      )}
      {data.isPublisher && (
        <div className="absolute -top-2 -right-2">
          <Badge variant="outline" className="bg-primary/20 text-primary border-primary text-[10px] px-1.5 py-0">
            <Send className="w-2.5 h-2.5 mr-0.5" />
            Publisher
          </Badge>
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className={colors.handle} />
    </div>
  )
}

const nodeTypes = {
  asset: AssetNode,
  org: OrgNode,
}

export function RouteMap({ assetId, publisherId, assetName, viewerOrgId }: RouteMapProps) {
  const [routeData, setRouteData] = useState<RouteMapData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Reset state when props change to show loading indicator
    setLoading(true)
    setError(null)

    async function fetchRouteData() {
      try {
        // Pass viewerOrgId for privacy-aware filtering
        const response = await fetch(`/api/assets/${assetId}/route-map?viewerOrgId=${viewerOrgId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch route data')
        }
        const data = await response.json()
        setRouteData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchRouteData()
  }, [assetId, viewerOrgId])

  const { initialNodes, initialEdges } = useMemo(() => {
    if (!routeData) return { initialNodes: [], initialEdges: [] }

    const nodes: Node[] = []
    const edges: Edge[] = []

    // Center asset node
    nodes.push({
      id: 'asset',
      type: 'asset',
      position: { x: 250, y: 200 },
      data: { label: routeData.asset.name, type: routeData.asset.type.replace('_', ' ') },
    })

    // Manager node at top
    const isManagerPublisher = routeData.manager.id === publisherId
    nodes.push({
      id: 'manager',
      type: 'org',
      position: { x: 250, y: 50 },
      data: {
        label: routeData.manager.name,
        type: routeData.manager.type,
        role: 'manager',
        isPublisher: isManagerPublisher,
      },
    })
    edges.push({
      id: 'manager-asset',
      source: 'manager',
      target: 'asset',
      animated: true,
      style: { stroke: 'hsl(var(--primary))' },
      markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--primary))' },
      label: 'Manages',
      labelStyle: { fill: 'hsl(var(--muted-foreground))', fontSize: 10 },
      labelBgStyle: { fill: 'hsl(var(--background))' },
    })

    // If publisher is different from manager, add separate publisher node
    // Publisher branches from the asset (data packet-centric view)
    if (!isManagerPublisher) {
      // Find if publisher is in grants
      const publisherGrant = routeData.grants.find((g) => g.grantee.id === publisherId)
      if (publisherGrant) {
        nodes.push({
          id: 'publisher',
          type: 'org',
          position: { x: 450, y: 200 }, // Same Y as asset, to the right
          data: {
            label: publisherGrant.grantee.name,
            type: publisherGrant.grantee.type,
            role: 'delegate',
            isPublisher: true,
            delegatorName: publisherGrant.grantor.name,
          },
        })
        // Publisher branches from the asset (data packet-centric)
        edges.push({
          id: 'asset-publisher',
          source: 'asset',
          sourceHandle: 'right',
          target: 'publisher',
          targetHandle: 'left',
          animated: true,
          style: { stroke: 'hsl(var(--primary))', strokeDasharray: '5,5' },
          markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--primary))' },
          label: 'Delegated Publisher',
          labelStyle: { fill: 'hsl(var(--muted-foreground))', fontSize: 10 },
          labelBgStyle: { fill: 'hsl(var(--background))' },
        })
      }
    }

    // Subscribers on the bottom left
    const subscriberStartX = 50
    const subscriberY = 380
    const subscriberSpacing = 180

    routeData.subscribers.forEach((subscriber, index) => {
      const nodeId = `subscriber-${subscriber.id}`
      nodes.push({
        id: nodeId,
        type: 'org',
        position: { x: subscriberStartX + index * subscriberSpacing, y: subscriberY },
        data: {
          label: subscriber.name,
          type: subscriber.type,
          role: 'subscriber',
        },
      })
      edges.push({
        id: `asset-${nodeId}`,
        source: 'asset',
        target: nodeId,
        animated: false,
        style: { stroke: 'hsl(var(--muted-foreground))' },
        markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--muted-foreground))' },
        label: 'Subscribes',
        labelStyle: { fill: 'hsl(var(--muted-foreground))', fontSize: 10 },
        labelBgStyle: { fill: 'hsl(var(--background))' },
      })
    })

    // Grant recipients on the right (excluding publisher if already shown)
    // Position them below the publisher if publisher exists, otherwise start from top
    const hasPublisher = !isManagerPublisher && routeData.grants.some((g) => g.grantee.id === publisherId)
    const grantStartY = hasPublisher ? 320 : 280 // Start below publisher if it exists
    const grantX = 500
    const grantSpacing = 100

    const grantsToShow = routeData.grants.filter((g) => g.grantee.id !== publisherId)
    grantsToShow.forEach((grant, index) => {
      const nodeId = `grantee-${grant.grantee.id}`
      const capabilities = []
      if (grant.canViewData) capabilities.push('View')
      if (grant.canPublish) capabilities.push('Publish')
      if (grant.canManageSubscriptions) capabilities.push('Subs')
      if (grant.canApproveDelegations) capabilities.push('Approve')

      nodes.push({
        id: nodeId,
        type: 'org',
        position: { x: grantX, y: grantStartY + index * grantSpacing },
        data: {
          label: grant.grantee.name,
          type: grant.grantee.type,
          role: 'grantee',
          delegatorName: grant.grantor.name,
        },
      })
      edges.push({
        id: `asset-${nodeId}`,
        source: 'asset',
        target: nodeId,
        sourceHandle: 'right',
        targetHandle: 'left',
        animated: false,
        style: { stroke: 'hsl(var(--muted-foreground))', strokeDasharray: '3,3' },
        markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--muted-foreground))' },
        label: capabilities.join(', '),
        labelStyle: { fill: 'hsl(var(--muted-foreground))', fontSize: 9 },
        labelBgStyle: { fill: 'hsl(var(--background))' },
      })
    })

    return { initialNodes: nodes, initialEdges: edges }
  }, [routeData, publisherId])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Update nodes and edges when data changes
  useEffect(() => {
    setNodes(initialNodes)
    setEdges(initialEdges)
  }, [initialNodes, initialEdges, setNodes, setEdges])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="text-muted-foreground animate-pulse">Loading route map...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="text-red-400">Error: {error}</div>
      </div>
    )
  }

  if (!routeData) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="text-muted-foreground">No route data available</div>
      </div>
    )
  }

  return (
    <div className="h-[500px] w-full bg-background rounded-lg border border-border">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
        className="route-map-flow"
      >
        <Background color="hsl(var(--muted-foreground))" gap={20} size={1} />
        <Controls className="!bg-secondary !border-border [&>button]:!bg-secondary [&>button]:!border-border [&>button]:!text-foreground [&>button:hover]:!bg-muted" />
      </ReactFlow>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm border border-border rounded-lg p-3 text-xs space-y-2">
        <div className="font-semibold text-foreground mb-2">Legend</div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-muted-foreground">Asset</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-muted-foreground">GP (Manager)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-muted-foreground">LP (Subscriber)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500" />
          <span className="text-muted-foreground">Fund Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/20 text-primary border-primary text-[10px] px-1 py-0">
            <Send className="w-2 h-2 mr-0.5" />
            Publisher
          </Badge>
          <span className="text-muted-foreground">Data Publisher</span>
        </div>
      </div>
    </div>
  )
}
