import { User, Organization, Asset, Delegation, Subscription, PublishingRight, AccessGrant, Resource, Action, Permission, PermissionScope, DataType } from '@/types'
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

// Check if user has a specific permission based on their org role
export function hasDefaultPermission(user: User, resource: Resource, action: Action): boolean {
  const org = getUserOrganization(user)
  if (!org) return false

  const rolePermissions = DEFAULT_PERMISSIONS[org.role]
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
export function getAccessibleAssets(user: User): Asset[] {
  const org = getUserOrganization(user)
  if (!org) return []

  switch (org.role) {
    case 'Platform Admin':
      // Platform admin can see all assets
      return mockAssets

    case 'Asset Manager':
      // Asset owner can see assets they own
      return mockAssets.filter(a => a.ownerId === org.id)

    case 'Delegate':
      // Delegate can see assets from BOTH GP grants (canPublish=true) AND LP grants (canPublish=false)
      const delegateGrants = mockAccessGrants.filter(
        g => g.granteeId === org.id && g.status === 'Active' && g.canViewData === true
      )
      const delegatedAssetIds = new Set<number>()
      
      delegateGrants.forEach(grant => {
        if (grant.canPublish) {
          // GP grant - assetScope refers to actual assets
          if (grant.assetScope === 'ALL') {
            mockAssets.filter(a => a.ownerId === grant.grantorId).forEach(a => delegatedAssetIds.add(a.id))
          } else {
            (grant.assetScope as number[]).forEach(id => delegatedAssetIds.add(id))
          }
        } else {
          // LP grant - assetScope refers to subscriber's subscribed assets
          if (grant.assetScope === 'ALL') {
            // Get all assets the subscriber (grantor) has access to
            const subSubscriptions = mockSubscriptions.filter(
              s => s.subscriberId === grant.grantorId && s.status === 'Active'
            )
            subSubscriptions.forEach(s => delegatedAssetIds.add(s.assetId))
          } else {
            (grant.assetScope as number[]).forEach(id => delegatedAssetIds.add(id))
          }
        }
      })
      return mockAssets.filter(asset => delegatedAssetIds.has(asset.id))

    case 'Limited Partner':
      // Subscriber can see assets they have subscriptions for
      const subscriptions = mockSubscriptions.filter(
        s => s.subscriberId === org.id && s.status === 'Active'
      )
      return mockAssets.filter(asset => 
        subscriptions.some(s => s.assetId === asset.id)
      )

    default:
      return []
  }
}

// Get subscriptions that a user can view (for Delegates with GP grants, includes all assets they have publishing rights to)
export function getViewableSubscriptions(user: User): Subscription[] {
  const org = getUserOrganization(user)
  if (!org) return []

  switch (org.role) {
    case 'Platform Admin':
      return mockSubscriptions

    case 'Asset Manager':
      // Asset owner can view subscriptions for their assets
      const ownedAssetIds = mockAssets.filter(a => a.ownerId === org.id).map(a => a.id)
      return mockSubscriptions.filter(s => ownedAssetIds.includes(s.assetId))

    case 'Delegate':
      // Delegate can view subscriptions for assets they have GP grants (canPublish=true) for
      const gpGrants = mockAccessGrants.filter(
        g => g.granteeId === org.id && g.status === 'Active' && g.canPublish
      )
      if (gpGrants.length === 0) return []
      
      // Get assets from those GP grants
      const viewableAssetIds = new Set<number>()
      gpGrants.forEach(grant => {
        if (grant.assetScope === 'ALL') {
          mockAssets.filter(a => a.ownerId === grant.grantorId).forEach(a => viewableAssetIds.add(a.id))
        } else {
          (grant.assetScope as number[]).forEach(id => viewableAssetIds.add(id))
        }
      })
      return mockSubscriptions.filter(s => viewableAssetIds.has(s.assetId))

    case 'Limited Partner':
      // Subscriber can only view their own subscriptions
      return mockSubscriptions.filter(s => s.subscriberId === org.id)

    default:
      return []
  }
}

// Get subscriptions that a user can manage
export function getManageableSubscriptions(user: User): Subscription[] {
  const org = getUserOrganization(user)
  if (!org) return []

  switch (org.role) {
    case 'Platform Admin':
      return mockSubscriptions

    case 'Asset Manager':
      // Asset owner can manage subscriptions for their assets
      const ownedAssetIds = mockAssets.filter(a => a.ownerId === org.id).map(a => a.id)
      return mockSubscriptions.filter(s => ownedAssetIds.includes(s.assetId))

    case 'Delegate':
      // Delegate can manage subscriptions if granted that right via GP grant
      const gpGrants = mockAccessGrants.filter(
        g => g.granteeId === org.id && g.status === 'Active' && g.canPublish && g.canManageSubscriptions
      )
      if (gpGrants.length === 0) return []
      
      // Get assets from those GP grants
      const manageableAssetIds = new Set<number>()
      gpGrants.forEach(grant => {
        if (grant.assetScope === 'ALL') {
          mockAssets.filter(a => a.ownerId === grant.grantorId).forEach(a => manageableAssetIds.add(a.id))
        } else {
          (grant.assetScope as number[]).forEach(id => manageableAssetIds.add(id))
        }
      })
      return mockSubscriptions.filter(s => manageableAssetIds.has(s.assetId))

    case 'Limited Partner':
      // Subscriber can only view their own subscriptions, not manage
      return mockSubscriptions.filter(s => s.subscriberId === org.id)

    default:
      return []
  }
}

// Check if a user can approve a specific subscription request
// This checks the canApproveSubscriptions flag, separate from canManageSubscriptions
export function canApproveSubscriptionRequest(user: User, subscription: Subscription): boolean {
  const org = getUserOrganization(user)
  if (!org) return false

  // Platform Admins can approve all subscription requests
  if (org.role === 'Platform Admin') {
    return true
  }

  // Asset Owners can always approve subscription requests for their assets
  if (org.role === 'Asset Manager') {
    const asset = mockAssets.find(a => a.id === subscription.assetId)
    if (asset && asset.ownerId === org.id) {
      return true
    }
  }

  // Delegates can approve if they have canApproveSubscriptions = true via GP grant
  if (org.role === 'Delegate') {
    const gpGrants = mockAccessGrants.filter(
      g => g.granteeId === org.id && 
           g.status === 'Active' && 
           g.canPublish &&
           g.canApproveSubscriptions === true
    )
    
    if (gpGrants.length === 0) {
      return false
    }

    // Check if any of the GP grants cover this asset
    return gpGrants.some(grant => {
      if (grant.assetScope === 'ALL') {
        const asset = mockAssets.find(a => a.id === subscription.assetId)
        return asset && asset.ownerId === grant.grantorId
      }
      return (grant.assetScope as number[]).includes(subscription.assetId)
    })
  }

  return false
}

// Get access grants that a user can manage
export function getManageableAccessGrants(user: User): AccessGrant[] {
  const org = getUserOrganization(user)
  if (!org) return []

  if (org.role === 'Platform Admin') {
    return mockAccessGrants
  }

  if (org.role === 'Asset Manager') {
    // GP can manage grants they've given AND see GP grants (canPublish=true)
    return mockAccessGrants.filter(g => g.grantorId === org.id)
  }

  if (org.role === 'Limited Partner') {
    // LP can manage LP grants they've given (canPublish=false)
    return mockAccessGrants.filter(g => g.grantorId === org.id && !g.canPublish)
  }

  if (org.role === 'Delegate') {
    // Delegates can view grants given to them
    return mockAccessGrants.filter(g => g.granteeId === org.id)
  }

  return []
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
export function getAccessGrantsRequiringApproval(user: User): AccessGrant[] {
  const org = getUserOrganization(user)
  if (!org) return []

  // Asset Owners and Platform Admins can approve LP grants involving their assets
  if (org.role === 'Asset Manager' || org.role === 'Platform Admin') {
    // Get all assets owned by this GP
    const ownedAssetIds = org.role === 'Platform Admin' 
      ? mockAssets.map(a => a.id)
      : mockAssets.filter(a => a.ownerId === org.id).map(a => a.id)
    
    // Find LP grants that need approval and involve assets this GP owns
    return mockAccessGrants.filter(g => {
      if (g.status !== 'Pending Approval' || g.approvalStatus !== 'Pending' || g.canPublish) {
        return false
      }
      
      // Check if the grant involves any assets owned by this GP
      if (g.assetScope === 'ALL') {
        // Check if LP (grantor) has subscriptions to GP's assets
        const subSubscriptions = mockSubscriptions.filter(
          s => s.subscriberId === g.grantorId && s.status === 'Active'
        )
        return subSubscriptions.some(s => ownedAssetIds.includes(s.assetId))
      }
      
      return (g.assetScope as number[]).some(id => ownedAssetIds.includes(id))
    })
  }

  // Delegates can approve if they have canApproveDelegations = true via GP grant
  if (org.role === 'Delegate') {
    // Get GP grants with canApproveDelegations
    const approvalGrants = mockAccessGrants.filter(
      g => g.granteeId === org.id && 
           g.status === 'Active' && 
           g.canPublish &&
           g.canApproveDelegations === true
    )
    
    if (approvalGrants.length === 0) {
      return []
    }

    // Get asset IDs this delegate can approve grants for
    const approvableAssetIds = new Set<number>()
    approvalGrants.forEach(grant => {
      if (grant.assetScope === 'ALL') {
        // Get all assets owned by the asset owner
        mockAssets.filter(a => a.ownerId === grant.grantorId).forEach(a => approvableAssetIds.add(a.id))
      } else {
        (grant.assetScope as number[]).forEach(id => approvableAssetIds.add(id))
      }
    })

    // Find LP grants that need approval and involve assets this delegate can approve
    return mockAccessGrants.filter(g => {
      if (g.status !== 'Pending Approval' || g.approvalStatus !== 'Pending' || g.canPublish) {
        return false
      }
      
      // Check if the grant involves any assets this delegate can approve
      if (g.assetScope === 'ALL') {
        // Check if LP has subscriptions to approvable assets
        const subSubscriptions = mockSubscriptions.filter(
          s => s.subscriberId === g.grantorId && s.status === 'Active'
        )
        return subSubscriptions.some(s => approvableAssetIds.has(s.assetId))
      }
      
      return (g.assetScope as number[]).some(id => approvableAssetIds.has(id))
    })
  }

  return []
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
export function canApproveAccessGrant(user: User, grant: AccessGrant): boolean {
  const org = getUserOrganization(user)
  if (!org) return false

  // Platform Admins can approve all grants
  if (org.role === 'Platform Admin') {
    return true
  }

  // Only LP grants (canPublish=false) need GP approval
  if (grant.canPublish) {
    return false
  }

  // Asset Owners can approve LP grants for their assets
  if (org.role === 'Asset Manager') {
    // Get all assets owned by this GP
    const ownedAssetIds = mockAssets.filter(a => a.ownerId === org.id).map(a => a.id)
    
    // Check if the grant involves any assets owned by this GP
    if (grant.assetScope === 'ALL') {
      // Check if LP has subscriptions to GP's assets
      const subSubscriptions = mockSubscriptions.filter(
        s => s.subscriberId === grant.grantorId && s.status === 'Active'
      )
      return subSubscriptions.some(s => ownedAssetIds.includes(s.assetId))
    }
    
    return (grant.assetScope as number[]).some(id => ownedAssetIds.includes(id))
  }

  // Delegates can approve if they have canApproveDelegations = true via GP grant
  if (org.role === 'Delegate') {
    // Get GP grants with canApproveDelegations
    const approvalGrants = mockAccessGrants.filter(
      g => g.granteeId === org.id && 
           g.status === 'Active' && 
           g.canPublish &&
           g.canApproveDelegations === true
    )
    
    if (approvalGrants.length === 0) {
      return false
    }

    // Get asset IDs this delegate can approve grants for
    const approvableAssetIds = new Set<number>()
    approvalGrants.forEach(g => {
      if (g.assetScope === 'ALL') {
        // Get all assets owned by the asset owner
        mockAssets.filter(a => a.ownerId === g.grantorId).forEach(a => approvableAssetIds.add(a.id))
      } else {
        (g.assetScope as number[]).forEach(id => approvableAssetIds.add(id))
      }
    })

    // Check if the grant involves any assets this delegate can approve
    if (grant.assetScope === 'ALL') {
      // Check if LP has subscriptions to approvable assets
      const subSubscriptions = mockSubscriptions.filter(
        s => s.subscriberId === grant.grantorId && s.status === 'Active'
      )
      return subSubscriptions.some(s => approvableAssetIds.has(s.assetId))
    }
    
    return (grant.assetScope as number[]).some(id => approvableAssetIds.has(id))
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
export function canManageSubscriptionsForSubscriber(user: User, subscriberId: number): boolean {
  const org = getUserOrganization(user)
  if (!org) return false

  // Platform Admins can manage all subscriptions
  if (org.role === 'Platform Admin') {
    return true
  }

  // Subscriber can manage their own subscriptions
  if (org.role === 'Limited Partner' && org.id === subscriberId) {
    return true
  }

  // Delegate can manage subscriptions if they have an active LP grant with canManageSubscriptions = true
  if (org.role === 'Delegate') {
    const grants = mockAccessGrants.filter(
      g => g.granteeId === org.id && 
           g.grantorId === subscriberId && 
           g.status === 'Active' &&
           !g.canPublish && // LP grant
           g.canManageSubscriptions === true
    )
    return grants.length > 0
  }

  return false
}

// Get subscriptions that a user can manage (either as subscriber or as delegate)
export function getManageableSubscriptionsForUser(user: User): Subscription[] {
  const org = getUserOrganization(user)
  if (!org) return []

  // Platform Admins can manage all subscriptions
  if (org.role === 'Platform Admin') {
    return mockSubscriptions
  }

  // Subscriber can manage their own subscriptions
  if (org.role === 'Limited Partner') {
    return mockSubscriptions.filter(s => s.subscriberId === org.id)
  }

  // Delegate can manage subscriptions for LPs they have LP grants from
  if (org.role === 'Delegate') {
    const lpGrants = mockAccessGrants.filter(
      g => g.granteeId === org.id && 
           g.status === 'Active' &&
           !g.canPublish && // LP grant
           g.canManageSubscriptions === true
    )
    
    if (lpGrants.length === 0) return []

    // Get LP IDs from LP grants
    const subscriberIds = new Set(lpGrants.map(g => g.grantorId))
    
    // Return subscriptions for those subscribers
    return mockSubscriptions.filter(s => subscriberIds.has(s.subscriberId))
  }

  return []
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
export function getAccessibleAccessGrants(user: User): AccessGrant[] {
  const org = getUserOrganization(user)
  if (!org) return []

  switch (org.role) {
    case 'Platform Admin':
      return mockAccessGrants

    case 'Asset Manager':
      // GP can see:
      // 1. GP grants they've given out
      // 2. LP grants that involve their assets (for approval)
      const ownedAssetIds = mockAssets.filter(a => a.ownerId === org.id).map(a => a.id)
      return mockAccessGrants.filter(g => {
        // GP grants they've given
        if (g.grantorId === org.id && g.canPublish) return true
        
        // LP grants involving their assets
        if (!g.canPublish) {
          if (g.assetScope === 'ALL') {
            const subSubscriptions = mockSubscriptions.filter(
              s => s.subscriberId === g.grantorId && s.status === 'Active'
            )
            return subSubscriptions.some(s => ownedAssetIds.includes(s.assetId))
          }
          return (g.assetScope as number[]).some(id => ownedAssetIds.includes(id))
        }
        return false
      })

    case 'Limited Partner':
      // LP can see their own LP grants (grants they've given out)
      return mockAccessGrants.filter(g => g.grantorId === org.id && !g.canPublish)

    case 'Delegate':
      // Delegate can see all grants given to them (both GP and LP grants)
      return mockAccessGrants.filter(g => 
        g.granteeId === org.id && 
        (g.status === 'Active' || g.status === 'Pending Approval')
      )

    default:
      return []
  }
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
export function canAccess(
  user: User,
  resource: Resource,
  action: Action,
  context?: { assetId?: number; accessGrantId?: string; subscriptionId?: string }
): boolean {
  const org = getUserOrganization(user)
  if (!org) return false

  // Platform Admin has access to everything
  if (org.role === 'Platform Admin') {
    return true
  }

  // Check if user is org admin for user management
  if (resource === 'users' && (action === 'create' || action === 'update' || action === 'delete')) {
    if (!user.isOrgAdmin) return false
  }

  // Check default permissions first
  if (!hasDefaultPermission(user, resource, action)) {
    // Special case: Delegate might have subscription management rights via GP grant
    if (resource === 'subscriptions' && org.role === 'Delegate') {
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
      if (action === 'approve' && org.role !== 'Asset Manager' && org.role !== 'Delegate') {
        return false
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

export function getNavItemsForUser(user: User): NavItem[] {
  const org = getUserOrganization(user)
  if (!org) return []

  const navItems: NavItem[] = []

  // Role-specific navigation
  switch (org.role) {
    case 'Platform Admin':
      navItems.push(
        { label: 'Registry', href: '/registry', permission: { resource: 'registry', action: 'view' } },
        { label: 'Audit', href: '/audit', permission: { resource: 'audit', action: 'view' } },
      )
      break

    case 'Asset Manager':
      navItems.push(
        { label: 'Assets', href: '/assets', permission: { resource: 'assets', action: 'view' } },
        { label: 'Subscriptions', href: '/subscriptions', permission: { resource: 'subscriptions', action: 'view' } },
        { label: 'Access Grants', href: '/access-grants', permission: { resource: 'access-grants', action: 'view' } },
        { label: 'Publish Data', href: '/composer', permission: { resource: 'envelopes', action: 'publish' } },
        { label: 'History', href: '/history', permission: { resource: 'envelopes', action: 'view' } },
      )
      break

    case 'Delegate':
      // Check if delegate has GP grants (can publish)
      const hasGPGrants = mockAccessGrants.some(
        g => g.granteeId === org.id && g.status === 'Active' && g.canPublish
      )
      
      if (hasGPGrants) {
        navItems.push(
          { label: 'Subscriptions', href: '/subscriptions', permission: { resource: 'subscriptions', action: 'view' } },
          { label: 'Publish Data', href: '/composer', permission: { resource: 'envelopes', action: 'publish' } },
          { label: 'History', href: '/history', permission: { resource: 'envelopes', action: 'view' } },
        )
      }
      
      // Check if delegate has LP grants with subscription management
      const hasLPGrantsWithSubs = mockAccessGrants.some(
        g => g.granteeId === org.id && 
             g.status === 'Active' && 
             !g.canPublish &&
             g.canManageSubscriptions === true
      )
      if (hasLPGrantsWithSubs) {
        navItems.push(
          { label: 'Subscriptions', href: '/feeds', permission: { resource: 'subscriptions', action: 'view' } },
        )
      }
      
      // All delegates can see their access grants
      navItems.push(
        { label: 'Access Grants', href: '/access-grants', permission: { resource: 'access-grants', action: 'view' } },
        { label: 'Ledger', href: '/ledger', permission: { resource: 'envelopes', action: 'view' } },
      )
      break

    case 'Limited Partner':
      navItems.push(
        { label: 'Subscriptions', href: '/feeds', permission: { resource: 'subscriptions', action: 'view' } },
        { label: 'Access Grants', href: '/access-grants', permission: { resource: 'access-grants', action: 'view' } },
        { label: 'Ledger', href: '/ledger', permission: { resource: 'envelopes', action: 'view' } },
      )
      break
  }

  // Add IAM last for all org admins
  if (user.isOrgAdmin) {
    navItems.push(
      { label: 'IAM', href: '/settings/iam', permission: { resource: 'users', action: 'view' } },
    )
  }

  return navItems
}

// Filter envelopes based on user's access
export function filterEnvelopesByAccess(
  user: User,
  envelopes: Array<{ id: number; recipientId: number; assetId: number; dataType?: DataType }>
): typeof envelopes {
  const org = getUserOrganization(user)
  if (!org) return []

  switch (org.role) {
    case 'Platform Admin':
      return envelopes

    case 'Asset Manager':
      // Can see envelopes for assets they own
      const ownedAssetIds = mockAssets.filter(a => a.ownerId === org.id).map(a => a.id)
      return envelopes.filter(e => ownedAssetIds.includes(e.assetId))

    case 'Limited Partner':
      // Can see envelopes addressed to them AND where they have an active subscription
      return envelopes.filter(e => {
        // Must be addressed to this subscriber
        if (e.recipientId !== org.id) return false
        // Must have an active subscription to the asset
        return hasActiveSubscriptionSync(e.assetId, org.id)
      })

    case 'Delegate':
      // Delegates can see envelopes based on their AccessGrants
      // Get all active grants for this delegate
      const grants = mockAccessGrants.filter(
        g => g.granteeId === org.id && g.status === 'Active' && g.canViewData
      )
      
      // If no active grants, return empty array
      if (grants.length === 0) {
        return []
      }
      
      return envelopes.filter(envelope => {
        return grants.some(grant => {
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
      })

    default:
      return []
  }
}

