import { Envelope, Payload } from '@/types'

/**
 * Generate a SHA-256 hash of the envelope + payload combination
 * This simulates cryptographic signing for Phase 1
 */
export function generateHash(envelope: Omit<Envelope, 'hash'> | Partial<Envelope>, payload: Payload['data']): string {
  const crypto = require('crypto')
  const combined = JSON.stringify({ envelope, payload })
  return crypto.createHash('sha256').update(combined).digest('hex')
}

/**
 * Verify that a hash matches the envelope + payload combination
 */
export function verifyHash(envelope: Envelope, payload: Payload['data'], hash: string): boolean {
  const { hash: _, ...envelopeWithoutHash } = envelope
  const computedHash = generateHash(envelopeWithoutHash, payload)
  return computedHash === hash
}

