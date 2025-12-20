import { prisma } from './prisma'

/**
 * Permission actions that can be checked
 */
export type PermissionAction =
  | 'publish'
  | 'view'
  | 'manage_subscriptions'
  | 'approve_delegations'

/**
 * Capabilities that can be delegated
 */
export interface Capabilities {
  canPublish: boolean
  canViewData: boolean
  canManageSubscriptions: boolean
  canApproveDelegations: boolean
}

/**
 * Result of a permission check with explanation
 */
export interface PermissionCheckResult {
  allowed: boolean
  reason: string
  via?: 'manager' | 'subscription' | 'grant'
  grantId?: string
}

/**
 * Result of a delegation capability check
 */
export interface DelegationCheckResult {
  allowed: boolean
  reason: string
  allowedCapabilities: Capabilities
}

/**
 * Check if an organization can perform an action on an asset
 * Implements the ReBAC (Relationship-Based Access Control) model
 *
 * Permission hierarchy:
 * 1. Asset Manager (GP) - has root authority
 * 2. Subscriber (LP) - has implicit view rights
 * 3. Access Grant holder - has delegated capabilities
 */
export async function canPerformAction(
  orgId: string,
  action: PermissionAction,
  assetId: string
): Promise<PermissionCheckResult> {
  // 1. Check if org is the asset manager (root authority)
  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    select: { managerId: true, name: true },
  })

  if (!asset) {
    return { allowed: false, reason: 'Asset not found' }
  }

  if (asset.managerId === orgId) {
    return {
      allowed: true,
      reason: `Organization is the asset manager of ${asset.name}`,
      via: 'manager',
    }
  }

  // 2. Check if org has an active subscription (implicit view rights)
  // Chain of Trust: Subscription must be temporally valid (validTo is null or future)
  if (action === 'view') {
    const subscription = await prisma.subscription.findFirst({
      where: {
        assetId,
        subscriberId: orgId,
        status: 'ACTIVE',
        OR: [
          { validTo: null },
          { validTo: { gt: new Date() } },
        ],
      },
    })

    if (subscription) {
      return {
        allowed: true,
        reason: 'Organization has an active subscription',
        via: 'subscription',
      }
    }
  }

  // 3. Check for active Access Grant with required capability
  // Includes Legacy (single-asset), Multi-Asset, and Global grants
  const grant = await prisma.accessGrant.findFirst({
    where: {
      granteeId: orgId,
      status: 'ACTIVE',
      OR: [
        { assetId }, // Legacy single-asset grant
        { grantAssets: { some: { assetId } } }, // Multi-asset grant
        {
          AND: [
            { assetId: null },
            { grantAssets: { none: {} } }, // Global grant (must have no specific assets)
          ],
        },
      ],
      AND: [
        {
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } },
          ],
        },
      ],
    },
    include: {
      grantor: true,
    },
  })

  if (grant) {
    const hasCapability = checkGrantCapability(grant, action)
    if (hasCapability) {
      // Chain of Trust: Verify grantor still has authority
      const grantorValid = await validateGrantorChain(grant.grantorId, assetId)
      if (!grantorValid) {
        return {
          allowed: false,
          reason: 'Grant chain broken: grantor no longer has authority (subscription ended or transferred)',
        }
      }
      
      return {
        allowed: true,
        reason: grant.assetId === null 
          ? 'Access granted via delegation (Global or Multi-Asset)' 
          : 'Access granted via delegation (Single Asset)',
        via: 'grant',
        grantId: grant.id,
      }
    }
  }

  return {
    allowed: false,
    reason: 'No permission found for this action',
  }
}

/**
 * Validate that a grantor still has authority for an asset
 * Chain of Trust: Manager always valid, LP must have current subscription
 */
async function validateGrantorChain(
  grantorId: string,
  assetId: string
): Promise<boolean> {
  // Check if grantor is the asset manager (always valid)
  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    select: { managerId: true },
  })

  if (!asset) return false
  if (asset.managerId === grantorId) return true

  // Check if grantor is an LP with a valid (temporal) subscription
  const subscription = await prisma.subscription.findFirst({
    where: {
      assetId,
      subscriberId: grantorId,
      status: 'ACTIVE',
      OR: [
        { validTo: null },
        { validTo: { gt: new Date() } },
      ],
    },
  })

  return !!subscription
}

/**
 * Check if a grant has the required capability for an action
 */
