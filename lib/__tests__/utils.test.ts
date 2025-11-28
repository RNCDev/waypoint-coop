import { describe, it, expect } from 'vitest'
import { cn } from '../utils'

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names', () => {
      const result = cn('btn', 'btn-primary')
      expect(result).toBe('btn btn-primary')
    })

    it('should handle conditional classes', () => {
      const isActive = true
      const result = cn('btn', isActive && 'active')
      expect(result).toBe('btn active')
    })

    it('should filter out falsy values', () => {
      const result = cn('btn', false, null, undefined, 'active')
      expect(result).toBe('btn active')
    })

    it('should merge Tailwind classes correctly', () => {
      const result = cn('px-2 py-1', 'px-4')
      expect(result).toBe('py-1 px-4')
    })

    it('should handle arrays of classes', () => {
      const result = cn(['btn', 'btn-primary'], 'active')
      expect(result).toBe('btn btn-primary active')
    })

    it('should handle empty input', () => {
      const result = cn()
      expect(result).toBe('')
    })

    it('should handle objects with boolean values', () => {
      const result = cn({
        btn: true,
        'btn-primary': true,
        disabled: false,
      })
      expect(result).toBe('btn btn-primary')
    })
  })
})
