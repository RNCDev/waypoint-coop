import { describe, it, expect } from 'vitest'
import { filterPayloadByOrgId } from '../payload-filter'

describe('filterPayloadByOrgId', () => {
  describe('array filtering', () => {
    it('should filter array with lp_id field (snake_case)', () => {
      const payload = [
        { lp_id: 100, amount: 1000 },
        { lp_id: 200, amount: 2000 },
        { lp_id: 300, amount: 3000 },
      ]

      const filtered = filterPayloadByOrgId(payload, 200)

      expect(filtered).toEqual([{ lp_id: 200, amount: 2000 }])
    })

    it('should filter array with lpId field (camelCase)', () => {
      const payload = [
        { lpId: 100, amount: 1000 },
        { lpId: 200, amount: 2000 },
        { lpId: 300, amount: 3000 },
      ]

      const filtered = filterPayloadByOrgId(payload, 200)

      expect(filtered).toEqual([{ lpId: 200, amount: 2000 }])
    })

    it('should return empty array when no matches found', () => {
      const payload = [
        { lp_id: 100, amount: 1000 },
        { lp_id: 200, amount: 2000 },
      ]

      const filtered = filterPayloadByOrgId(payload, 999)

      expect(filtered).toEqual([])
    })
  })

  describe('object filtering with nested arrays', () => {
    it('should filter org-specific arrays and keep non-org-specific arrays', () => {
      const payload = {
        line_items: [
          { lp_id: 100, amount: 1000, description: 'Item 1' },
          { lp_id: 200, amount: 2000, description: 'Item 2' },
          { lp_id: 300, amount: 3000, description: 'Item 3' },
        ],
        portfolio_companies: [
          { name: 'Company A', valuation: 1000000 },
          { name: 'Company B', valuation: 2000000 },
        ],
        currency: 'USD',
        due_date: '2024-12-31',
      }

      const filtered = filterPayloadByOrgId(payload, 200)

      expect(filtered).toEqual({
        line_items: [{ lp_id: 200, amount: 2000, description: 'Item 2' }],
        portfolio_companies: [
          { name: 'Company A', valuation: 1000000 },
          { name: 'Company B', valuation: 2000000 },
        ],
        currency: 'USD',
        due_date: '2024-12-31',
      })
    })

    it('should keep primitive values unchanged', () => {
      const payload = {
        currency: 'USD',
        due_date: '2024-12-31',
        period_end: '2024-Q4',
        total_amount: 5000,
        line_items: [
          { lp_id: 100, amount: 1000 },
          { lp_id: 200, amount: 2000 },
        ],
      }

      const filtered = filterPayloadByOrgId(payload, 200)

      expect(filtered.currency).toBe('USD')
      expect(filtered.due_date).toBe('2024-12-31')
      expect(filtered.period_end).toBe('2024-Q4')
      expect(filtered.total_amount).toBe(5000)
    })

    it('should recursively filter nested objects', () => {
      const payload = {
        bank_details: {
          account_number: '12345',
          routing_number: '67890',
          bank_name: 'Test Bank',
        },
        fund_level_metrics: {
          total_nav: 1000000,
          irr: 15.5,
        },
        line_items: [
          { lp_id: 100, amount: 1000 },
          { lp_id: 200, amount: 2000 },
        ],
      }

      const filtered = filterPayloadByOrgId(payload, 200)

      expect(filtered.bank_details).toEqual({
        account_number: '12345',
        routing_number: '67890',
        bank_name: 'Test Bank',
      })
      expect(filtered.fund_level_metrics).toEqual({
        total_nav: 1000000,
        irr: 15.5,
      })
      expect(filtered.line_items).toEqual([{ lp_id: 200, amount: 2000 }])
    })
  })

  describe('edge cases', () => {
    it('should handle null input', () => {
      const filtered = filterPayloadByOrgId(null, 100)
      expect(filtered).toBeNull()
    })

    it('should handle undefined input', () => {
      const filtered = filterPayloadByOrgId(undefined, 100)
      expect(filtered).toBeUndefined()
    })

    it('should handle empty object', () => {
      const filtered = filterPayloadByOrgId({}, 100)
      expect(filtered).toEqual({})
    })

    it('should handle empty array', () => {
      const filtered = filterPayloadByOrgId([], 100)
      expect(filtered).toEqual([])
    })

    it('should handle primitive values', () => {
      expect(filterPayloadByOrgId('string', 100)).toBe('string')
      expect(filterPayloadByOrgId(123, 100)).toBe(123)
      expect(filterPayloadByOrgId(true, 100)).toBe(true)
    })
  })

  describe('complex real-world scenarios', () => {
    it('should filter capital call data correctly', () => {
      const payload = {
        data_type: 'CAPITAL_CALL',
        period: '2024-Q4',
        due_date: '2024-12-31',
        currency: 'USD',
        bank_details: {
          account_number: '12345',
          routing_number: '67890',
          bank_name: 'Test Bank',
        },
        line_items: [
          { lp_id: 401, amount: 50000, description: 'Capital Call Q4' },
          { lp_id: 402, amount: 75000, description: 'Capital Call Q4' },
          { lp_id: 403, amount: 100000, description: 'Capital Call Q4' },
        ],
        fund_level_metrics: {
          total_committed: 10000000,
          total_called: 5000000,
        },
      }

      const filtered = filterPayloadByOrgId(payload, 402)

      expect(filtered.line_items).toHaveLength(1)
      expect(filtered.line_items[0]).toEqual({
        lp_id: 402,
        amount: 75000,
        description: 'Capital Call Q4',
      })
      expect(filtered.bank_details).toEqual({
        account_number: '12345',
        routing_number: '67890',
        bank_name: 'Test Bank',
      })
      expect(filtered.fund_level_metrics).toEqual({
        total_committed: 10000000,
        total_called: 5000000,
      })
    })

    it('should filter NAV update data correctly', () => {
      const payload = {
        data_type: 'NAV_UPDATE',
        period: '2024-Q3',
        portfolio_companies: [
          { name: 'Company A', sector: 'Tech' },
          { name: 'Company B', sector: 'Healthcare' },
        ],
        lp_metrics: [
          { lpId: 401, nav: 150000, ownership: 0.05 },
          { lpId: 402, nav: 225000, ownership: 0.075 },
          { lpId: 403, nav: 300000, ownership: 0.10 },
        ],
        fund_nav: 3000000,
      }

      const filtered = filterPayloadByOrgId(payload, 402)

      expect(filtered.portfolio_companies).toHaveLength(2)
      expect(filtered.lp_metrics).toHaveLength(1)
      expect(filtered.lp_metrics[0]).toEqual({
        lpId: 402,
        nav: 225000,
        ownership: 0.075,
      })
      expect(filtered.fund_nav).toBe(3000000)
    })

    it('should handle mixed snake_case and camelCase', () => {
      const payload = {
        line_items: [
          { lp_id: 100, amount: 1000 },
          { lpId: 200, amount: 2000 },
        ],
        metadata: { created_at: '2024-01-01' },
      }

      const filtered = filterPayloadByOrgId(payload, 200)

      expect(filtered.line_items).toEqual([{ lpId: 200, amount: 2000 }])
    })
  })
})
