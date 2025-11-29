import { User, Organization, Asset, Delegation, Subscription, PublishingRight, AccessGrant, Resource, Action, Permission, PermissionScope, DataType, OrganizationContext, AssetRole } from '@/types'
import { mockOrganizations, mockAssets, mockDelegations, mockSubscriptions, mockPublishingRights, mockAccessGrants } from '@/lib/mock-data'

// Default permissions by organization role
export const DEFAULT_PERMISSIONS: Record<string, Partial<Record<Resource, Action[]>>> = {
  'Platform Admin': {
    registry: ['view', 'create', 'update', 'delete'],
    audit: ['view'],
    users: ['view', 'create', 'update', 'delete'],
    'access-grants': ['view', 'create', 'update', 'delete', 'approve'],
    // Backward compatibility aliases
    'delegations': ['view', 'create', 'update', 'delete', 'approve'],
    'publishing-rights': ['view', 'create', 'update', 'delete'],
  },
  'Asset Manager': {
    assets: ['view', 'create', 'update'],
    subscriptions: ['view', 'create', 'update', 'delete'],
    'access-grants': ['view', 'create', 'update', 'delete', 'approve'],
    envelopes: ['view'],
    users: ['view', 'create', 'update', 'delete'],
    // Backward compatibility aliases
    'delegations': ['view', 'approve'],
    'publishing-rights': ['view', 'create', 'update', 'delete'],
  },
  'Delegate': {
    envelopes: ['view', 'create', 'publish'],
    assets: ['view'],
    'access-grants': ['view'],
    users: ['view', 'create', 'update', 'delete'],
    // Backward compatibility aliases
    'delegations': ['view'],
    'publishing-rights': ['view'],
    // subscriptions permission is conditional on AccessGrant.canManageSubscriptions
  },
  'Limited Partner': {
    feeds: ['view', 'update'], // View invitations and accept/decline
    subscriptions: ['view'], // View their own subscriptions
    envelopes: ['view'],
    'access-grants': ['view', 'create', 'update', 'delete'],
    users: ['view', 'create', 'update', 'delete'],
    // Backward compatibility aliases
    'delegations': ['view', 'create', 'update', 'delete'],
  },
}

// Get organization by ID
export function getOrganization(orgId: number): Organization | undefined {
  return mockOrganizations.find(o => o.id === orgId)
}

// Get user's organization
export function getUserOrganization(user: User): Organization | undefined {
  return getOrganization(user.orgId)
}

// ============================================================================
// CONTEXTUAL ROLE DERIVATION FUNCTIONS
// 
// Organizations can play different roles depending on their relationship to assets:
// - Asset Manager: They own/manage the asset
// - Limited Partner: They have a subscription to the asset
// - Delegate: They have an access grant for the asset
// ============================================================================

/**
 * Check if an organization is a Platform Admin (Waypoint Platform).
 * Platform Admin is special - it has full access to everything.
 */
export function isPlatformAdmin(org: Organization): boolean {
  return org.isPlatformAdmin === true || org.type === 'Platform Operator' || org.role === 'Platform Admin'
}

/**
 * Get all roles an organization plays across all assets.
 * Returns the complete context of what roles this org has.
 * 
 * Example: Franklin Park manages FP Venture XV (assetManagerFor)
 * AND invests in Costanoa Fund VI (limitedPartnerIn)
 */
export function getOrganizationRoles(org: Organization): OrganizationContext {
  return {
    assetManagerFor: mockAssets.filter(a => a.ownerId === org.id),
    limitedPartnerIn: mockAssets.filter(a => 
      mockSubscriptions.some(s => 
        s.assetId === a.id && 
        s.subscriberId === org.id && 
        s.status === 'Active'
      )
    ),
    delegateFor: mockAccessGrants.filter(g => 
      g.granteeId === org.id && g.status === 'Active'
    )
  }
}

/**
 * Get the role an organization plays for a specific asset.
 * Returns null if the org has no relationship to the asset.
 * 
 * Priority: Asset Manager > Limited Partner > Delegate
 * (An org could theoretically have multiple relationships)
 */
export function getOrganizationRoleForAsset(org: Organization, assetId: number): AssetRole {
  const asset = mockAssets.find(a => a.id === assetId)
  if (!asset) return null
  
  // Check if they manage this asset
  if (asset.ownerId === org.id) return 'Asset Manager'
  
  // Check if they have a subscription to this asset
  const hasSubscription = mockSubscriptions.some(
    s => s.assetId === assetId && s.subscriberId === org.id && s.status === 'Active'
  )
  if (hasSubscription) return 'Limited Partner'
  
  // Check if they have an access grant for this asset
  const hasGrant = mockAccessGrants.some(
    g => g.granteeId === org.id && g.status === 'Active' &&
         (g.assetScope === 'ALL' || (Array.isArray(g.assetScope) && g.assetScope.includes(assetId)))
  )
  if (hasGrant) return 'Delegate'
  
  return null
}

/**
 * Check if an organization acts as an Asset Manager for any assets.
 */
