import { User, Organization, Asset, Delegation, Subscription, PublishingRight, Resource, Action, Permission, PermissionScope, DataType } from '@/types'
import { mockOrganizations, mockAssets, mockDelegations, mockSubscriptions, mockPublishingRights } from '@/lib/mock-data'

// Default permissions by organization role
export const DEFAULT_PERMISSIONS: Record<string, Partial<Record<Resource, Action[]>>> = {
  'Platform Admin': {
    registry: ['view', 'create', 'update', 'delete'],
    audit: ['view'],
    users: ['view', 'create', 'update', 'delete'],
  },
  'Asset Owner': {
    assets: ['view', 'create', 'update'],
    subscriptions: ['view', 'create', 'update', 'delete'],
    delegations: ['view', 'approve'],
    envelopes: ['view'],
    'publishing-rights': ['view', 'create', 'update', 'delete'],
    users: ['view', 'create', 'update', 'delete'],
  },
  'Publisher': {
    envelopes: ['view', 'create', 'publish'],
    assets: ['view'],
    users: ['view', 'create', 'update', 'delete'],
    // subscriptions permission is conditional on PublishingRight.canManageSubscriptions
  },
  'Subscriber': {
    feeds: ['view', 'update'], // View invitations and accept/decline
    subscriptions: ['view'], // View their own subscriptions
    envelopes: ['view'],
    delegations: ['view', 'create', 'update', 'delete'],
    users: ['view', 'create', 'update', 'delete'],
  },
  'Delegate': {
    envelopes: ['view'], // Scoped by delegation
    users: ['view', 'create', 'update', 'delete'],
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

// Check if publisher can manage subscriptions for a specific asset owner
export function canPublisherManageSubscriptions(publisherOrgId: number, assetOwnerId: number): boolean {
  const publishingRight = mockPublishingRights.find(
    pr => pr.publisherId === publisherOrgId && 
         pr.assetOwnerId === assetOwnerId && 
         pr.status === 'Active' &&
         pr.canManageSubscriptions
  )
  return !!publishingRight
}

// Get assets that a user can access
export function getAccessibleAssets(user: User): Asset[] {
  const org = getUserOrganization(user)
  if (!org) return []

  switch (org.role) {
    case 'Platform Admin':
      // Platform admin can see all assets
      return mockAssets

    case 'Asset Owner':
      // Asset owner can see assets they own
      return mockAssets.filter(a => a.ownerId === org.id)

    case 'Publisher':
      // Publisher can see assets they have publishing rights for AND canViewData = true
      const publisherRights = mockPublishingRights.filter(
        pr => pr.publisherId === org.id && pr.status === 'Active' && pr.canViewData === true
      )
      return mockAssets.filter(asset => {
        return publisherRights.some(pr => {
          if (pr.assetScope === 'ALL') {
            return asset.ownerId === pr.assetOwnerId
          }
          return (pr.assetScope as number[]).includes(asset.id)
        })
      })

    case 'Subscriber':
      // Subscriber can see assets they have subscriptions for
      const subscriptions = mockSubscriptions.filter(
        s => s.subscriberId === org.id && s.status === 'Active'
      )
      return mockAssets.filter(asset => 
        subscriptions.some(s => s.assetId === asset.id)
      )

    case 'Delegate':
      // Delegate can see assets they have delegations for
      const delegations = mockDelegations.filter(
        d => d.delegateId === org.id && d.status === 'Active'
      )
      const delegatedAssetIds = new Set<number>()
      delegations.forEach(d => {
        if (d.assetScope === 'ALL') {
          // Get all assets the subscriber has access to
          const subSubscriptions = mockSubscriptions.filter(
            s => s.subscriberId === d.subscriberId && s.status === 'Active'
          )
          subSubscriptions.forEach(s => delegatedAssetIds.add(s.assetId))
        } else {
          (d.assetScope as number[]).forEach(id => delegatedAssetIds.add(id))
        }
      })
      return mockAssets.filter(asset => delegatedAssetIds.has(asset.id))

    default:
      return []
  }
}

// Get subscriptions that a user can view (for Publishers, includes all assets they have publishing rights to)
export function getViewableSubscriptions(user: User): Subscription[] {
  const org = getUserOrganization(user)
  if (!org) return []

  switch (org.role) {
    case 'Platform Admin':
      return mockSubscriptions

    case 'Asset Owner':
      // Asset owner can view subscriptions for their assets
      const ownedAssetIds = mockAssets.filter(a => a.ownerId === org.id).map(a => a.id)
      return mockSubscriptions.filter(s => ownedAssetIds.includes(s.assetId))

    case 'Publisher':
      // Publisher can view subscriptions for assets they have publishing rights to
      const publisherRights = mockPublishingRights.filter(
        pr => pr.publisherId === org.id && pr.status === 'Active'
      )
      if (publisherRights.length === 0) return []
      
      // Get assets from those publishing rights
      const viewableAssetIds = new Set<number>()
      publisherRights.forEach(pr => {
        if (pr.assetScope === 'ALL') {
          mockAssets.filter(a => a.ownerId === pr.assetOwnerId).forEach(a => viewableAssetIds.add(a.id))
        } else {
          (pr.assetScope as number[]).forEach(id => viewableAssetIds.add(id))
        }
      })
      return mockSubscriptions.filter(s => viewableAssetIds.has(s.assetId))

    case 'Subscriber':
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

    case 'Asset Owner':
      // Asset owner can manage subscriptions for their assets
      const ownedAssetIds = mockAssets.filter(a => a.ownerId === org.id).map(a => a.id)
      return mockSubscriptions.filter(s => ownedAssetIds.includes(s.assetId))

    case 'Publisher':
      // Publisher can manage subscriptions if granted that right
      const publisherRights = mockPublishingRights.filter(
        pr => pr.publisherId === org.id && pr.status === 'Active' && pr.canManageSubscriptions
      )
      if (publisherRights.length === 0) return []
      
      // Get assets from those publishing rights
      const manageableAssetIds = new Set<number>()
      publisherRights.forEach(pr => {
        if (pr.assetScope === 'ALL') {
          mockAssets.filter(a => a.ownerId === pr.assetOwnerId).forEach(a => manageableAssetIds.add(a.id))
        } else {
          (pr.assetScope as number[]).forEach(id => manageableAssetIds.add(id))
        }
      })
      return mockSubscriptions.filter(s => manageableAssetIds.has(s.assetId))

    case 'Subscriber':
      // Subscriber can only view their own subscriptions, not manage
      return mockSubscriptions.filter(s => s.subscriberId === org.id)

    default:
      return []
  }
}

// Get publishing rights that a user can manage (only Asset Owners)
export function getManageablePublishingRights(user: User): PublishingRight[] {
  const org = getUserOrganization(user)
  if (!org) return []

  if (org.role === 'Platform Admin') {
    return mockPublishingRights
  }

  if (org.role === 'Asset Owner') {
    return mockPublishingRights.filter(pr => pr.assetOwnerId === org.id)
  }

  if (org.role === 'Publisher') {
    // Publishers can view their own publishing rights
    return mockPublishingRights.filter(pr => pr.publisherId === org.id)
  }

  return []
}

// Get delegations that need GP approval for a given user (Asset Owner or Publisher with approval rights)
export function getDelegationsRequiringApproval(user: User): Delegation[] {
  const org = getUserOrganization(user)
  if (!org) return []

  // Asset Owners and Platform Admins can approve all delegations for their assets
  if (org.role === 'Asset Owner' || org.role === 'Platform Admin') {
    // Get all assets owned by this GP
    const ownedAssetIds = mockAssets.filter(a => a.ownerId === org.id).map(a => a.id)
    
    // Find delegations that need approval and involve assets this GP owns
    return mockDelegations.filter(d => {
      if (d.status !== 'Pending GP Approval' || d.gpApprovalStatus !== 'Pending') {
        return false
      }
      
      // Check if the delegation involves any assets owned by this GP
      if (d.assetScope === 'ALL') {
        // Check if subscriber has subscriptions to GP's assets
        const subSubscriptions = mockSubscriptions.filter(
          s => s.subscriberId === d.subscriberId && s.status === 'Active'
        )
        return subSubscriptions.some(s => ownedAssetIds.includes(s.assetId))
      }
      
      return (d.assetScope as number[]).some(id => ownedAssetIds.includes(id))
    })
  }

  // Publishers can approve if they have canApproveDelegations = true
  if (org.role === 'Publisher') {
    // Get publishing rights with canApproveDelegations
    const approvalRights = mockPublishingRights.filter(
      pr => pr.publisherId === org.id && 
            pr.status === 'Active' && 
            pr.canApproveDelegations === true
    )
    
    if (approvalRights.length === 0) {
      return []
    }

    // Get asset IDs this publisher can approve delegations for
    const approvableAssetIds = new Set<number>()
    approvalRights.forEach(pr => {
      if (pr.assetScope === 'ALL') {
        // Get all assets owned by the asset owner
        mockAssets.filter(a => a.ownerId === pr.assetOwnerId).forEach(a => approvableAssetIds.add(a.id))
      } else {
        (pr.assetScope as number[]).forEach(id => approvableAssetIds.add(id))
      }
    })

    // Find delegations that need approval and involve assets this publisher can approve
    return mockDelegations.filter(d => {
      if (d.status !== 'Pending GP Approval' || d.gpApprovalStatus !== 'Pending') {
        return false
      }
      
      // Check if the delegation involves any assets this publisher can approve
      if (d.assetScope === 'ALL') {
        // Check if subscriber has subscriptions to approvable assets
        const subSubscriptions = mockSubscriptions.filter(
          s => s.subscriberId === d.subscriberId && s.status === 'Active'
        )
        return subSubscriptions.some(s => approvableAssetIds.has(s.assetId))
      }
      
      return (d.assetScope as number[]).some(id => approvableAssetIds.has(id))
    })
  }

  return []
}

// Check if a user can approve a specific delegation
export function canApproveDelegation(user: User, delegation: Delegation): boolean {
  const org = getUserOrganization(user)
  if (!org) return false

  // Platform Admins can approve all delegations
  if (org.role === 'Platform Admin') {
    return true
  }

  // Asset Owners can approve delegations for their assets
  if (org.role === 'Asset Owner') {
    // Get all assets owned by this GP
    const ownedAssetIds = mockAssets.filter(a => a.ownerId === org.id).map(a => a.id)
    
    // Check if the delegation involves any assets owned by this GP
    if (delegation.assetScope === 'ALL') {
      // Check if subscriber has subscriptions to GP's assets
      const subSubscriptions = mockSubscriptions.filter(
        s => s.subscriberId === delegation.subscriberId && s.status === 'Active'
      )
      return subSubscriptions.some(s => ownedAssetIds.includes(s.assetId))
    }
    
    return (delegation.assetScope as number[]).some(id => ownedAssetIds.includes(id))
  }

  // Publishers can approve if they have canApproveDelegations = true
  if (org.role === 'Publisher') {
    // Get publishing rights with canApproveDelegations
    const approvalRights = mockPublishingRights.filter(
      pr => pr.publisherId === org.id && 
            pr.status === 'Active' && 
            pr.canApproveDelegations === true
    )
    
    if (approvalRights.length === 0) {
      return false
    }

    // Get asset IDs this publisher can approve delegations for
    const approvableAssetIds = new Set<number>()
    approvalRights.forEach(pr => {
      if (pr.assetScope === 'ALL') {
        // Get all assets owned by the asset owner
        mockAssets.filter(a => a.ownerId === pr.assetOwnerId).forEach(a => approvableAssetIds.add(a.id))
      } else {
        (pr.assetScope as number[]).forEach(id => approvableAssetIds.add(id))
      }
    })

    // Check if the delegation involves any assets this publisher can approve
    if (delegation.assetScope === 'ALL') {
      // Check if subscriber has subscriptions to approvable assets
      const subSubscriptions = mockSubscriptions.filter(
        s => s.subscriberId === delegation.subscriberId && s.status === 'Active'
      )
      return subSubscriptions.some(s => approvableAssetIds.has(s.assetId))
    }
    
    return (delegation.assetScope as number[]).some(id => approvableAssetIds.has(id))
  }

  return false
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
  if (org.role === 'Subscriber' && org.id === subscriberId) {
    return true
  }

  // Delegate can manage subscriptions if they have an active delegation with canManageSubscriptions = true
  if (org.role === 'Delegate') {
    const delegations = mockDelegations.filter(
      d => d.delegateId === org.id && 
           d.subscriberId === subscriberId && 
           d.status === 'Active' &&
           d.canManageSubscriptions === true
    )
    return delegations.length > 0
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
  if (org.role === 'Subscriber') {
    return mockSubscriptions.filter(s => s.subscriberId === org.id)
  }

  // Delegate can manage subscriptions for subscribers they have delegation from
  if (org.role === 'Delegate') {
    const delegations = mockDelegations.filter(
      d => d.delegateId === org.id && 
           d.status === 'Active' &&
           d.canManageSubscriptions === true
    )
    
    if (delegations.length === 0) return []

    // Get subscriber IDs from delegations
    const subscriberIds = new Set(delegations.map(d => d.subscriberId))
    
    // Return subscriptions for those subscribers
    return mockSubscriptions.filter(s => subscriberIds.has(s.subscriberId))
  }

  return []
}

// Check if a subscriber has a subscription that allows publishing (Pending LP Acceptance, Pending Asset Owner Approval, or Active)
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
           (s.status === 'Active' || s.status === 'Pending LP Acceptance' || s.status === 'Pending Asset Owner Approval')
    )
  } else {
    // Use Prisma for local development
    const { prisma } = await import('@/lib/prisma')
    const subscription = await prisma.subscription.findFirst({
      where: {
        assetId,
        subscriberId,
        status: {
          in: ['Active', 'Pending LP Acceptance', 'Pending Asset Owner Approval'],
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

// Get delegations that a user can view/manage
export function getAccessibleDelegations(user: User): Delegation[] {
  const org = getUserOrganization(user)
  if (!org) return []

  switch (org.role) {
    case 'Platform Admin':
      return mockDelegations

    case 'Asset Owner':
      // Asset owner can see delegations that involve their assets (for approval)
      const ownedAssetIds = mockAssets.filter(a => a.ownerId === org.id).map(a => a.id)
      return mockDelegations.filter(d => {
        if (d.assetScope === 'ALL') {
          const subSubscriptions = mockSubscriptions.filter(
            s => s.subscriberId === d.subscriberId && s.status === 'Active'
          )
          return subSubscriptions.some(s => ownedAssetIds.includes(s.assetId))
        }
        return (d.assetScope as number[]).some(id => ownedAssetIds.includes(id))
      })

    case 'Subscriber':
      // Subscriber can see their own delegations
      return mockDelegations.filter(d => d.subscriberId === org.id)

    case 'Delegate':
      // Delegate can see delegations granted to them (approved or pending)
      return mockDelegations.filter(d => 
        d.delegateId === org.id && 
        (d.status === 'Active' || d.status === 'Pending GP Approval')
      )

    default:
      return []
  }
}

// Check if user can access a specific resource with a specific action
export function canAccess(
  user: User,
  resource: Resource,
  action: Action,
  context?: { assetId?: number; delegationId?: string; subscriptionId?: string }
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
    // Special case: Publisher might have subscription management rights
    if (resource === 'subscriptions' && org.role === 'Publisher') {
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

    case 'delegations':
      if (action === 'approve' && org.role !== 'Asset Owner') {
        return false
      }
      if (context?.delegationId) {
        const accessibleDelegations = getAccessibleDelegations(user)
        return accessibleDelegations.some(d => d.id === context.delegationId)
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
  { label: 'Publishing Rights', href: '/publishing-rights', permission: { resource: 'publishing-rights', action: 'view' } },
  { label: 'Ledger', href: '/ledger', permission: { resource: 'envelopes', action: 'view' } },
  { label: 'Delegations', href: '/delegations', permission: { resource: 'delegations', action: 'view' } },
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

    case 'Asset Owner':
      navItems.push(
        { label: 'Assets', href: '/assets', permission: { resource: 'assets', action: 'view' } },
        { label: 'Subscriptions', href: '/subscriptions', permission: { resource: 'subscriptions', action: 'view' } },
        { label: 'Delegations', href: '/data-rights', permission: { resource: 'publishing-rights', action: 'view' } },
        { label: 'Publish Data', href: '/composer', permission: { resource: 'envelopes', action: 'publish' } },
        { label: 'History', href: '/history', permission: { resource: 'envelopes', action: 'view' } },
      )
      break

    case 'Publisher':
      navItems.push(
        { label: 'Subscriptions', href: '/subscriptions', permission: { resource: 'subscriptions', action: 'view' } },
        { label: 'Publish Data', href: '/composer', permission: { resource: 'envelopes', action: 'publish' } },
        { label: 'History', href: '/history', permission: { resource: 'envelopes', action: 'view' } },
      )
      break

    case 'Subscriber':
      navItems.push(
        { label: 'Subscriptions', href: '/feeds', permission: { resource: 'subscriptions', action: 'view' } },
        { label: 'Delegations', href: '/delegations', permission: { resource: 'delegations', action: 'view' } },
        { label: 'Ledger', href: '/ledger', permission: { resource: 'envelopes', action: 'view' } },
      )
      break

    case 'Delegate':
      // Add Subscriptions if delegate can request or accept subscriptions
      // Check if delegate has any delegation (active or pending) with canManageSubscriptions = true
      const hasSubscriptionPermission = mockDelegations.some(
        d => d.delegateId === org.id && 
             (d.status === 'Active' || d.status === 'Pending GP Approval') &&
             d.canManageSubscriptions === true
      )
      if (hasSubscriptionPermission) {
        navItems.push(
          { label: 'Subscriptions', href: '/feeds', permission: { resource: 'subscriptions', action: 'view' } },
        )
      }
      // Add Delegations - delegates should see their delegations
      navItems.push(
        { label: 'Delegations', href: '/delegations', permission: { resource: 'delegations', action: 'view' } },
      )
      navItems.push(
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

    case 'Asset Owner':
      // Can see envelopes for assets they own
      const ownedAssetIds = mockAssets.filter(a => a.ownerId === org.id).map(a => a.id)
      return envelopes.filter(e => ownedAssetIds.includes(e.assetId))

    case 'Publisher':
      // Can see envelopes for assets they have view access to (canViewData = true)
      const accessibleAssets = getAccessibleAssets(user)
      const accessibleAssetIds = accessibleAssets.map(a => a.id)
      return envelopes.filter(e => accessibleAssetIds.includes(e.assetId))

    case 'Subscriber':
      // Can see envelopes addressed to them AND where they have an active subscription
      return envelopes.filter(e => {
        // Must be addressed to this subscriber
        if (e.recipientId !== org.id) return false
        // Must have an active subscription to the asset
        return hasActiveSubscriptionSync(e.assetId, org.id)
      })

    case 'Delegate':
      // Can see envelopes based on their delegations
      // Only Active delegations grant access to envelopes
      const delegations = mockDelegations.filter(
        d => d.delegateId === org.id && d.status === 'Active'
      )
      
      // If no active delegations, return empty array
      if (delegations.length === 0) {
        return []
      }
      
      return envelopes.filter(envelope => {
        return delegations.some(d => {
          // Check recipient matches subscriber FIRST - this is the most restrictive check
          if (envelope.recipientId !== d.subscriberId) {
            return false
          }

          // Check asset scope
          let assetMatch = false
          if (d.assetScope === 'ALL') {
            // Check if envelope is for subscriber's subscribed assets
            const subSubscriptions = mockSubscriptions.filter(
              s => s.subscriberId === d.subscriberId && s.status === 'Active'
            )
            assetMatch = subSubscriptions.some(s => s.assetId === envelope.assetId)
          } else {
            assetMatch = (d.assetScope as number[]).includes(envelope.assetId)
          }

          // Check type scope
          let typeMatch = false
          if (d.typeScope === 'ALL') {
            typeMatch = true
          } else if (envelope.dataType) {
            typeMatch = (d.typeScope as DataType[]).includes(envelope.dataType)
          }

          // All three conditions must be true
          return assetMatch && typeMatch
        })
      })

    default:
      return []
  }
}