function checkGrantCapability(
  grant: {
    canPublish: boolean
    canViewData: boolean
    canManageSubscriptions: boolean
    canApproveDelegations: boolean
  },
  action: PermissionAction
): boolean {
  switch (action) {
    case 'publish':
      return grant.canPublish
    case 'view':
      return grant.canViewData
    case 'manage_subscriptions':
      return grant.canManageSubscriptions
    case 'approve_delegations':
      return grant.canApproveDelegations
    default:
      return false
  }
}

/**
 * Get all assets an organization has access to
 */
export async function getAccessibleAssets(orgId: string): Promise<string[]> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { type: true },
  })

  if (!org) return []

  // Platform admins can see everything
  if (org.type === 'PLATFORM_ADMIN') {
    const allAssets = await prisma.asset.findMany({ select: { id: true } })
    return allAssets.map((a) => a.id)
  }

  const accessibleAssetIds = new Set<string>()

  // Assets where org is manager
  const managedAssets = await prisma.asset.findMany({
    where: { managerId: orgId },
    select: { id: true },
  })
  managedAssets.forEach((a) => accessibleAssetIds.add(a.id))

  // Assets where org has subscription
  const subscriptions = await prisma.subscription.findMany({
    where: {
      subscriberId: orgId,
      status: 'ACTIVE',
      OR: [
        { validTo: null },
        { validTo: { gt: new Date() } },
      ],
    },
    select: { assetId: true },
  })
  subscriptions.forEach((s) => accessibleAssetIds.add(s.assetId))

  // Assets where org has active grant (either view or publish)
  const grants = await prisma.accessGrant.findMany({
    where: {
      granteeId: orgId,
      status: 'ACTIVE',
      OR: [
        { canViewData: true },
        { canPublish: true },
        { canManageSubscriptions: true },
      ],
      AND: [
        {
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } },
          ],
        },
      ],
    },
    select: { assetId: true },
  })
  grants.forEach((g) => {
    if (g.assetId) accessibleAssetIds.add(g.assetId)
  })
  
  // Also check for global grants (assetId = null AND no specific assets)
  const globalGrants = await prisma.accessGrant.findMany({
    where: {
      granteeId: orgId,
      status: 'ACTIVE',
      assetId: null,
      grantAssets: { none: {} }, // True global grant
      OR: [
        { canViewData: true },
        { canPublish: true },
        { canManageSubscriptions: true },
      ],
      AND: [
        {
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } },
          ],
        },
      ],
    },
    select: { grantorId: true },
  })
  
  // For global grants, get all assets managed by the grantor
  for (const grant of globalGrants) {
    const grantorAssets = await prisma.asset.findMany({
      where: { managerId: grant.grantorId },
      select: { id: true },
    })
    grantorAssets.forEach((a) => accessibleAssetIds.add(a.id))
  }

  return Array.from(accessibleAssetIds)
}

/**
 * Check if an LP delegation requires GP approval
 */
export async function requiresGPApproval(
  grantorId: string,
  assetId: string
): Promise<boolean> {
  // Check if the grantor is an LP (not the asset manager)
  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    select: { managerId: true, requireGPApprovalForDelegations: true },
  })

  if (!asset) return false

  // If grantor is the manager, no approval needed
  if (asset.managerId === grantorId) return false

  // Check the asset's flag
  return asset.requireGPApprovalForDelegations
}

/**
 * Get the contextual role of an organization for a specific asset
 */
export async function getContextualRole(
  orgId: string,
  assetId: string
): Promise<'manager' | 'subscriber' | 'delegate' | 'none'> {
  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    select: { managerId: true },
  })

  if (!asset) return 'none'

  if (asset.managerId === orgId) return 'manager'

  const subscription = await prisma.subscription.findFirst({
    where: {
      assetId,
      subscriberId: orgId,
      status: 'ACTIVE',
      OR: [
        { validTo: null },
        { validTo: { gt: new Date() } },
      ],
    },
  })

  if (subscription) return 'subscriber'

  // Check legacy single-asset, multi-asset, and global grants
  const grant = await prisma.accessGrant.findFirst({
    where: {
      granteeId: orgId,
      status: 'ACTIVE',
      OR: [
        { assetId }, // Legacy single-asset grant
        { grantAssets: { some: { assetId } } }, // Multi-asset grant
        { 
          AND: [
            { assetId: null }, // Global grant
            { grantAssets: { none: {} } }
          ]
        },
      ],
    },
  })

  if (grant) return 'delegate'

  return 'none'
}