export function isAssetManager(org: Organization): boolean {
  return mockAssets.some(a => a.ownerId === org.id)
}

/**
 * Check if an organization acts as a Limited Partner for any assets.
 */
export function isLimitedPartner(org: Organization): boolean {
  return mockSubscriptions.some(s => s.subscriberId === org.id && s.status === 'Active')
}

/**
 * Check if an organization is a Delegate (has any access grants).
 */
export function isDelegate(org: Organization): boolean {
  return mockAccessGrants.some(g => g.granteeId === org.id && g.status === 'Active')
}

/**
 * Get the "primary" role for an organization for backward compatibility.
 * This is used when we need a single role (e.g., for DEFAULT_PERMISSIONS).
 * 
 * Priority: Platform Admin > Asset Manager > Limited Partner > Delegate
 * 
 * @deprecated Prefer using getOrganizationRoles() for multi-role support
 */
export function getPrimaryRole(org: Organization): 'Platform Admin' | 'Asset Manager' | 'Limited Partner' | 'Delegate' {
  if (isPlatformAdmin(org)) return 'Platform Admin'
  if (isAssetManager(org)) return 'Asset Manager'
  if (isLimitedPartner(org)) return 'Limited Partner'
  return 'Delegate' // Default fallback
}

// ============================================================================

// Check if user has a specific permission based on their org's derived role
export function hasDefaultPermission(user: User, resource: Resource, action: Action): boolean {
  const org = getUserOrganization(user)
  if (!org) return false

  // Use derived role instead of fixed org.role
  const role = getPrimaryRole(org)
  const rolePermissions = DEFAULT_PERMISSIONS[role]
  if (!rolePermissions) return false

  const resourcePermissions = rolePermissions[resource]
  if (!resourcePermissions) return false

  return resourcePermissions.includes(action)
}

// Check if delegate can manage subscriptions for a specific asset owner (GP grants)
export function canDelegateManageSubscriptions(delegateOrgId: number, assetOwnerId: number): boolean {
  const grant = mockAccessGrants.find(
    g => g.granteeId === delegateOrgId && 
         g.grantorId === assetOwnerId && 
         g.status === 'Active' &&
         g.canPublish && // GP grant
         g.canManageSubscriptions
  )
  return !!grant
}

// Alias for backward compatibility
export const canPublisherManageSubscriptions = canDelegateManageSubscriptions

// Get assets that a user can access
// Uses derived roles - an org can be Asset Manager, LP, and Delegate for different assets
export function getAccessibleAssets(user: User): Asset[] {
  const org = getUserOrganization(user)
  if (!org) return []

  // Platform Admin can see all assets
  if (isPlatformAdmin(org)) {
    return mockAssets
  }

  const accessibleAssetIds = new Set<number>()
  const roles = getOrganizationRoles(org)

  // As Asset Manager - can see assets they own
  roles.assetManagerFor.forEach(asset => accessibleAssetIds.add(asset.id))

  // As Limited Partner - can see assets they have subscriptions for
  roles.limitedPartnerIn.forEach(asset => accessibleAssetIds.add(asset.id))

  // As Delegate - can see assets from grants with canViewData=true
  roles.delegateFor.forEach(grant => {
    if (!grant.canViewData) return
    
    if (grant.canPublish) {
      // GP grant - assetScope refers to actual assets
      if (grant.assetScope === 'ALL') {
        mockAssets.filter(a => a.ownerId === grant.grantorId).forEach(a => accessibleAssetIds.add(a.id))
      } else {
        (grant.assetScope as number[]).forEach(id => accessibleAssetIds.add(id))
      }
    } else {
      // LP grant - assetScope refers to subscriber's subscribed assets
      if (grant.assetScope === 'ALL') {
        // Get all assets the subscriber (grantor) has access to
        const subSubscriptions = mockSubscriptions.filter(
          s => s.subscriberId === grant.grantorId && s.status === 'Active'
        )
        subSubscriptions.forEach(s => accessibleAssetIds.add(s.assetId))
      } else {
        (grant.assetScope as number[]).forEach(id => accessibleAssetIds.add(id))
      }
    }
  })

  return mockAssets.filter(asset => accessibleAssetIds.has(asset.id))
}

