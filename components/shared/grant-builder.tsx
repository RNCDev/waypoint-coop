'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Shield, Building2, FileText, Users, CheckCircle, ChevronDown, ChevronRight } from 'lucide-react'

export interface Organization {
  id: string
  name: string
  type?: string | null
}

export interface DelegatableAsset {
  id: string
  name: string
  type: string
  role: 'manager' | 'subscriber' | 'delegate'
  capabilities: {
    canPublish: boolean
    canViewData: boolean
    canManageSubscriptions: boolean
    canApproveDelegations: boolean
  }
  parentId?: string | null
}

export interface GrantFormData {
  granteeId: string
  assetIds: string[] // Now supports multiple assets
  capabilities: {
    canPublish: boolean
    canViewData: boolean
    canManageSubscriptions: boolean
    canApproveDelegations: boolean
  }
  expiresAt: string | null
}

interface GrantBuilderProps {
  organizations: Organization[]
  delegatableAssets: DelegatableAsset[]
  currentOrgId: string
  onSubmit: (data: GrantFormData) => Promise<void>
  isLoading?: boolean
}

const ROLE_COLORS: Record<string, string> = {
  manager: 'bg-green-500/20 text-green-400 border-green-500/30',
  subscriber: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  delegate: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

const ROLE_LABELS: Record<string, string> = {
  manager: 'Manager',
  subscriber: 'Subscriber',
  delegate: 'Delegate',
}

const TYPE_ORDER: Record<string, number> = {
  FIRM: 0,
  FUND: 1,
  FEEDER: 2,
  SPV: 3,
  PORTFOLIO_COMPANY: 4,
}

export function GrantBuilder({
  organizations,
  delegatableAssets,
  currentOrgId,
  onSubmit,
  isLoading = false,
}: GrantBuilderProps) {
  const [formData, setFormData] = useState<GrantFormData>({
    granteeId: '',
    assetIds: [],
    capabilities: {
      canPublish: false,
      canViewData: true,
      canManageSubscriptions: false,
      canApproveDelegations: false,
    },
    expiresAt: null,
  })

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  // Filter out current org from grantee list
  const eligibleGrantees = organizations.filter((org) => org.id !== currentOrgId)

  // Group assets by type for hierarchical display
  const groupedAssets = useMemo(() => {
    const groups: Record<string, DelegatableAsset[]> = {}
    
    // Sort by type order
    const sortedAssets = [...delegatableAssets].sort((a, b) => {
      const orderA = TYPE_ORDER[a.type] ?? 99
      const orderB = TYPE_ORDER[b.type] ?? 99
      if (orderA !== orderB) return orderA - orderB
      return a.name.localeCompare(b.name)
    })

    for (const asset of sortedAssets) {
      if (!groups[asset.type]) {
        groups[asset.type] = []
      }
      groups[asset.type].push(asset)
    }

    return groups
  }, [delegatableAssets])

  // Calculate intersection of capabilities across selected assets
  const allowedCapabilities = useMemo(() => {
    if (formData.assetIds.length === 0) {
      return {
        canPublish: false,
        canViewData: false,
        canManageSubscriptions: false,
        canApproveDelegations: false,
      }
    }

    const selectedAssets = delegatableAssets.filter((a) => formData.assetIds.includes(a.id))
    
    return {
      canPublish: selectedAssets.every((a) => a.capabilities.canPublish),
      canViewData: selectedAssets.every((a) => a.capabilities.canViewData),
      canManageSubscriptions: selectedAssets.every((a) => a.capabilities.canManageSubscriptions),
      canApproveDelegations: selectedAssets.every((a) => a.capabilities.canApproveDelegations),
    }
  }, [formData.assetIds, delegatableAssets])

  // Reset capabilities when they become unavailable
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      capabilities: {
        canPublish: prev.capabilities.canPublish && allowedCapabilities.canPublish,
        canViewData: prev.capabilities.canViewData && allowedCapabilities.canViewData,
        canManageSubscriptions: prev.capabilities.canManageSubscriptions && allowedCapabilities.canManageSubscriptions,
        canApproveDelegations: prev.capabilities.canApproveDelegations && allowedCapabilities.canApproveDelegations,
      },
    }))
  }, [allowedCapabilities])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
    // Reset form after successful submission
    setFormData({
      granteeId: '',
      assetIds: [],
      capabilities: {
        canPublish: false,
        canViewData: true,
        canManageSubscriptions: false,
        canApproveDelegations: false,
      },
      expiresAt: null,
    })
  }

  const handleCapabilityChange = (capability: keyof typeof formData.capabilities) => {
    if (!allowedCapabilities[capability]) return // Can't toggle if not allowed
    
    setFormData((prev) => ({
      ...prev,
      capabilities: {
        ...prev.capabilities,
        [capability]: !prev.capabilities[capability],
      },
    }))
  }

  const handleAssetToggle = (assetId: string) => {
    setFormData((prev) => ({
      ...prev,
      assetIds: prev.assetIds.includes(assetId)
        ? prev.assetIds.filter((id) => id !== assetId)
        : [...prev.assetIds, assetId],
    }))
  }

  const handleSelectAll = () => {
    if (formData.assetIds.length === delegatableAssets.length) {
      // Deselect all
      setFormData((prev) => ({ ...prev, assetIds: [] }))
    } else {
      // Select all
      setFormData((prev) => ({
        ...prev,
        assetIds: delegatableAssets.map((a) => a.id),
      }))
    }
  }

  const handleGroupToggle = (type: string) => {
    const groupAssets = groupedAssets[type] || []
    const groupAssetIds = groupAssets.map((a) => a.id)
    const allSelected = groupAssetIds.every((id) => formData.assetIds.includes(id))

    if (allSelected) {
      // Deselect all in group
      setFormData((prev) => ({
        ...prev,
        assetIds: prev.assetIds.filter((id) => !groupAssetIds.includes(id)),
      }))
    } else {
      // Select all in group
      setFormData((prev) => ({
        ...prev,
        assetIds: [...new Set([...prev.assetIds, ...groupAssetIds])],
      }))
    }
  }

  const toggleGroupExpand = (type: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(type)) {
        next.delete(type)
      } else {
        next.add(type)
      }
      return next
    })
  }

  const selectedCapabilities = Object.entries(formData.capabilities)
    .filter(([, value]) => value)
    .map(([key]) => key)

  const allSelected = formData.assetIds.length === delegatableAssets.length && delegatableAssets.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Create Access Grant
        </CardTitle>
        <CardDescription>
          Delegate capabilities to another organization
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Grantee Selection */}
          <div className="space-y-2">
            <Label htmlFor="grantee" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Delegate To (Grantee)
            </Label>
            <Select
              value={formData.granteeId}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, granteeId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select organization..." />
              </SelectTrigger>
              <SelectContent>
                {eligibleGrantees.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    <span>{org.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Asset Selection - Multi-select with Select All */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Asset Scope
            </Label>

            {delegatableAssets.length === 0 ? (
              <div className="text-sm text-muted-foreground p-4 border border-dashed border-border rounded-lg text-center">
                No assets available for delegation
              </div>
            ) : (
              <div className="border border-border rounded-lg overflow-hidden">
                {/* Select All Header */}
                <div className="flex items-center gap-3 p-3 bg-secondary/30 border-b border-border">
                  <Checkbox
                    id="select-all"
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label htmlFor="select-all" className="cursor-pointer font-medium text-sm flex-1">
                    Select All ({delegatableAssets.length} assets)
                  </Label>
                  {formData.assetIds.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {formData.assetIds.length} selected
                    </Badge>
                  )}
                </div>

                {/* Grouped Assets */}
                <div className="max-h-[280px] overflow-y-auto">
                  {Object.entries(groupedAssets).map(([type, assets]) => {
                    const isExpanded = expandedGroups.has(type)
                    const groupAssetIds = assets.map((a) => a.id)
                    const selectedInGroup = formData.assetIds.filter((id) => groupAssetIds.includes(id)).length
                    const allInGroupSelected = selectedInGroup === assets.length

                    return (
                      <div key={type} className="border-b border-border last:border-b-0">
                        {/* Group Header */}
                        <div className="flex items-center gap-2 p-2 bg-secondary/10 hover:bg-secondary/20 transition-colors">
                          <button
                            type="button"
                            onClick={() => toggleGroupExpand(type)}
                            className="p-1 hover:bg-secondary rounded"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                          <Checkbox
                            checked={allInGroupSelected}
                            onCheckedChange={() => handleGroupToggle(type)}
                          />
                          <span className="text-sm font-medium flex-1">
                            {type.replace('_', ' ')}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {selectedInGroup}/{assets.length}
                          </Badge>
                        </div>

                        {/* Group Items */}
                        {isExpanded && (
                          <div className="divide-y divide-border/50">
                            {assets.map((asset) => (
                              <div
                                key={asset.id}
                                className="flex items-center gap-3 p-2 pl-10 hover:bg-secondary/30 transition-colors"
                              >
                                <Checkbox
                                  checked={formData.assetIds.includes(asset.id)}
                                  onCheckedChange={() => handleAssetToggle(asset.id)}
                                />
                                <span className="text-sm flex-1">{asset.name}</span>
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${ROLE_COLORS[asset.role]}`}
                                >
                                  {ROLE_LABELS[asset.role]}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Capabilities - Dynamic based on selected assets */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Capabilities
              {formData.assetIds.length > 0 && (
                <span className="text-xs text-muted-foreground font-normal">
                  (based on your role for selected assets)
                </span>
              )}
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                  allowedCapabilities.canViewData
                    ? 'border-border hover:bg-secondary/50'
                    : 'border-border/50 opacity-50 cursor-not-allowed'
                }`}
              >
                <Checkbox
                  id="canViewData"
                  checked={formData.capabilities.canViewData}
                  onCheckedChange={() => handleCapabilityChange('canViewData')}
                  disabled={!allowedCapabilities.canViewData}
                />
                <div className="space-y-0.5">
                  <Label
                    htmlFor="canViewData"
                    className={`font-medium ${allowedCapabilities.canViewData ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                  >
                    View Data
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Read access to data packets
                  </p>
                </div>
              </div>

              <div
                className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                  allowedCapabilities.canPublish
                    ? 'border-border hover:bg-secondary/50'
                    : 'border-border/50 opacity-50 cursor-not-allowed'
                }`}
              >
                <Checkbox
                  id="canPublish"
                  checked={formData.capabilities.canPublish}
                  onCheckedChange={() => handleCapabilityChange('canPublish')}
                  disabled={!allowedCapabilities.canPublish}
                />
                <div className="space-y-0.5">
                  <Label
                    htmlFor="canPublish"
                    className={`font-medium ${allowedCapabilities.canPublish ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                  >
                    Publish
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Publish data packets on your behalf
                  </p>
                </div>
              </div>

              <div
                className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                  allowedCapabilities.canManageSubscriptions
                    ? 'border-border hover:bg-secondary/50'
                    : 'border-border/50 opacity-50 cursor-not-allowed'
                }`}
              >
                <Checkbox
                  id="canManageSubscriptions"
                  checked={formData.capabilities.canManageSubscriptions}
                  onCheckedChange={() => handleCapabilityChange('canManageSubscriptions')}
                  disabled={!allowedCapabilities.canManageSubscriptions}
                />
                <div className="space-y-0.5">
                  <Label
                    htmlFor="canManageSubscriptions"
                    className={`font-medium ${allowedCapabilities.canManageSubscriptions ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                  >
                    Manage Subscriptions
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Add or remove LP subscriptions
                  </p>
                </div>
              </div>

              <div
                className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                  allowedCapabilities.canApproveDelegations
                    ? 'border-border hover:bg-secondary/50'
                    : 'border-border/50 opacity-50 cursor-not-allowed'
                }`}
              >
                <Checkbox
                  id="canApproveDelegations"
                  checked={formData.capabilities.canApproveDelegations}
                  onCheckedChange={() => handleCapabilityChange('canApproveDelegations')}
                  disabled={!allowedCapabilities.canApproveDelegations}
                />
                <div className="space-y-0.5">
                  <Label
                    htmlFor="canApproveDelegations"
                    className={`font-medium ${allowedCapabilities.canApproveDelegations ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                  >
                    Approve Delegations
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Approve access grants from LPs
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Expiration Date */}
          <div className="space-y-2">
            <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
            <Input
              id="expiresAt"
              type="date"
              value={formData.expiresAt || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  expiresAt: e.target.value || null,
                }))
              }
              min={new Date().toISOString().split('T')[0]}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty for no expiration
            </p>
          </div>

          {/* Summary */}
          {formData.granteeId && formData.assetIds.length > 0 && selectedCapabilities.length > 0 && (
            <div className="p-4 rounded-lg bg-secondary/50 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="font-medium">Grant Summary</span>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  <span className="font-medium">Grantee:</span>{' '}
                  {eligibleGrantees.find((o) => o.id === formData.granteeId)?.name}
                </p>
                <p>
                  <span className="font-medium">Assets:</span>{' '}
                  {formData.assetIds.length === delegatableAssets.length
                    ? 'All Assets'
                    : `${formData.assetIds.length} asset${formData.assetIds.length > 1 ? 's' : ''}`}
                </p>
                <p>
                  <span className="font-medium">Capabilities:</span>{' '}
                  {selectedCapabilities
                    .map((c) =>
                      c
                        .replace('can', '')
                        .replace(/([A-Z])/g, ' $1')
                        .trim()
                    )
                    .join(', ')}
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={
              !formData.granteeId ||
              formData.assetIds.length === 0 ||
              selectedCapabilities.length === 0 ||
              isLoading
            }
          >
            {isLoading ? 'Creating Grant...' : 'Create Access Grant'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
