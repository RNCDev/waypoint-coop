/**
 * Contextual Organization Roles:
 * 
 * Roles are now DERIVED from relationships, not fixed per organization.
 * The same organization can play different roles depending on asset context:
 * 
 * - Asset Manager: Org manages the asset (asset.managerId === org.id)
 * - Limited Partner: Org has subscription to the asset
 * - Delegate: Org has AccessGrant for the asset
 * - Platform Admin: Special flag for Waypoint platform operators
 * 
 * Example: Franklin Park, LLC manages FP Venture XV (Asset Manager role)
 * AND invests in Costanoa Fund VI (Limited Partner role).
 * 
 * @deprecated OrganizationType is kept for backward compatibility during migration.
 * Use isPlatformAdmin flag and derived role functions instead.
 */
export type OrganizationType = 'Platform Admin' | 'Asset Manager' | 'Limited Partner' | 'Delegate'

/**
 * AssetRole - The role an organization plays for a specific asset.
 * Derived from relationships (ownership, subscription, or access grant).
 */
export type AssetRole = 'Asset Manager' | 'Limited Partner' | 'Delegate' | null

export type OrganizationStatus = 'Verified' | 'Pending' | 'Suspended'

/**
 * User roles are functional descriptions within an organization.
 * These describe what the user does (Admin, Viewer, Auditor, etc.)
 * The user's capabilities are determined by their org's contextual roles + AccessGrants.
 */
export type UserRole = 'Admin' | 'Viewer' | 'Auditor' | 'Restricted' | 'Analytics' | 'Tax' | 'Integration' | 'Ops' | 'Signer' | 'IR' | 'Risk' | 'Platform Admin' | 'Legal' | 'Delegate' | 'Asset Manager' | 'Limited Partner'
export type EnvelopeStatus = 'Delivered' | 'Revoked' | 'Pending'
export type DataType = 'CAPITAL_CALL' | 'DISTRIBUTION' | 'NAV_UPDATE' | 'QUARTERLY_REPORT' | 'K-1_TAX_FORM' | 'SOI_UPDATE' | 'LEGAL_NOTICE'
export type SubscriptionStatus = 'Pending LP Acceptance' | 'Pending Asset Manager Approval' | 'Active' | 'Expired' | 'Revoked' | 'Declined'
export type AccessGrantStatus = 'Active' | 'Revoked' | 'Pending Approval'
export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected'

// IAM Permission types
// Note: 'delegations' and 'publishing-rights' are deprecated aliases for 'access-grants'
export type Resource = 'assets' | 'subscriptions' | 'access-grants' | 'delegations' | 'publishing-rights' | 'envelopes' | 'users' | 'audit' | 'registry' | 'feeds'
export type Action = 'view' | 'create' | 'update' | 'delete' | 'publish' | 'approve'

export interface Organization {
  id: number
  name: string
  /**
   * @deprecated Role is now derived from relationships (asset ownership, subscriptions, grants).
   * Kept for backward compatibility during migration. Use isPlatformAdmin and role derivation functions.
   */
  role?: OrganizationType
  /** Descriptive type: "General Partner (GP)", "Pension Fund", "Fund Administrator", etc. */
  type: string
  status: OrganizationStatus
  /** Only true for Waypoint Platform - the platform operator */
  isPlatformAdmin?: boolean
  imageUrl?: string
}

/**
 * OrganizationContext - All the roles an organization plays across assets.
 * An organization can simultaneously be:
 * - Asset Manager for some assets (they own/manage them)
 * - Limited Partner in other assets (they've subscribed)
 * - Delegate for other assets (they've received access grants)
 */
export interface OrganizationContext {
  /** Assets this org manages (asset.managerId === org.id) */
  assetManagerFor: Asset[]
  /** Assets this org is subscribed to as LP */
  limitedPartnerIn: Asset[]
  /** Access grants this org has received */
  delegateFor: AccessGrant[]
}

/**
 * AssetContext - The role an organization plays for a specific asset.
 */
export interface AssetContext {
  assetId: number
  role: AssetRole
}

export interface User {
  id: number
  name: string
  email: string
  orgId: number
  role: UserRole
  isOrgAdmin?: boolean // Can manage users within their org
}

export interface Asset {
  id: number
  name: string
  ownerId: number
  /** Primary publisher for display purposes. Actual publishing rights are managed via PublishingRight. */
  defaultPublisherId: number
  type: string
  /** Whether LP delegations require GP approval for this asset */
  requireGPApprovalForDelegations?: boolean
}