// Get subscriptions that a user can view
// Uses derived roles - an org can view subscriptions as Asset Manager, LP, or Delegate
export function getViewableSubscriptions(user: User): Subscription[] {
  const org = getUserOrganization(user)
  if (!org) return []

  // Platform Admin can see all subscriptions
  if (isPlatformAdmin(org)) {
    return mockSubscriptions
  }

  const viewableSubscriptionIds = new Set<string>()
  const roles = getOrganizationRoles(org)

  // As Asset Manager - can view subscriptions for assets they own
  if (roles.assetManagerFor.length > 0) {
    const ownedAssetIds = roles.assetManagerFor.map(a => a.id)
    mockSubscriptions.filter(s => ownedAssetIds.includes(s.assetId))
      .forEach(s => viewableSubscriptionIds.add(s.id))
  }

  // As Limited Partner - can view their own subscriptions
  if (roles.limitedPartnerIn.length > 0) {
    mockSubscriptions.filter(s => s.subscriberId === org.id)
      .forEach(s => viewableSubscriptionIds.add(s.id))
  }

  // As Delegate - can view subscriptions for assets they have GP grants for
  const gpGrants = roles.delegateFor.filter(g => g.canPublish)
  gpGrants.forEach(grant => {
    const assetIds = new Set<number>()
    if (grant.assetScope === 'ALL') {
      mockAssets.filter(a => a.ownerId === grant.grantorId).forEach(a => assetIds.add(a.id))
    } else {
      (grant.assetScope as number[]).forEach(id => assetIds.add(id))
    }
    mockSubscriptions.filter(s => assetIds.has(s.assetId))
      .forEach(s => viewableSubscriptionIds.add(s.id))
  })

  return mockSubscriptions.filter(s => viewableSubscriptionIds.has(s.id))
}

// Get subscriptions that a user can manage
// Uses derived roles - management is available as Asset Manager or Delegate with canManageSubscriptions
export function getManageableSubscriptions(user: User): Subscription[] {
  const org = getUserOrganization(user)
  if (!org) return []

  // Platform Admin can manage all subscriptions
  if (isPlatformAdmin(org)) {
    return mockSubscriptions
  }

  const manageableSubscriptionIds = new Set<string>()
  const roles = getOrganizationRoles(org)

  // As Asset Manager - can manage subscriptions for assets they own
  if (roles.assetManagerFor.length > 0) {
    const ownedAssetIds = roles.assetManagerFor.map(a => a.id)
    mockSubscriptions.filter(s => ownedAssetIds.includes(s.assetId))
      .forEach(s => manageableSubscriptionIds.add(s.id))
  }

  // As Limited Partner - can view their own subscriptions but not manage others
  // Note: They can accept/decline their own pending invitations
  if (roles.limitedPartnerIn.length > 0) {
    mockSubscriptions.filter(s => s.subscriberId === org.id)
      .forEach(s => manageableSubscriptionIds.add(s.id))
  }

  // As Delegate - can manage subscriptions if granted canManageSubscriptions via GP grant
  const gpGrantsWithManage = roles.delegateFor.filter(g => g.canPublish && g.canManageSubscriptions)
  gpGrantsWithManage.forEach(grant => {
    const assetIds = new Set<number>()
    if (grant.assetScope === 'ALL') {
      mockAssets.filter(a => a.ownerId === grant.grantorId).forEach(a => assetIds.add(a.id))
    } else {
      (grant.assetScope as number[]).forEach(id => assetIds.add(id))
    }
    mockSubscriptions.filter(s => assetIds.has(s.assetId))
      .forEach(s => manageableSubscriptionIds.add(s.id))
  })

  return mockSubscriptions.filter(s => manageableSubscriptionIds.has(s.id))
}

// Check if a user can approve a specific subscription request
// This checks the canApproveSubscriptions flag, separate from canManageSubscriptions
// Uses derived roles - an org can approve if they're Asset Manager for the asset or have a GP grant with canApproveSubscriptions
export function canApproveSubscriptionRequest(user: User, subscription: Subscription): boolean {
  const org = getUserOrganization(user)
  if (!org) return false

  // Platform Admins can approve all subscription requests
  if (isPlatformAdmin(org)) {
    return true
  }

  const roles = getOrganizationRoles(org)

  // As Asset Manager - can approve subscription requests for assets they own
  const asset = mockAssets.find(a => a.id === subscription.assetId)
  if (asset && roles.assetManagerFor.some(a => a.id === asset.id)) {
    return true
  }

  // As Delegate - can approve if they have canApproveSubscriptions = true via GP grant
  const canApproveGrants = roles.delegateFor.filter(
    g => g.canPublish && g.canApproveSubscriptions === true
  )
  
  // Check if any of these grants cover the subscription's asset
  return canApproveGrants.some(grant => {
    if (grant.assetScope === 'ALL') {
      const subscriptionAsset = mockAssets.find(a => a.id === subscription.assetId)
      return subscriptionAsset && subscriptionAsset.ownerId === grant.grantorId
    }
    return (grant.assetScope as number[]).includes(subscription.assetId)
  })
}

// Get access grants that a user can manage
// Uses derived roles - combines grants from all roles the org plays
export function getManageableAccessGrants(user: User): AccessGrant[] {
  const org = getUserOrganization(user)
  if (!org) return []

  if (isPlatformAdmin(org)) {
    return mockAccessGrants
  }

  const manageableGrantIds = new Set<string>()
  const roles = getOrganizationRoles(org)

  // As Asset Manager - can manage GP grants they've given
  if (roles.assetManagerFor.length > 0) {
    mockAccessGrants.filter(g => g.grantorId === org.id && g.canPublish)
      .forEach(g => manageableGrantIds.add(g.id))
  }

  // As Limited Partner - can manage LP grants they've given
  if (roles.limitedPartnerIn.length > 0) {
    mockAccessGrants.filter(g => g.grantorId === org.id && !g.canPublish)
      .forEach(g => manageableGrantIds.add(g.id))
  }

  // As Delegate - can view grants given to them
  if (roles.delegateFor.length > 0) {
    mockAccessGrants.filter(g => g.granteeId === org.id)
      .forEach(g => manageableGrantIds.add(g.id))
  }

  return mockAccessGrants.filter(g => manageableGrantIds.has(g.id))
}

