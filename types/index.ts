/**
 * Core Organization Roles:
 * - Platform Admin: Waypoint platform operators
 * - Asset Manager: General Partners (GPs) who own and manage funds
 * - Limited Partner: LPs who subscribe to fund data
 * - Delegate: All other organizations (Fund Admins, Auditors, Analytics, Legal, Tax, etc.)
 * 
 * Note: "Delegate" is the universal role for any organization receiving delegated capabilities.
 * What they can do (publish, view, manage subscriptions, etc.) is determined by AccessGrant.
 */
export type OrganizationType = 'Platform Admin' | 'Asset Manager' | 'Limited Partner' | 'Delegate'
export type OrganizationStatus = 'Verified' | 'Pending' | 'Suspended'
/**
 * User roles are functional descriptions within an organization.
 * The organization's role (Asset Manager, Limited Partner, Delegate) determines base capabilities.
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
  role: OrganizationType
  type: string
  status: OrganizationStatus
  imageUrl?: string
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

