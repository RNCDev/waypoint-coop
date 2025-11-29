'use client'

import { useState } from 'react'
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
import { Shield, Building2, FileText, Users, CheckCircle } from 'lucide-react'

export interface Organization {
  id: string
  name: string
  type: string
}

export interface Asset {
  id: string
  name: string
  type: string
}

export interface GrantFormData {
  granteeId: string
  assetId: string | null // null for global grant
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
  assets: Asset[]
  currentOrgId: string
  onSubmit: (data: GrantFormData) => Promise<void>
  isLoading?: boolean
}

export function GrantBuilder({
  organizations,
  assets,
  currentOrgId,
  onSubmit,
  isLoading = false,
}: GrantBuilderProps) {
  const [formData, setFormData] = useState<GrantFormData>({
    granteeId: '',
    assetId: null,
    capabilities: {
      canPublish: false,
      canViewData: true,
      canManageSubscriptions: false,
      canApproveDelegations: false,
    },
    expiresAt: null,
  })

  // Filter out current org from grantee list
  const eligibleGrantees = organizations.filter((org) => org.id !== currentOrgId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  const handleCapabilityChange = (capability: keyof typeof formData.capabilities) => {
    setFormData((prev) => ({
      ...prev,
      capabilities: {
        ...prev.capabilities,
        [capability]: !prev.capabilities[capability],
      },
    }))
  }

  const selectedCapabilities = Object.entries(formData.capabilities)
    .filter(([, value]) => value)
    .map(([key]) => key)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Create Access Grant
        </CardTitle>
        <CardDescription>
          Delegate capabilities to another organization for specific assets
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
                    <div className="flex items-center gap-2">
                      <span>{org.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {org.type}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Asset Selection */}
          <div className="space-y-2">
            <Label htmlFor="asset" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Asset Scope
            </Label>
            <Select
              value={formData.assetId || 'all'}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  assetId: value === 'all' ? null : value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select asset..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <span>All Assets</span>
                    <Badge variant="outline" className="text-xs bg-purple-500/20 text-purple-400">
                      Global
                    </Badge>
                  </div>
                </SelectItem>
                {assets.map((asset) => (
                  <SelectItem key={asset.id} value={asset.id}>
                    <div className="flex items-center gap-2">
                      <span>{asset.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {asset.type}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Capabilities */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Capabilities
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                <Checkbox
                  id="canViewData"
                  checked={formData.capabilities.canViewData}
                  onCheckedChange={() => handleCapabilityChange('canViewData')}
                />
                <div className="space-y-0.5">
                  <Label htmlFor="canViewData" className="cursor-pointer font-medium">
                    View Data
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Read access to envelopes and data
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                <Checkbox
                  id="canPublish"
                  checked={formData.capabilities.canPublish}
                  onCheckedChange={() => handleCapabilityChange('canPublish')}
                />
                <div className="space-y-0.5">
                  <Label htmlFor="canPublish" className="cursor-pointer font-medium">
                    Publish
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Publish envelopes on your behalf
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                <Checkbox
                  id="canManageSubscriptions"
                  checked={formData.capabilities.canManageSubscriptions}
                  onCheckedChange={() => handleCapabilityChange('canManageSubscriptions')}
                />
                <div className="space-y-0.5">
                  <Label htmlFor="canManageSubscriptions" className="cursor-pointer font-medium">
                    Manage Subscriptions
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Add or remove LP subscriptions
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                <Checkbox
                  id="canApproveDelegations"
                  checked={formData.capabilities.canApproveDelegations}
                  onCheckedChange={() => handleCapabilityChange('canApproveDelegations')}
                />
                <div className="space-y-0.5">
                  <Label htmlFor="canApproveDelegations" className="cursor-pointer font-medium">
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
          {formData.granteeId && selectedCapabilities.length > 0 && (
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
                  <span className="font-medium">Scope:</span>{' '}
                  {formData.assetId
                    ? assets.find((a) => a.id === formData.assetId)?.name
                    : 'All Assets'}
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
            disabled={!formData.granteeId || selectedCapabilities.length === 0 || isLoading}
          >
            {isLoading ? 'Creating Grant...' : 'Create Access Grant'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