// Alias for backward compatibility
export function getManageablePublishingRights(user: User): PublishingRight[] {
  const grants = getManageableAccessGrants(user).filter(g => g.canPublish)
  // Convert AccessGrant to PublishingRight format
  return grants.map(g => ({
    id: g.id,
    assetOwnerId: g.grantorId,
    publisherId: g.granteeId,
    assetScope: g.assetScope,
    canManageSubscriptions: g.canManageSubscriptions,
    canApproveSubscriptions: g.canApproveSubscriptions,
    canApproveDelegations: g.canApproveDelegations,
    canViewData: g.canViewData,
    grantedAt: g.grantedAt,
    status: g.status === 'Active' ? 'Active' as const : 'Revoked' as const,
  }))
}

// Get access grants (LP grants) that need GP approval for a given user
// Uses derived roles for contextual access
export function getAccessGrantsRequiringApproval(user: User): AccessGrant[] {
  const org = getUserOrganization(user)
  if (!org) return []

  // Platform Admins can approve all LP grants
  if (isPlatformAdmin(org)) {
    return mockAccessGrants.filter(g => 
      g.status === 'Pending Approval' && g.approvalStatus === 'Pending' && !g.canPublish
    )
  }

  const approvableGrantIds = new Set<string>()
  const roles = getOrganizationRoles(org)

  // Get pending LP grants
  const pendingLPGrants = mockAccessGrants.filter(g => 
    g.status === 'Pending Approval' && g.approvalStatus === 'Pending' && !g.canPublish
  )

  // As Asset Manager - can approve LP grants involving their assets
  if (roles.assetManagerFor.length > 0) {
    const ownedAssetIds = roles.assetManagerFor.map(a => a.id)
    
    pendingLPGrants.forEach(g => {
      // Check if the grant involves any assets owned by this GP
      if (g.assetScope === 'ALL') {
        const subSubscriptions = mockSubscriptions.filter(
          s => s.subscriberId === g.grantorId && s.status === 'Active'
        )
        if (subSubscriptions.some(s => ownedAssetIds.includes(s.assetId))) {
          approvableGrantIds.add(g.id)
        }
      } else if ((g.assetScope as number[]).some(id => ownedAssetIds.includes(id))) {
        approvableGrantIds.add(g.id)
      }
    })
  }

  // As Delegate - can approve if they have canApproveDelegations = true via GP grant
  const approvalGrants = roles.delegateFor.filter(g => g.canPublish && g.canApproveDelegations)
  if (approvalGrants.length > 0) {
    // Get asset IDs this delegate can approve grants for
    const approvableAssetIds = new Set<number>()
    approvalGrants.forEach(grant => {
      if (grant.assetScope === 'ALL') {
        mockAssets.filter(a => a.ownerId === grant.grantorId).forEach(a => approvableAssetIds.add(a.id))
      } else {
        (grant.assetScope as number[]).forEach(id => approvableAssetIds.add(id))
      }
    })

    pendingLPGrants.forEach(g => {
      if (g.assetScope === 'ALL') {
        const subSubscriptions = mockSubscriptions.filter(
          s => s.subscriberId === g.grantorId && s.status === 'Active'
        )
        if (subSubscriptions.some(s => approvableAssetIds.has(s.assetId))) {
          approvableGrantIds.add(g.id)
        }
      } else if ((g.assetScope as number[]).some(id => approvableAssetIds.has(id))) {
        approvableGrantIds.add(g.id)
      }
    })
  }

  return mockAccessGrants.filter(g => approvableGrantIds.has(g.id))
}

// Alias for backward compatibility - converts AccessGrants to Delegations
export function getDelegationsRequiringApproval(user: User): Delegation[] {
  const grants = getAccessGrantsRequiringApproval(user)
  return grants.map(g => ({
    id: g.id,
    subscriberId: g.grantorId,
    delegateId: g.granteeId,
    assetScope: g.assetScope,
    typeScope: g.dataTypeScope,
    status: 'Pending GP Approval' as const,
    gpApprovalRequired: g.requiresApproval,
    gpApprovalStatus: g.approvalStatus || undefined,
    gpApprovedAt: g.approvedAt || undefined,
    gpApprovedById: g.approvedById || undefined,
    canManageSubscriptions: g.canManageSubscriptions,
    createdAt: g.grantedAt,
  }))
}

