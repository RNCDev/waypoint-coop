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
 * Result of a permission check with explanation
 */
export interface PermissionCheckResult {
  allowed: boolean
  reason: string
  via?: 'manager' | 'subscription' | 'grant'
  grantId?: string
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
  if (action === 'view') {
    const subscription = await prisma.subscription.findFirst({
      where: {
        assetId,
        subscriberId: orgId,
        status: 'ACTIVE',
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
  const grant = await prisma.accessGrant.findFirst({
    where: {
      granteeId: orgId,
      assetId,
      status: 'ACTIVE',
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
  })

  if (grant) {
    const hasCapability = checkGrantCapability(grant, action)
    if (hasCapability) {
      return {
        allowed: true,
        reason: `Access granted via delegation`,
        via: 'grant',
        grantId: grant.id,
      }
    }
  }

  // 4. Check for global grants (assetId = null means all assets)
  const globalGrant = await prisma.accessGrant.findFirst({
    where: {
      granteeId: orgId,
      assetId: null,
      status: 'ACTIVE',
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
  })

  if (globalGrant) {
    const hasCapability = checkGrantCapability(globalGrant, action)
    if (hasCapability) {
      return {
        allowed: true,
        reason: 'Access granted via global delegation',
        via: 'grant',
        grantId: globalGrant.id,
      }
    }
  }

  return {
    allowed: false,
    reason: 'No permission found for this action',
  }
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
    },
    select: { assetId: true },
  })
  subscriptions.forEach((s) => accessibleAssetIds.add(s.assetId))

  // Assets where org has active grant
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
    select: { assetId: true },
  })
  grants.forEach((g) => {
    if (g.assetId) accessibleAssetIds.add(g.assetId)
  })

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
    },
  })

  if (subscription) return 'subscriber'

  const grant = await prisma.accessGrant.findFirst({
    where: {
      granteeId: orgId,
      assetId,
      status: 'ACTIVE',
    },
  })

  if (grant) return 'delegate'

  return 'none'
}
