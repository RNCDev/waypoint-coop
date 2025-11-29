import { mockOrganizations, mockUsers, mockAssets, mockEnvelopes, mockPayloads, mockDelegations, mockSubscriptions, mockPublishingRights, mockAccessGrants } from './mock-data'
import { generateHash } from './crypto'
import { Organization, User, Asset, Envelope, Payload, Delegation, ReadReceipt, Subscription, PublishingRight, AccessGrant } from '@/types'

// In-memory storage for Vercel serverless functions
class InMemoryDB {
  organizations: Organization[]
  users: User[]
  assets: Asset[]
  envelopes: Envelope[]
  payloads: Payload[]
  // Unified AccessGrant model (replaces delegations and publishingRights)
  accessGrants: AccessGrant[]
  subscriptions: Subscription[]
  // Legacy fields (deprecated - kept for migration)
  delegations: Delegation[]
  publishingRights: PublishingRight[]
  readReceipts: ReadReceipt[]
  nextEnvelopeId: number
  nextPayloadId: number
  nextReceiptId: number

  constructor() {
    this.organizations = [...mockOrganizations]
    this.users = [...mockUsers]
    this.assets = [...mockAssets]
    // Generate hashes for envelopes
    this.envelopes = mockEnvelopes.map(env => ({
      ...env,
      hash: generateHash(env, mockPayloads.find(p => p.envelopeId === env.id)?.data || {}),
    }))
    this.payloads = [...mockPayloads]
    this.accessGrants = [...mockAccessGrants]
    this.subscriptions = [...mockSubscriptions]
    // Legacy (deprecated)
    this.delegations = [...mockDelegations]
    this.publishingRights = [...mockPublishingRights]
    this.readReceipts = []
    this.nextEnvelopeId = 10023 // Updated to match new mock data structure
    this.nextPayloadId = 22
    this.nextReceiptId = 1
  }

  reset() {
    this.organizations = [...mockOrganizations]
    this.users = [...mockUsers]
    this.assets = [...mockAssets]
    this.envelopes = mockEnvelopes.map(env => ({
      ...env,
      hash: generateHash(env, mockPayloads.find(p => p.envelopeId === env.id)?.data || {}),
    }))
    this.payloads = [...mockPayloads]
    this.accessGrants = [...mockAccessGrants]
    this.subscriptions = [...mockSubscriptions]
    // Legacy (deprecated)
    this.delegations = [...mockDelegations]
    this.publishingRights = [...mockPublishingRights]
    this.readReceipts = []
    this.nextEnvelopeId = 10023
    this.nextPayloadId = 23
    this.nextReceiptId = 1
  }
}

// Singleton instance
let dbInstance: InMemoryDB | null = null

export function getInMemoryDB(): InMemoryDB {
  if (!dbInstance) {
    dbInstance = new InMemoryDB()
  }
  return dbInstance
}

// Helper to determine if we should use in-memory DB (Vercel) or Prisma (local)
export function isVercel(): boolean {
  // On Vercel, always use in-memory DB since we can't use SQLite
  // Check for Vercel environment or if Prisma client fails to initialize
  if (process.env.VERCEL === '1' || process.env.VERCEL_ENV) {
    return true
  }
  
  // In production builds, prefer in-memory unless DATABASE_URL is explicitly set
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    return true
  }
  
  return false
}