// Check if a user can approve a specific access grant (LP grant)
// Uses derived roles for contextual access
export function canApproveAccessGrant(user: User, grant: AccessGrant): boolean {
  const org = getUserOrganization(user)
  if (!org) return false

  // Platform Admins can approve all grants
  if (isPlatformAdmin(org)) {
    return true
  }

  // Only LP grants (canPublish=false) need GP approval
  if (grant.canPublish) {
    return false
  }

  const roles = getOrganizationRoles(org)

  // As Asset Manager - can approve LP grants for their assets
  if (roles.assetManagerFor.length > 0) {
    const ownedAssetIds = roles.assetManagerFor.map(a => a.id)
    
    if (grant.assetScope === 'ALL') {
      const subSubscriptions = mockSubscriptions.filter(
        s => s.subscriberId === grant.grantorId && s.status === 'Active'
      )
      if (subSubscriptions.some(s => ownedAssetIds.includes(s.assetId))) {
        return true
      }
    } else if ((grant.assetScope as number[]).some(id => ownedAssetIds.includes(id))) {
      return true
    }
  }

  // As Delegate - can approve if they have canApproveDelegations = true via GP grant
  const approvalGrants = roles.delegateFor.filter(g => g.canPublish && g.canApproveDelegations)
  if (approvalGrants.length > 0) {
    const approvableAssetIds = new Set<number>()
    approvalGrants.forEach(g => {
      if (g.assetScope === 'ALL') {
        mockAssets.filter(a => a.ownerId === g.grantorId).forEach(a => approvableAssetIds.add(a.id))
      } else {
        (g.assetScope as number[]).forEach(id => approvableAssetIds.add(id))
      }
    })

    if (grant.assetScope === 'ALL') {
      const subSubscriptions = mockSubscriptions.filter(
        s => s.subscriberId === grant.grantorId && s.status === 'Active'
      )
      if (subSubscriptions.some(s => approvableAssetIds.has(s.assetId))) {
        return true
      }
    } else if ((grant.assetScope as number[]).some(id => approvableAssetIds.has(id))) {
      return true
    }
  }

  return false
}

// Alias for backward compatibility
export function canApproveDelegation(user: User, delegation: Delegation): boolean {
  // Find the corresponding AccessGrant
  const grant = mockAccessGrants.find(g => g.id === delegation.id)
  if (!grant) return false
  return canApproveAccessGrant(user, grant)
}

// Check if a user (delegate) can manage subscriptions for a specific subscriber
// Uses derived roles for contextual access
export function canManageSubscriptionsForSubscriber(user: User, subscriberId: number): boolean {
  const org = getUserOrganization(user)
  if (!org) return false

  // Platform Admins can manage all subscriptions
  if (isPlatformAdmin(org)) {
    return true
  }

  const roles = getOrganizationRoles(org)

  // As Limited Partner - can manage their own subscriptions
  if (roles.limitedPartnerIn.length > 0 && org.id === subscriberId) {
    return true
  }

  // As Delegate - can manage subscriptions if they have an LP grant with canManageSubscriptions
  const lpGrantsWithManage = roles.delegateFor.filter(
    g => !g.canPublish && g.grantorId === subscriberId && g.canManageSubscriptions
  )
  if (lpGrantsWithManage.length > 0) {
    return true
  }

  return false
}

// Get subscriptions that a user can manage (either as subscriber or as delegate)
// Uses derived roles for contextual access
export function getManageableSubscriptionsForUser(user: User): Subscription[] {
  const org = getUserOrganization(user)
  if (!org) return []

  // Platform Admins can manage all subscriptions
  if (isPlatformAdmin(org)) {
    return mockSubscriptions
  }

  const manageableSubscriptionIds = new Set<string>()
  const roles = getOrganizationRoles(org)

  // As Limited Partner - can manage their own subscriptions
  if (roles.limitedPartnerIn.length > 0) {
    mockSubscriptions.filter(s => s.subscriberId === org.id)
      .forEach(s => manageableSubscriptionIds.add(s.id))
  }

  // As Delegate - can manage subscriptions for LPs they have LP grants from
  const lpGrantsWithManage = roles.delegateFor.filter(g => !g.canPublish && g.canManageSubscriptions)
  if (lpGrantsWithManage.length > 0) {
    const subscriberIds = new Set(lpGrantsWithManage.map(g => g.grantorId))
    mockSubscriptions.filter(s => subscriberIds.has(s.subscriberId))
      .forEach(s => manageableSubscriptionIds.add(s.id))
  }

  return mockSubscriptions.filter(s => manageableSubscriptionIds.has(s.id))
}

// Check if a subscriber has a subscription that allows publishing (Pending LP Acceptance, Pending Asset Manager Approval, or Active)
// Publishers can send data to LPs even if they haven't accepted yet - this incentivizes onboarding
// Also allows publishing to requests that are pending approval
// Works with both in-memory DB (Vercel) and Prisma (local)
export async function hasSubscriptionForPublishing(
  assetId: number,
  subscriberId: number
): Promise<boolean> {
  // Check if we're using in-memory DB (Vercel)
  const { isVercel, getInMemoryDB } = await import('@/lib/in-memory-db')
  
  if (isVercel()) {
    const db = getInMemoryDB()
    return db.subscriptions.some(
      s => s.assetId === assetId && 
           s.subscriberId === subscriberId && 
           (s.status === 'Active' || s.status === 'Pending LP Acceptance' || s.status === 'Pending Asset Manager Approval')
    )
  } else {
    // Use Prisma for local development
    const { prisma } = await import('@/lib/prisma')
    const subscription = await prisma.subscription.findFirst({
      where: {
        assetId,
        subscriberId,
        status: {
          in: ['Active', 'Pending LP Acceptance', 'Pending Asset Manager Approval'],
        },
      },
    })
    return !!subscription
  }
}