/**
 * Get the capabilities an organization can delegate for a specific asset
 * Based on their contextual role and any grants they hold
 */
export async function getGrantorCapabilities(
  grantorId: string,
  assetId: string
): Promise<Capabilities> {
  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    select: { managerId: true },
  })

  if (!asset) {
    return {
      canPublish: false,
      canViewData: false,
      canManageSubscriptions: false,
      canApproveDelegations: false,
    }
  }

  // Managers have full capabilities
  if (asset.managerId === grantorId) {
    return {
      canPublish: true,
      canViewData: true,
      canManageSubscriptions: true,
      canApproveDelegations: true,
    }
  }

  // Subscribers can only delegate view rights (to their slice)
  const subscription = await prisma.subscription.findFirst({
    where: {
      assetId,
      subscriberId: grantorId,
      status: 'ACTIVE',
      OR: [
        { validTo: null },
        { validTo: { gt: new Date() } },
      ],
    },
  })

  if (subscription) {
    return {
      canPublish: false,
      canViewData: true, // Can delegate view access to consultants
      canManageSubscriptions: false,
      canApproveDelegations: false,
    }
  }

  // Delegates can only re-delegate what they have (if allowed)
  const grant = await prisma.accessGrant.findFirst({
    where: {
      granteeId: grantorId,
      status: 'ACTIVE',
      OR: [
        { assetId },
        { grantAssets: { some: { assetId } } },
        { 
          AND: [
            { assetId: null },
            { grantAssets: { none: {} } }
          ]
        },
      ],
      AND: [
        {
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } },
          ],
        },
      ],
    },
  })

  if (grant) {
    // Delegates can only re-delegate view rights they have
    return {
      canPublish: false, // Delegates cannot re-delegate publish
      canViewData: grant.canViewData,
      canManageSubscriptions: false, // Cannot re-delegate subscription management
      canApproveDelegations: false, // Cannot re-delegate approval rights
    }
  }

  return {
    canPublish: false,
    canViewData: false,
    canManageSubscriptions: false,
    canApproveDelegations: false,
  }
}

/**
 * Check if a grantor can delegate the requested capabilities for a specific asset
 * Implements capability inheritance validation
 */
export async function canDelegateCapabilities(
  grantorId: string,
  assetId: string,
  requestedCapabilities: Partial<Capabilities>
): Promise<DelegationCheckResult> {
  const grantorCaps = await getGrantorCapabilities(grantorId, assetId)

  const errors: string[] = []

  if (requestedCapabilities.canPublish && !grantorCaps.canPublish) {
    errors.push('Cannot delegate publish rights')
  }
  if (requestedCapabilities.canViewData && !grantorCaps.canViewData) {
    errors.push('Cannot delegate view rights')
  }
  if (requestedCapabilities.canManageSubscriptions && !grantorCaps.canManageSubscriptions) {
    errors.push('Cannot delegate subscription management')
  }
  if (requestedCapabilities.canApproveDelegations && !grantorCaps.canApproveDelegations) {
    errors.push('Cannot delegate approval rights')
  }

  if (errors.length > 0) {
    return {
      allowed: false,
      reason: errors.join('; '),
      allowedCapabilities: grantorCaps,
    }
  }

  return {
    allowed: true,
    reason: 'Grantor has authority to delegate these capabilities',
    allowedCapabilities: grantorCaps,
  }
}

/**
 * Get all assets an organization can delegate permissions for
 * Returns assets where org is manager, subscriber, or has delegation rights
 */
