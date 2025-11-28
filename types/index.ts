export type OrganizationType = 'Publisher' | 'Asset Owner' | 'Subscriber' | 'Delegate' | 'Platform Admin'
export type OrganizationStatus = 'Verified' | 'Pending' | 'Suspended'
export type UserRole = 'Admin' | 'Viewer' | 'Publisher' | 'Asset Owner' | 'Subscriber' | 'Auditor' | 'Restricted' | 'Analytics' | 'Tax' | 'Integration' | 'Ops' | 'Signer' | 'IR' | 'Risk' | 'Platform Admin'
export type EnvelopeStatus = 'Delivered' | 'Revoked' | 'Pending'
export type DelegationStatus = 'Active' | 'Pending GP Approval' | 'Rejected'
export type DataType = 'CAPITAL_CALL' | 'DISTRIBUTION' | 'NAV_UPDATE' | 'QUARTERLY_REPORT' | 'K-1_TAX_FORM' | 'SOI_UPDATE' | 'LEGAL_NOTICE'
export type SubscriptionStatus = 'Pending LP Acceptance' | 'Active' | 'Expired' | 'Revoked' | 'Declined'
export type PublishingRightStatus = 'Active' | 'Revoked'
export type GPApprovalStatus = 'Pending' | 'Approved' | 'Rejected'

// IAM Permission types
export type Resource = 'assets' | 'subscriptions' | 'delegations' | 'envelopes' | 'users' | 'audit' | 'registry' | 'publishing-rights' | 'feeds'
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
  publisherId: number
  type: string
  requireGPApprovalForDelegations?: boolean // Whether LP delegations require GP approval
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

export interface Delegation {
  id: string
  subscriberId: number
  delegateId: number
  assetScope: number[] | 'ALL'
  typeScope: DataType[] | 'ALL'
  status: DelegationStatus
  gpApprovalRequired?: boolean // Whether GP must approve this delegation
  gpApprovalStatus?: GPApprovalStatus
  gpApprovedAt?: string // ISO 8601 timestamp of approval
  gpApprovedById?: number // User ID who approved
  createdAt?: string // ISO 8601 timestamp
}

export interface ReadReceipt {
  id: number
  envelopeId: number
  userId: number
  viewedAt: string
}

// Subscription - Which LPs can access which assets
export interface Subscription {
  id: string
  assetId: number // The asset (fund)
  subscriberId: number // The LP organization
  grantedById: number // GP or Publisher org who granted access
  grantedAt: string // ISO 8601 timestamp (when invitation sent)
  acceptedAt?: string // ISO 8601 timestamp (when LP accepted)
  expiresAt?: string // Optional expiration timestamp
  status: SubscriptionStatus
  inviteMessage?: string // Optional message from GP to LP
}

// PublishingRight - GP delegates publishing rights to Fund Admin
export interface PublishingRight {
  id: string
  assetOwnerId: number // The GP organization
  publisherId: number // The Fund Admin organization
  assetScope: number[] | 'ALL' // Asset IDs or ALL
  canManageSubscriptions: boolean // Can also manage subscriptions
  grantedAt: string // ISO 8601 timestamp
  status: PublishingRightStatus
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