// Check if a subscriber has an active subscription to an asset (for viewing)
// Only "Active" subscriptions allow viewing - data sent before acceptance becomes visible after acceptance
// Works with both in-memory DB (Vercel) and Prisma (local)
export async function hasActiveSubscription(
  assetId: number,
  subscriberId: number
): Promise<boolean> {
  // Check if we're using in-memory DB (Vercel)
  const { isVercel, getInMemoryDB } = await import('@/lib/in-memory-db')
  
  if (isVercel()) {
    const db = getInMemoryDB()
    const now = new Date()
    return db.subscriptions.some(
      s => s.assetId === assetId && 
           s.subscriberId === subscriberId && 
           s.status === 'Active' &&
           (!s.expiresAt || new Date(s.expiresAt) > now)
    )
  } else {
    // Use Prisma for local development
    const { prisma } = await import('@/lib/prisma')
    const now = new Date().toISOString()
    const subscription = await prisma.subscription.findFirst({
      where: {
        assetId,
        subscriberId,
        status: 'Active',
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } },
        ],
      },
    })
    return !!subscription
  }
}

// Synchronous version for in-memory checks (used in filterEnvelopesByAccess)
// Only checks for "Active" status - used for viewing access control
// Also checks expiration date
export function hasActiveSubscriptionSync(
  assetId: number,
  subscriberId: number
): boolean {
  const now = new Date()
  return mockSubscriptions.some(
    s => s.assetId === assetId && 
         s.subscriberId === subscriberId && 
         s.status === 'Active' &&
         (!s.expiresAt || new Date(s.expiresAt) > now)
  )
}

// Get access grants that a user can view/manage
// Uses derived roles - combines accessible grants from all roles the org plays
export function getAccessibleAccessGrants(user: User): AccessGrant[] {
  const org = getUserOrganization(user)
  if (!org) return []

  if (isPlatformAdmin(org)) {
    return mockAccessGrants
  }

  const accessibleGrantIds = new Set<string>()
  const roles = getOrganizationRoles(org)

  // As Asset Manager - can see:
  // 1. GP grants they've given out
  // 2. LP grants that involve their assets (for approval)
  if (roles.assetManagerFor.length > 0) {
    const ownedAssetIds = roles.assetManagerFor.map(a => a.id)
    mockAccessGrants.forEach(g => {
      // GP grants they've given
      if (g.grantorId === org.id && g.canPublish) {
        accessibleGrantIds.add(g.id)
      }
      // LP grants involving their assets
      if (!g.canPublish) {
        if (g.assetScope === 'ALL') {
          const subSubscriptions = mockSubscriptions.filter(
            s => s.subscriberId === g.grantorId && s.status === 'Active'
          )
          if (subSubscriptions.some(s => ownedAssetIds.includes(s.assetId))) {
            accessibleGrantIds.add(g.id)
          }
        } else if ((g.assetScope as number[]).some(id => ownedAssetIds.includes(id))) {
          accessibleGrantIds.add(g.id)
        }
      }
    })
  }

  // As Limited Partner - can see their own LP grants (grants they've given out)
  if (roles.limitedPartnerIn.length > 0) {
    mockAccessGrants.filter(g => g.grantorId === org.id && !g.canPublish)
      .forEach(g => accessibleGrantIds.add(g.id))
  }

  // As Delegate - can see all grants given to them (both GP and LP grants)
  if (roles.delegateFor.length > 0) {
    mockAccessGrants.filter(g => 
      g.granteeId === org.id && 
      (g.status === 'Active' || g.status === 'Pending Approval')
    ).forEach(g => accessibleGrantIds.add(g.id))
  }

  return mockAccessGrants.filter(g => accessibleGrantIds.has(g.id))
}

// Alias for backward compatibility - returns only LP grants as Delegations
export function getAccessibleDelegations(user: User): Delegation[] {
  const grants = getAccessibleAccessGrants(user).filter(g => !g.canPublish)
  return grants.map(g => ({
    id: g.id,
    subscriberId: g.grantorId,
    delegateId: g.granteeId,
    assetScope: g.assetScope,
    typeScope: g.dataTypeScope,
    status: g.status === 'Active' ? 'Active' as const : 
            g.status === 'Pending Approval' ? 'Pending GP Approval' as const : 
            'Rejected' as const,
    gpApprovalRequired: g.requiresApproval,
    gpApprovalStatus: g.approvalStatus || undefined,
    gpApprovedAt: g.approvedAt || undefined,
    gpApprovedById: g.approvedById || undefined,
    canManageSubscriptions: g.canManageSubscriptions,
    createdAt: g.grantedAt,
  }))
}

