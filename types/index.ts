export type OrganizationType = 'Publisher' | 'Asset Owner' | 'Subscriber' | 'Delegate' | 'Platform Admin'
export type OrganizationStatus = 'Verified' | 'Pending' | 'Suspended'
export type UserRole = 'Admin' | 'Viewer' | 'Publisher' | 'Asset Owner' | 'Subscriber' | 'Auditor' | 'Restricted' | 'Analytics' | 'Tax' | 'Integration' | 'Ops' | 'Signer' | 'IR' | 'Risk' | 'Platform Admin'
export type EnvelopeStatus = 'Delivered' | 'Revoked' | 'Pending'
export type DelegationStatus = 'Active' | 'Pending GP Approval' | 'Rejected'
export type DataType = 'CAPITAL_CALL' | 'DISTRIBUTION' | 'NAV_UPDATE' | 'QUARTERLY_REPORT' | 'K-1_TAX_FORM' | 'SOI_UPDATE' | 'LEGAL_NOTICE'

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
}

export interface Asset {
  id: number
  name: string
  ownerId: number
  publisherId: number
  type: string
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
  gpApprovalStatus?: 'Pending' | 'Approved' | 'Rejected'
}

export interface ReadReceipt {
  id: number
  envelopeId: number
  userId: number
  viewedAt: string
}