export interface Envelope {
  id: number
  publisherId: number
  userId: number
  assetOwnerId: number
  assetId: number
  recipientId: number  // Single recipient (LP) ID - one envelope per LP
  timestamp: string
  version: number
  status: EnvelopeStatus
  hash: string
  dataType?: DataType
  period?: string
}

export interface Payload {
  id: number
  envelopeId: number
  data: any // JSON blob
}

/**
 * AccessGrant - Unified model for delegated capabilities
 * 
 * This represents an "edge" in the permission graph where a grantor
 * (Asset Manager or Limited Partner) grants capabilities to a grantee (Delegate).
 * 
 * GP grants (canPublish=true): Enable publishing and management capabilities
 * LP grants (canPublish=false): Enable data viewing and subscription management
 */
export interface AccessGrant {
  id: string
  
  // THE EDGE
  /** Asset Manager OR Limited Partner org granting capabilities */
  grantorId: number
  /** Always a Delegate org receiving capabilities */
  granteeId: number
  
  // SCOPE
  /** Asset IDs this grant applies to, or 'ALL' for all assets */
  assetScope: number[] | 'ALL'
  /** Data types this grant applies to, or 'ALL' for all types */
  dataTypeScope: DataType[] | 'ALL'
  
  // CAPABILITIES
  /** Can send/publish envelopes (GP grants only) */
  canPublish: boolean
  /** Can view data envelopes */
  canViewData: boolean
  /** GP: create/revoke subscriptions | LP: accept/request for LP */
  canManageSubscriptions: boolean
  /** Can approve LP-initiated subscription requests (GP grants only) */
  canApproveSubscriptions: boolean
  /** Can approve LP→Delegate grants (GP grants only) */
  canApproveDelegations: boolean
  
  // APPROVAL WORKFLOW (for LP grants requiring GP approval)
  /** Whether this grant requires GP approval to become active */
  requiresApproval: boolean
  /** Approval status when requiresApproval is true */
  approvalStatus: ApprovalStatus | null
  /** User ID who approved this grant */
  approvedById: number | null
  /** ISO 8601 timestamp of approval */
  approvedAt: string | null
  
  // METADATA
  status: AccessGrantStatus
  /** ISO 8601 timestamp when grant was created */
  grantedAt: string
}

/**
 * @deprecated Use AccessGrant instead. Delegation is now a subset of AccessGrant where canPublish=false.
 */
export interface Delegation {
  id: string
  subscriberId: number
  delegateId: number
  assetScope: number[] | 'ALL'
  typeScope: DataType[] | 'ALL'
  status: 'Active' | 'Pending GP Approval' | 'Rejected'
  gpApprovalRequired?: boolean
  gpApprovalStatus?: ApprovalStatus
  gpApprovedAt?: string
  gpApprovedById?: number
  canManageSubscriptions?: boolean
  createdAt?: string
}

export interface ReadReceipt {
  id: number
  envelopeId: number
  userId: number
  viewedAt: string
}

// Subscription - Which Limited Partners can access which assets
export interface Subscription {
  id: string
  assetId: number // The asset (fund)
  subscriberId: number // The Limited Partner organization
  grantedById: number // Asset Manager or Delegate org who granted access
  grantedAt: string // ISO 8601 timestamp (when invitation sent)
  acceptedAt?: string // ISO 8601 timestamp (when LP accepted)
  expiresAt?: string // Optional expiration timestamp
  status: SubscriptionStatus
  inviteMessage?: string // Optional message from GP to LP
  requestMessage?: string // Optional message from LP to GP when requesting subscription
}

/**
 * @deprecated Use AccessGrant instead. PublishingRight is now a subset of AccessGrant where canPublish=true.
 */
export interface PublishingRight {
  id: string
  assetOwnerId: number
  publisherId: number
  assetScope: number[] | 'ALL'
  canManageSubscriptions: boolean
  canApproveSubscriptions: boolean
  canApproveDelegations: boolean
  canViewData: boolean
  grantedAt: string
  status: 'Active' | 'Revoked'
}

// Permission - Fine-grained permissions per user
export interface Permission {
  id: string
  userId: number
  resource: Resource
  action: Action
  scope: PermissionScope
}

// Permission scope defines the boundaries of the permission
export interface PermissionScope {
  orgId?: number // Limit to specific org
  assetIds?: number[] // Limit to specific assets
  all?: boolean // Full access
}

