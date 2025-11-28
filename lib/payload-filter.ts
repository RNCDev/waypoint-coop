/**
 * Filter payload data to show only data relevant to a specific organization
 * This ensures data privacy - each recipient only sees their own data
 * 
 * Rules:
 * - Filter arrays with lp_id/lpId fields (line_items, lp_metrics)
 * - Keep arrays without org-specific data (portfolio_companies, etc.)
 * - Keep all top-level metadata fields (currency, due_date, bank_details, etc.)
 * - Recursively filter nested objects
 */
export function filterPayloadByOrgId(payload: any, orgId: number): any {
  if (!payload || typeof payload !== 'object') {
    return payload
  }

  // Handle array payloads (line_items, lp_metrics, etc.)
  if (Array.isArray(payload)) {
    return payload.filter((item: any) => {
      // Check for lp_id field (snake_case)
      if (item.lp_id === orgId) return true
      // Check for lpId field (camelCase)
      if (item.lpId === orgId) return true
      return false
    })
  }

  // Handle object payloads with nested arrays
  const filtered: any = {}

  for (const [key, value] of Object.entries(payload)) {
    if (Array.isArray(value)) {
      // Check if this array contains organization-specific data
      const hasOrgSpecificData = value.some((item: any) => 
        item && typeof item === 'object' && (item.lp_id === orgId || item.lpId === orgId)
      )

      if (hasOrgSpecificData) {
        // Filter arrays that contain org-specific data (line_items, lp_metrics)
        filtered[key] = value.filter((item: any) => {
          if (!item || typeof item !== 'object') return false
          if (item.lp_id === orgId) return true
          if (item.lpId === orgId) return true
          return false
        })
      } else {
        // Keep arrays that don't have org-specific data (portfolio_companies, etc.)
        filtered[key] = value
      }
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Recursively filter nested objects (like bank_details, fund_level_metrics)
      filtered[key] = filterPayloadByOrgId(value, orgId)
    } else {
      // Keep primitive values and non-object values (currency, due_date, period_end, etc.)
      filtered[key] = value
    }
  }

  return filtered
}