// Check if user can access a specific resource with a specific action
// Uses derived roles for contextual access
export function canAccess(
  user: User,
  resource: Resource,
  action: Action,
  context?: { assetId?: number; accessGrantId?: string; subscriptionId?: string }
): boolean {
  const org = getUserOrganization(user)
  if (!org) return false

  // Platform Admin has access to everything
  if (isPlatformAdmin(org)) {
    return true
  }

  // Check if user is org admin for user management
  if (resource === 'users' && (action === 'create' || action === 'update' || action === 'delete')) {
    if (!user.isOrgAdmin) return false
  }

  const roles = getOrganizationRoles(org)

  // Check default permissions first
  if (!hasDefaultPermission(user, resource, action)) {
    // Special case: Delegate might have subscription management rights via GP grant
    if (resource === 'subscriptions' && roles.delegateFor.length > 0) {
      const manageableSubscriptions = getManageableSubscriptions(user)
      if (manageableSubscriptions.length > 0) {
        if (action === 'view' || action === 'create' || action === 'update' || action === 'delete') {
          return true
        }
      }
    }
    return false
  }

  // Resource-specific checks
  switch (resource) {
    case 'assets':
      if (context?.assetId) {
        const accessibleAssets = getAccessibleAssets(user)
        return accessibleAssets.some(a => a.id === context.assetId)
      }
      return true

    case 'subscriptions':
      if (context?.subscriptionId) {
        const manageableSubscriptions = getManageableSubscriptions(user)
        return manageableSubscriptions.some(s => s.id === context.subscriptionId)
      }
      return true

    case 'access-grants':
      // Approve action requires being Asset Manager or having delegation approval rights
      if (action === 'approve') {
        const canApprove = roles.assetManagerFor.length > 0 || 
          roles.delegateFor.some(g => g.canPublish && g.canApproveDelegations)
        if (!canApprove) return false
      }
      if (context?.accessGrantId) {
        const accessibleGrants = getAccessibleAccessGrants(user)
        return accessibleGrants.some(g => g.id === context.accessGrantId)
      }
      return true

    case 'envelopes':
      // Envelope access is filtered by getAccessibleEnvelopes
      return true

    default:
      return true
  }
}

// Get navigation items for a user based on their permissions
export interface NavItem {
  label: string
  href: string
  permission: { resource: Resource; action: Action }
}

export const ALL_NAV_ITEMS: NavItem[] = [
  { label: 'Registry', href: '/registry', permission: { resource: 'registry', action: 'view' } },
  { label: 'Audit', href: '/audit', permission: { resource: 'audit', action: 'view' } },
  { label: 'Composer', href: '/composer', permission: { resource: 'envelopes', action: 'publish' } },
  { label: 'History', href: '/history', permission: { resource: 'envelopes', action: 'view' } },
  { label: 'Subscriptions', href: '/subscriptions', permission: { resource: 'subscriptions', action: 'view' } },
  { label: 'Access Grants', href: '/access-grants', permission: { resource: 'access-grants', action: 'view' } },
  { label: 'Ledger', href: '/ledger', permission: { resource: 'envelopes', action: 'view' } },
  { label: 'Settings', href: '/settings/iam', permission: { resource: 'users', action: 'view' } },
]

