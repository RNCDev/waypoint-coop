import { describe, it, expect } from 'vitest'
import { generateHash, verifyHash } from '../crypto'
import { Envelope, Payload } from '@/types'

describe('crypto utilities', () => {
  describe('generateHash', () => {
    it('should generate a consistent hash for the same input', () => {
      const envelope = {
        id: 1,
        publisherId: 100,
        userId: 500,
        assetOwnerId: 200,
        assetId: 300,
        recipientId: 400,
        timestamp: '2024-01-01T00:00:00Z',
        version: 1,
        status: 'Delivered' as const,
        dataType: 'CAPITAL_CALL' as const,
      }

      const payload = { amount: 1000, currency: 'USD' }

      const hash1 = generateHash(envelope, payload)
      const hash2 = generateHash(envelope, payload)

      expect(hash1).toBe(hash2)
      expect(hash1).toBeTruthy()
      expect(typeof hash1).toBe('string')
      expect(hash1.length).toBe(64)
    })

    it('should generate different hashes for different envelopes', () => {
      const envelope1 = {
        id: 1,
        publisherId: 100,
        userId: 500,
        assetOwnerId: 200,
        assetId: 300,
        recipientId: 400,
        timestamp: '2024-01-01T00:00:00Z',
        version: 1,
        status: 'Delivered' as const,
      }

      const envelope2 = {
        id: 2,
        publisherId: 100,
        userId: 500,
        assetOwnerId: 200,
        assetId: 300,
        recipientId: 400,
        timestamp: '2024-01-01T00:00:00Z',
        version: 1,
        status: 'Delivered' as const,
      }

      const payload = { amount: 1000 }

      const hash1 = generateHash(envelope1, payload)
      const hash2 = generateHash(envelope2, payload)

      expect(hash1).not.toBe(hash2)
    })

    it('should generate different hashes for different payloads', () => {
      const envelope = {
        id: 1,
        publisherId: 100,
        userId: 500,
        assetOwnerId: 200,
        assetId: 300,
        recipientId: 400,
        timestamp: '2024-01-01T00:00:00Z',
        version: 1,
        status: 'Delivered' as const,
      }

      const payload1 = { amount: 1000 }
      const payload2 = { amount: 2000 }

      const hash1 = generateHash(envelope, payload1)
      const hash2 = generateHash(envelope, payload2)

      expect(hash1).not.toBe(hash2)
    })

    it('should handle complex nested payload data', () => {
      const envelope = {
        id: 1,
        publisherId: 100,
        userId: 500,
        assetOwnerId: 200,
        assetId: 300,
        recipientId: 400,
        timestamp: '2024-01-01T00:00:00Z',
        version: 1,
        status: 'Delivered' as const,
      }

      const payload = {
        line_items: [
          { lp_id: 400, amount: 1000 },
          { lp_id: 401, amount: 2000 },
        ],
        metadata: {
          currency: 'USD',
          bank_details: { account: '12345' },
        },
      }

      const hash = generateHash(envelope, payload)

      expect(hash).toBeTruthy()
      expect(typeof hash).toBe('string')
      expect(hash.length).toBe(64)
    })
  })

  describe('verifyHash', () => {
    it('should verify a correct hash', () => {
      const envelopeWithoutHash = {
        id: 1,
        publisherId: 100,
        userId: 500,
        assetOwnerId: 200,
        assetId: 300,
        recipientId: 400,
        timestamp: '2024-01-01T00:00:00Z',
        version: 1,
        status: 'Delivered' as const,
        dataType: 'CAPITAL_CALL' as const,
      }

      const payload = { amount: 1000, currency: 'USD' }
      const hash = generateHash(envelopeWithoutHash, payload)

      const envelope: Envelope = { ...envelopeWithoutHash, hash }

      const isValid = verifyHash(envelope, payload, hash)
      expect(isValid).toBe(true)
    })

    it('should reject an incorrect hash', () => {
      const envelope: Envelope = {
        id: 1,
        publisherId: 100,
        userId: 500,
        assetOwnerId: 200,
        assetId: 300,
        recipientId: 400,
        timestamp: '2024-01-01T00:00:00Z',
        version: 1,
        status: 'Delivered',
        hash: 'incorrect_hash_value',
      }

      const payload = { amount: 1000 }

      const isValid = verifyHash(envelope, payload, 'incorrect_hash_value')
      expect(isValid).toBe(false)
    })

    it('should reject when payload has been tampered with', () => {
      const envelopeWithoutHash = {
        id: 1,
        publisherId: 100,
        userId: 500,
        assetOwnerId: 200,
        assetId: 300,
        recipientId: 400,
        timestamp: '2024-01-01T00:00:00Z',
        version: 1,
        status: 'Delivered' as const,
      }

      const originalPayload = { amount: 1000 }
      const hash = generateHash(envelopeWithoutHash, originalPayload)

      const envelope: Envelope = { ...envelopeWithoutHash, hash }
      const tamperedPayload = { amount: 2000 }

      const isValid = verifyHash(envelope, tamperedPayload, hash)
      expect(isValid).toBe(false)
    })

    it('should reject when envelope has been tampered with', () => {
      const originalEnvelope = {
        id: 1,
        publisherId: 100,
        userId: 500,
        assetOwnerId: 200,
        assetId: 300,
        recipientId: 400,
        timestamp: '2024-01-01T00:00:00Z',
        version: 1,
        status: 'Delivered' as const,
      }

      const payload = { amount: 1000 }
      const hash = generateHash(originalEnvelope, payload)

      const tamperedEnvelope: Envelope = {
        ...originalEnvelope,
        recipientId: 999,
        hash,
      }

      const isValid = verifyHash(tamperedEnvelope, payload, hash)
      expect(isValid).toBe(false)
    })
  })
})
