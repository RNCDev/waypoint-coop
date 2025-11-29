import { createHash } from 'crypto'

/**
 * Generate a SHA-256 hash of the given data
 * Used for data integrity verification in envelopes
 */
export function generateHash(data: object | string): string {
  const content = typeof data === 'string' ? data : JSON.stringify(data)
  return createHash('sha256').update(content).digest('hex')
}

/**
 * Verify that the given hash matches the data
 */
export function verifyHash(data: object | string, hash: string): boolean {
  return generateHash(data) === hash
}

/**
 * Generate a short hash for display purposes (first 8 characters)
 */
export function shortHash(hash: string): string {
  return hash.slice(0, 8)
}