// Get navigation items for a user based on their derived roles
// Uses multi-role support - combines nav items from all roles the org plays
export function getNavItemsForUser(user: User): NavItem[] {
  const org = getUserOrganization(user)
  if (!org) return []

  const navItems: NavItem[] = []
  const addedHrefs = new Set<string>() // Prevent duplicates

  const addNavItem = (item: NavItem) => {
    if (!addedHrefs.has(item.href)) {
      navItems.push(item)
      addedHrefs.add(item.href)
    }
  }

  // Platform Admin - special case
  if (isPlatformAdmin(org)) {
    addNavItem({ label: 'Registry', href: '/registry', permission: { resource: 'registry', action: 'view' } })
    addNavItem({ label: 'Audit', href: '/audit', permission: { resource: 'audit', action: 'view' } })
    addNavItem({ label: 'Access Grants', href: '/access-grants', permission: { resource: 'access-grants', action: 'view' } })
    addNavItem({ label: 'Ledger', href: '/ledger', permission: { resource: 'envelopes', action: 'view' } })
  } else {
    const roles = getOrganizationRoles(org)

    // As Asset Manager - add GP-related nav items
    if (roles.assetManagerFor.length > 0) {
      addNavItem({ label: 'Assets', href: '/assets', permission: { resource: 'assets', action: 'view' } })
      addNavItem({ label: 'Subscriptions', href: '/subscriptions', permission: { resource: 'subscriptions', action: 'view' } })
      addNavItem({ label: 'Access Grants', href: '/access-grants', permission: { resource: 'access-grants', action: 'view' } })
      addNavItem({ label: 'Publish Data', href: '/composer', permission: { resource: 'envelopes', action: 'publish' } })
      addNavItem({ label: 'History', href: '/history', permission: { resource: 'envelopes', action: 'view' } })
      addNavItem({ label: 'Ledger', href: '/ledger', permission: { resource: 'envelopes', action: 'view' } })
    }

    // As Limited Partner - add LP-related nav items
    if (roles.limitedPartnerIn.length > 0) {
      addNavItem({ label: 'Subscriptions', href: '/feeds', permission: { resource: 'subscriptions', action: 'view' } })
      addNavItem({ label: 'Access Grants', href: '/access-grants', permission: { resource: 'access-grants', action: 'view' } })
      addNavItem({ label: 'Ledger', href: '/ledger', permission: { resource: 'envelopes', action: 'view' } })
    }

    // As Delegate - add based on grant capabilities
    if (roles.delegateFor.length > 0) {
      const gpGrants = roles.delegateFor.filter(g => g.canPublish)
      const lpGrantsWithSubs = roles.delegateFor.filter(g => !g.canPublish && g.canManageSubscriptions)
      
      if (gpGrants.length > 0) {
        addNavItem({ label: 'Subscriptions', href: '/subscriptions', permission: { resource: 'subscriptions', action: 'view' } })
        addNavItem({ label: 'Publish Data', href: '/composer', permission: { resource: 'envelopes', action: 'publish' } })
        addNavItem({ label: 'History', href: '/history', permission: { resource: 'envelopes', action: 'view' } })
      }
      
      if (lpGrantsWithSubs.length > 0) {
        addNavItem({ label: 'Subscriptions', href: '/feeds', permission: { resource: 'subscriptions', action: 'view' } })
      }
      
      // All delegates can see their access grants and ledger
      addNavItem({ label: 'Access Grants', href: '/access-grants', permission: { resource: 'access-grants', action: 'view' } })
      addNavItem({ label: 'Ledger', href: '/ledger', permission: { resource: 'envelopes', action: 'view' } })
    }
  }

  // Add IAM last for all org admins
  if (user.isOrgAdmin) {
    addNavItem({ label: 'IAM', href: '/settings/iam', permission: { resource: 'users', action: 'view' } })
  }

  return navItems
}

// Filter envelopes based on user's access
// Uses derived roles - combines envelope access from all roles the org plays
export function filterEnvelopesByAccess(
  user: User,
  envelopes: Array<{ id: number; recipientId: number; assetId: number; dataType?: DataType }>
): typeof envelopes {
  const org = getUserOrganization(user)
  if (!org) return []

  // Platform Admin can see all envelopes
  if (isPlatformAdmin(org)) {
    return envelopes
  }

  const accessibleEnvelopeIds = new Set<number>()
  const roles = getOrganizationRoles(org)

  // As Asset Manager - can see envelopes for assets they own
  if (roles.assetManagerFor.length > 0) {
    const ownedAssetIds = roles.assetManagerFor.map(a => a.id)
    envelopes.filter(e => ownedAssetIds.includes(e.assetId))
      .forEach(e => accessibleEnvelopeIds.add(e.id))
  }

  // As Limited Partner - can see envelopes addressed to them with active subscription
  if (roles.limitedPartnerIn.length > 0) {
    envelopes.filter(e => {
      // Must be addressed to this subscriber
      if (e.recipientId !== org.id) return false
      // Must have an active subscription to the asset
      return hasActiveSubscriptionSync(e.assetId, org.id)
    }).forEach(e => accessibleEnvelopeIds.add(e.id))
  }

  // As Delegate - can see envelopes based on AccessGrants with canViewData
  const viewGrants = roles.delegateFor.filter(g => g.canViewData)
  if (viewGrants.length > 0) {
    envelopes.filter(envelope => {
      return viewGrants.some(grant => {
        if (grant.canPublish) {
          // GP grant - check asset scope directly
          if (grant.assetScope === 'ALL') {
            const asset = mockAssets.find(a => a.id === envelope.assetId)
            return asset && asset.ownerId === grant.grantorId
          }
          return (grant.assetScope as number[]).includes(envelope.assetId)
        } else {
          // LP grant - envelope must be addressed to the LP (grantor)
          if (envelope.recipientId !== grant.grantorId) {
            return false
          }

          // Check asset scope
          let assetMatch = false
          if (grant.assetScope === 'ALL') {
            // Check if envelope is for LP's subscribed assets
            const subSubscriptions = mockSubscriptions.filter(
              s => s.subscriberId === grant.grantorId && s.status === 'Active'
            )
            assetMatch = subSubscriptions.some(s => s.assetId === envelope.assetId)
          } else {
            assetMatch = (grant.assetScope as number[]).includes(envelope.assetId)
          }

          // Check data type scope
          let typeMatch = false
          if (grant.dataTypeScope === 'ALL') {
            typeMatch = true
          } else if (envelope.dataType) {
            typeMatch = (grant.dataTypeScope as DataType[]).includes(envelope.dataType)
          }

          return assetMatch && typeMatch
        }
      })
    }).forEach(e => accessibleEnvelopeIds.add(e.id))
  }

  return envelopes.filter(e => accessibleEnvelopeIds.has(e.id))
}