export async function getDelegatableAssets(orgId: string): Promise<{
  id: string
  name: string
  type: string
  role: 'manager' | 'subscriber' | 'delegate'
  capabilities: Capabilities
}[]> {
  const result: {
    id: string
    name: string
    type: string
    role: 'manager' | 'subscriber' | 'delegate'
    capabilities: Capabilities
  }[] = []

  // 1. Assets where org is manager (full capabilities)
  const managedAssets = await prisma.asset.findMany({
    where: { managerId: orgId },
    select: { id: true, name: true, type: true },
  })

  for (const asset of managedAssets) {
    result.push({
      id: asset.id,
      name: asset.name,
      type: asset.type,
      role: 'manager',
      capabilities: {
        canPublish: true,
        canViewData: true,
        canManageSubscriptions: true,
        canApproveDelegations: true,
      },
    })
  }

  // 2. Assets where org has active subscription (can delegate view)
  const subscriptions = await prisma.subscription.findMany({
    where: {
      subscriberId: orgId,
      status: 'ACTIVE',
      OR: [
        { validTo: null },
        { validTo: { gt: new Date() } },
      ],
    },
    include: {
      asset: {
        select: { id: true, name: true, type: true },
      },
    },
  })

  for (const sub of subscriptions) {
    // Don't add duplicates (org might manage and subscribe to same asset)
    if (!result.find((a) => a.id === sub.asset.id)) {
      result.push({
        id: sub.asset.id,
        name: sub.asset.name,
        type: sub.asset.type,
        role: 'subscriber',
        capabilities: {
          canPublish: false,
          canViewData: true,
          canManageSubscriptions: false,
          canApproveDelegations: false,
        },
      })
    }
  }

  // 3. Assets where org has active grants with view rights (can potentially re-delegate view)
  const grants = await prisma.accessGrant.findMany({
    where: {
      granteeId: orgId,
      status: 'ACTIVE',
      canViewData: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
    include: {
      asset: {
        select: { id: true, name: true, type: true },
      },
      grantAssets: {
        include: {
          asset: {
            select: { id: true, name: true, type: true },
          },
        },
      },
    },
  })

  for (const grant of grants) {
    // Handle legacy single-asset grants
    if (grant.asset && !result.find((a) => a.id === grant.asset!.id)) {
      result.push({
        id: grant.asset.id,
        name: grant.asset.name,
        type: grant.asset.type,
        role: 'delegate',
        capabilities: {
          canPublish: false,
          canViewData: grant.canViewData,
          canManageSubscriptions: false,
          canApproveDelegations: false,
        },
      })
    }

    // Handle multi-asset grants
    for (const grantAsset of grant.grantAssets) {
      if (!result.find((a) => a.id === grantAsset.asset.id)) {
        result.push({
          id: grantAsset.asset.id,
          name: grantAsset.asset.name,
          type: grantAsset.asset.type,
          role: 'delegate',
          capabilities: {
            canPublish: false,
            canViewData: grant.canViewData,
            canManageSubscriptions: false,
            canApproveDelegations: false,
          },
        })
      }
    }
  }

  // 4. Handle global grants (assetId = null) - get all assets from grantor
  const globalGrants = await prisma.accessGrant.findMany({
    where: {
      granteeId: orgId,
      status: 'ACTIVE',
      assetId: null,
      grantAssets: { none: {} }, // True global grant, not multi-asset
      canViewData: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
    select: { grantorId: true, canViewData: true },
  })

  for (const grant of globalGrants) {
    const grantorAssets = await prisma.asset.findMany({
      where: { managerId: grant.grantorId },
      select: { id: true, name: true, type: true },
    })

    for (const asset of grantorAssets) {
      if (!result.find((a) => a.id === asset.id)) {
        result.push({
          id: asset.id,
          name: asset.name,
          type: asset.type,
          role: 'delegate',
          capabilities: {
            canPublish: false,
            canViewData: grant.canViewData,
            canManageSubscriptions: false,
            canApproveDelegations: false,
          },
        })
      }
    }
  }

  return result
}

/**
 * Validate capability delegation for multiple assets
 * Returns the intersection of allowed capabilities across all assets
 */
export async function validateBulkDelegation(
  grantorId: string,
  assetIds: string[],
  requestedCapabilities: Partial<Capabilities>
): Promise<{
  allowed: boolean
  reason: string
  assetResults: { assetId: string; allowed: boolean; reason: string }[]
}> {
  const assetResults: { assetId: string; allowed: boolean; reason: string }[] = []
  let allAllowed = true

  for (const assetId of assetIds) {
    const result = await canDelegateCapabilities(grantorId, assetId, requestedCapabilities)
    assetResults.push({
      assetId,
      allowed: result.allowed,
      reason: result.reason,
    })
    if (!result.allowed) {
      allAllowed = false
    }
  }

  return {
    allowed: allAllowed,
    reason: allAllowed
      ? 'All assets validated for delegation'
      : 'Some assets cannot be delegated with requested capabilities',
    assetResults,
  }
}
