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
      // Publisher can see assets they have publishing rights for
      const publisherRights = mockPublishingRights.filter(
        pr => pr.publisherId === org.id && pr.status === 'Active'
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

// Get delegations that need GP approval for a given asset owner
export function getDelegationsRequiringApproval(user: User): Delegation[] {
  const org = getUserOrganization(user)
  if (!org) return []

  if (org.role !== 'Asset Owner' && org.role !== 'Platform Admin') {
    return []
  }

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
      // Delegate can see delegations granted to them
      return mockDelegations.filter(d => d.delegateId === org.id && d.status === 'Active')

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
        { label: 'Subscriptions', href: '/subscriptions', permission: { resource: 'subscriptions', action: 'view' } },
        { label: 'Publishing Rights', href: '/publishing-rights', permission: { resource: 'publishing-rights', action: 'view' } },
        { label: 'Delegation Approvals', href: '/delegations/approvals', permission: { resource: 'delegations', action: 'approve' } },
      )
      break

    case 'Publisher':
      navItems.push(
        { label: 'Composer', href: '/composer', permission: { resource: 'envelopes', action: 'publish' } },
        { label: 'History', href: '/history', permission: { resource: 'envelopes', action: 'view' } },
      )
      // Add subscriptions if they have management rights
      const manageableSubs = getManageableSubscriptions(user)
      if (manageableSubs.length > 0) {
        navItems.push(
          { label: 'Subscriptions', href: '/subscriptions', permission: { resource: 'subscriptions', action: 'view' } },
        )
      }
      break

    case 'Subscriber':
      navItems.push(
        { label: 'My Feeds', href: '/feeds', permission: { resource: 'subscriptions', action: 'view' } },
        { label: 'Ledger', href: '/ledger', permission: { resource: 'envelopes', action: 'view' } },
        { label: 'Delegations', href: '/delegations', permission: { resource: 'delegations', action: 'view' } },
      )
      break

    case 'Delegate':
      navItems.push(
        { label: 'Ledger', href: '/ledger', permission: { resource: 'envelopes', action: 'view' } },
      )
      break
  }

  // Add Settings for org admins
  if (user.isOrgAdmin) {
    navItems.push(
      { label: 'Settings', href: '/settings/iam', permission: { resource: 'users', action: 'view' } },
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
      // Can see envelopes for assets they publish for
      const accessibleAssets = getAccessibleAssets(user)
      const accessibleAssetIds = accessibleAssets.map(a => a.id)
      return envelopes.filter(e => accessibleAssetIds.includes(e.assetId))

    case 'Subscriber':
      // Can see envelopes addressed to them
      return envelopes.filter(e => e.recipientId === org.id)

    case 'Delegate':
      // Can see envelopes based on their delegations
      const delegations = mockDelegations.filter(
        d => d.delegateId === org.id && d.status === 'Active'
      )
      
      return envelopes.filter(envelope => {
        return delegations.some(d => {
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

          // Check recipient matches subscriber
          const recipientMatch = envelope.recipientId === d.subscriberId

          return assetMatch && typeMatch && recipientMatch
        })
      })

    default:
      return []
  }
}

