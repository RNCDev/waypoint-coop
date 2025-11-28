import { Organization, User, Asset, Envelope, Payload, Delegation } from '@/types'

export const mockOrganizations: Organization[] = [
  { id: 1, name: 'Waypoint Platform', role: 'Platform Admin', type: 'Platform Operator', status: 'Verified' },
  { id: 1001, name: 'Genii Admin Services', role: 'Publisher', type: 'Fund Administrator', status: 'Verified' },
  { id: 1002, name: 'Alter Domus', role: 'Publisher', type: 'Fund Administrator', status: 'Verified' },
  { id: 1003, name: 'Carta (Fund Admin)', role: 'Publisher', type: 'Fund Administrator', status: 'Verified' },
  { id: 2001, name: 'Kleiner Perkins', role: 'Asset Owner', type: 'General Partner (GP)', status: 'Verified' },
  { id: 2002, name: 'Sequoia Capital', role: 'Asset Owner', type: 'General Partner (GP)', status: 'Verified' },
  { id: 2003, name: 'Andreessen Horowitz', role: 'Asset Owner', type: 'General Partner (GP)', status: 'Verified' },
  { id: 2004, name: 'Benchmark', role: 'Asset Owner', type: 'General Partner (GP)', status: 'Verified' },
  { id: 2005, name: 'Insight Partners', role: 'Asset Owner', type: 'General Partner (GP)', status: 'Verified' },
  { id: 2006, name: 'Thoma Bravo', role: 'Asset Owner', type: 'General Partner (GP)', status: 'Verified' },
  { id: 2007, name: 'Vista Equity', role: 'Asset Owner', type: 'General Partner (GP)', status: 'Verified' },
  { id: 3001, name: 'State of Ohio Pension', role: 'Subscriber', type: 'Limited Partner (LP)', status: 'Verified' },
  { id: 3002, name: 'Harvard Management Co.', role: 'Subscriber', type: 'Limited Partner (LP)', status: 'Verified' },
  { id: 3003, name: 'Yale Endowment', role: 'Subscriber', type: 'Limited Partner (LP)', status: 'Verified' },
  { id: 3004, name: 'CPPIB (Canada Pension)', role: 'Subscriber', type: 'Limited Partner (LP)', status: 'Verified' },
  { id: 3005, name: 'BlackRock Solutions', role: 'Subscriber', type: 'Limited Partner (LP)', status: 'Verified' },
  { id: 3006, name: 'GIC (Singapore)', role: 'Subscriber', type: 'Limited Partner (LP)', status: 'Verified' },
  { id: 3007, name: 'CalPERS', role: 'Subscriber', type: 'Limited Partner (LP)', status: 'Verified' },
  { id: 3008, name: "Teacher's Retirement System of Texas", role: 'Subscriber', type: 'Limited Partner (LP)', status: 'Verified' },
  { id: 4001, name: 'Deloitte Audit', role: 'Delegate', type: 'Auditor', status: 'Verified' },
  { id: 4002, name: 'PwC Tax', role: 'Delegate', type: 'Tax Advisor', status: 'Verified' },
  { id: 4003, name: 'Chronograph', role: 'Delegate', type: 'LP Data/BI Servicer', status: 'Verified' },
  { id: 4004, name: 'Mantle', role: 'Delegate', type: 'LP Data/BI Servicer', status: 'Verified' },
  { id: 4005, name: 'Carta (LP Services)', role: 'Delegate', type: 'LP Data/BI Servicer', status: 'Verified' },
  { id: 4006, name: 'Burgiss / MSCI', role: 'Delegate', type: 'LP Portfolio Analytics', status: 'Verified' },
]

export const mockUsers: User[] = [
  { id: 501, name: 'Alice Admin', email: 'alice@waypoint.coop', orgId: 1, role: 'Platform Admin' },
  { id: 521, name: 'Genii Publisher', email: 'publisher@genii.com', orgId: 1001, role: 'Publisher' },
  { id: 502, name: 'Bob GP', email: 'bob@kleinerperkins.com', orgId: 2001, role: 'Asset Owner' },
  { id: 503, name: 'Charlie LP', email: 'charlie@ohio.gov', orgId: 3001, role: 'Subscriber' },
  { id: 504, name: 'Dana Delegate', email: 'dana@deloitte.com', orgId: 4001, role: 'Auditor' },
  { id: 505, name: 'Eve Analyst', email: 'eve@chronograph.pe', orgId: 4003, role: 'Analytics' },
  { id: 506, name: 'Frank Founder', email: 'frank@mantle.co', orgId: 4004, role: 'Analytics' },
  { id: 507, name: 'Grace GP', email: 'grace@sequoia.com', orgId: 2002, role: 'Asset Owner' },
  { id: 508, name: 'Harry Harvard', email: 'harry@hmc.harvard.edu', orgId: 3002, role: 'Subscriber' },
  { id: 509, name: 'Ian Insight', email: 'ian@insightpartners.com', orgId: 2005, role: 'Asset Owner' },
  { id: 510, name: 'Jack Yale', email: 'jack@yale.edu', orgId: 3003, role: 'Subscriber' },
  { id: 511, name: 'Karen CPPIB', email: 'karen@cppib.com', orgId: 3004, role: 'Subscriber' },
  { id: 512, name: 'Leo Thoma', email: 'leo@thomabravo.com', orgId: 2006, role: 'Asset Owner' },
  { id: 513, name: 'Mike Mantle', email: 'mike@mantle.co', orgId: 4004, role: 'Analytics' },
  { id: 514, name: 'Nancy Nexla', email: 'nancy@nexla.com', orgId: 4003, role: 'Integration' },
  { id: 515, name: 'Oscar Ops', email: 'oscar@alterdomus.com', orgId: 1002, role: 'Ops' },
  { id: 516, name: 'Pat Partner', email: 'pat@benchmark.com', orgId: 2004, role: 'Signer' },
  { id: 517, name: 'Quinn Quant', email: 'quinn@msci.com', orgId: 4006, role: 'Analytics' },
  { id: 518, name: 'Rachel Risk', email: 'rachel@calpers.ca.gov', orgId: 3007, role: 'Risk' },
  { id: 519, name: 'Steve Sequoia', email: 'steve@sequoia.com', orgId: 2002, role: 'IR' },
  { id: 520, name: 'Tina Tax', email: 'tina@pwc.com', orgId: 4002, role: 'Tax' },
]

export const mockAssets: Asset[] = [
  { id: 9001, name: 'KP Fund XVIII', ownerId: 2001, publisherId: 1001, type: 'Fund' },
  { id: 9002, name: 'KP Growth III', ownerId: 2001, publisherId: 1001, type: 'Fund' },
  { id: 9003, name: 'Sequoia Seed 2025', ownerId: 2002, publisherId: 2002, type: 'Fund' },
  { id: 9004, name: 'Sequoia Growth X', ownerId: 2002, publisherId: 2002, type: 'Fund' },
  { id: 9005, name: 'a16z Crypto IV', ownerId: 2003, publisherId: 1003, type: 'Fund' },
  { id: 9006, name: 'a16z Bio II', ownerId: 2003, publisherId: 1003, type: 'Fund' },
  { id: 9007, name: 'Benchmark VIII', ownerId: 2004, publisherId: 1002, type: 'Fund' },
  { id: 9008, name: 'Insight Partners XII', ownerId: 2005, publisherId: 1002, type: 'Fund' },
  { id: 9009, name: 'Thoma Bravo XV', ownerId: 2006, publisherId: 1001, type: 'Fund' },
  { id: 9010, name: 'Vista Equity VIII', ownerId: 2007, publisherId: 1002, type: 'Fund' },
  { id: 9101, name: 'Project SpaceX Co-Invest', ownerId: 2001, publisherId: 1001, type: 'Co-Investment' },
  { id: 9102, name: 'Project Stripe SPV', ownerId: 2002, publisherId: 2002, type: 'SPV' },
  { id: 9103, name: 'Project Databricks', ownerId: 2003, publisherId: 1003, type: 'Co-Investment' },
]

// Helper to extract LP-specific payload from full payload
function extractLPPayload(fullPayload: any, lpId: number): any {
  if (!fullPayload || typeof fullPayload !== 'object') {
    return fullPayload
  }

  const filtered: any = {}

  for (const [key, value] of Object.entries(fullPayload)) {
    if (Array.isArray(value)) {
      // Filter arrays that contain LP-specific data
      if (key === 'line_items' || key === 'lp_metrics' || key === 'lpMetrics' || key === 'lineItems') {
        const lpItem = value.find((item: any) => item.lp_id === lpId || item.lpId === lpId)
        if (lpItem) {
          filtered[key] = [lpItem]
        }
      } else {
        // Keep other arrays as-is (portfolio_companies, etc.)
        filtered[key] = value
      }
    } else if (value && typeof value === 'object') {
      // Recursively filter nested objects
      filtered[key] = extractLPPayload(value, lpId)
    } else {
      // Keep primitive values
      filtered[key] = value
    }
  }

  return filtered
}

// Capital Call payload for envelope 10001 - one envelope per LP
const payload10001_ohio = {
  currency: 'USD',
  due_date: '2025-10-31',
  bank_details: { swift: 'BOFAUS3N', account: '123456789' },
  line_items: [
    { lp_id: 3001, lp_name: 'State of Ohio', amount: 5000000.00, share_pct: 0.05 },
  ],
}

const payload10001_harvard = {
  currency: 'USD',
  due_date: '2025-10-31',
  bank_details: { swift: 'BOFAUS3N', account: '123456789' },
  line_items: [
    { lp_id: 3002, lp_name: 'Harvard Mgmt', amount: 12500000.00, share_pct: 0.125 },
  ],
}

const payload10001_calpers = {
  currency: 'USD',
  due_date: '2025-10-31',
  bank_details: { swift: 'BOFAUS3N', account: '123456789' },
  line_items: [
    { lp_id: 3007, lp_name: 'CalPERS', amount: 10000000.00, share_pct: 0.10 },
  ],
}

// NAV Update payloads - one per LP
const payload10003_blackrock = {
  period_end: '2025-09-30',
  fund_level_metrics: {
    gross_asset_value: 450000000.00,
    net_asset_value: 448000000.00,
    dpi: 0.15,
    tvpi: 1.45,
  },
  lp_metrics: [
    { lp_id: 3005, nav: 25000000.00, unfunded_commitment: 5000000.00 },
  ],
}

const payload10003_gic = {
  period_end: '2025-09-30',
  fund_level_metrics: {
    gross_asset_value: 450000000.00,
    net_asset_value: 448000000.00,
    dpi: 0.15,
    tvpi: 1.45,
  },
  lp_metrics: [
    { lp_id: 3006, nav: 15000000.00, unfunded_commitment: 2000000.00 },
  ],
}

// Schedule of Investments - shared data, same for all recipients
const payload10008_shared = {
  portfolio_companies: [
    { name: 'Stripe', sector: 'Fintech', cost: 15000000.00, fair_value: 45000000.00 },
    { name: 'Databricks', sector: 'Data', cost: 10000000.00, fair_value: 22000000.00 },
    { name: 'OpenAI', sector: 'AI', cost: 5000000.00, fair_value: 85000000.00 },
  ],
}

// Envelopes: One per LP (not one envelope with multiple recipients)
export const mockEnvelopes: Omit<Envelope, 'hash'>[] = [
  // Capital Call 10001 - split into 3 envelopes (one per LP)
  { id: 10001, publisherId: 1001, userId: 501, assetOwnerId: 2001, assetId: 9001, recipientId: 3001, timestamp: '2025-10-15T10:00:00.000Z', version: 1, status: 'Delivered', dataType: 'CAPITAL_CALL' },
  { id: 10002, publisherId: 1001, userId: 501, assetOwnerId: 2001, assetId: 9001, recipientId: 3002, timestamp: '2025-10-15T10:00:00.000Z', version: 1, status: 'Delivered', dataType: 'CAPITAL_CALL' },
  { id: 10003, publisherId: 1001, userId: 501, assetOwnerId: 2001, assetId: 9001, recipientId: 3007, timestamp: '2025-10-15T10:00:00.000Z', version: 1, status: 'Delivered', dataType: 'CAPITAL_CALL' },
  // Distribution 10004 - split into 3 envelopes
  { id: 10004, publisherId: 2002, userId: 507, assetOwnerId: 2002, assetId: 9003, recipientId: 3002, timestamp: '2025-10-16T10:00:00.000Z', version: 1, status: 'Delivered', dataType: 'DISTRIBUTION' },
  { id: 10005, publisherId: 2002, userId: 507, assetOwnerId: 2002, assetId: 9003, recipientId: 3003, timestamp: '2025-10-16T10:00:00.000Z', version: 1, status: 'Delivered', dataType: 'DISTRIBUTION' },
  { id: 10006, publisherId: 2002, userId: 507, assetOwnerId: 2002, assetId: 9003, recipientId: 3004, timestamp: '2025-10-16T10:00:00.000Z', version: 1, status: 'Delivered', dataType: 'DISTRIBUTION' },
  // NAV Update 10007 - split into 2 envelopes
  { id: 10007, publisherId: 1003, userId: 501, assetOwnerId: 2003, assetId: 9005, recipientId: 3005, timestamp: '2025-10-17T10:00:00.000Z', version: 1, status: 'Delivered', dataType: 'NAV_UPDATE' },
  { id: 10008, publisherId: 1003, userId: 501, assetOwnerId: 2003, assetId: 9005, recipientId: 3006, timestamp: '2025-10-17T10:00:00.000Z', version: 1, status: 'Delivered', dataType: 'NAV_UPDATE' },
  // Quarterly Report 10009 - split into 2 envelopes
  { id: 10009, publisherId: 1002, userId: 515, assetOwnerId: 2004, assetId: 9007, recipientId: 3001, timestamp: '2025-10-18T10:00:00.000Z', version: 1, status: 'Delivered', dataType: 'QUARTERLY_REPORT' },
  { id: 10010, publisherId: 1002, userId: 515, assetOwnerId: 2004, assetId: 9007, recipientId: 3008, timestamp: '2025-10-18T10:00:00.000Z', version: 1, status: 'Delivered', dataType: 'QUARTERLY_REPORT' },
  // Capital Call 10011
  { id: 10011, publisherId: 1001, userId: 501, assetOwnerId: 2006, assetId: 9009, recipientId: 3004, timestamp: '2025-10-19T10:00:00.000Z', version: 1, status: 'Delivered', dataType: 'CAPITAL_CALL' },
  { id: 10012, publisherId: 1001, userId: 501, assetOwnerId: 2006, assetId: 9009, recipientId: 3007, timestamp: '2025-10-19T10:00:00.000Z', version: 1, status: 'Delivered', dataType: 'CAPITAL_CALL' },
  // K-1 Tax Form 10013
  { id: 10013, publisherId: 1002, userId: 515, assetOwnerId: 2005, assetId: 9008, recipientId: 3002, timestamp: '2025-10-20T10:00:00.000Z', version: 1, status: 'Delivered', dataType: 'K-1_TAX_FORM' },
  { id: 10014, publisherId: 1002, userId: 515, assetOwnerId: 2005, assetId: 9008, recipientId: 3003, timestamp: '2025-10-20T10:00:00.000Z', version: 1, status: 'Delivered', dataType: 'K-1_TAX_FORM' },
  // Capital Call 10015
  { id: 10015, publisherId: 2002, userId: 507, assetOwnerId: 2002, assetId: 9102, recipientId: 3003, timestamp: '2025-10-21T10:00:00.000Z', version: 1, status: 'Delivered', dataType: 'CAPITAL_CALL' },
  // SOI Update 10016 - shared data, same payload for all
  { id: 10016, publisherId: 1003, userId: 501, assetOwnerId: 2003, assetId: 9006, recipientId: 3005, timestamp: '2025-10-22T10:00:00.000Z', version: 1, status: 'Delivered', dataType: 'SOI_UPDATE' },
  { id: 10017, publisherId: 1003, userId: 501, assetOwnerId: 2003, assetId: 9006, recipientId: 3006, timestamp: '2025-10-22T10:00:00.000Z', version: 1, status: 'Delivered', dataType: 'SOI_UPDATE' },
  // Legal Notice 10018
  { id: 10018, publisherId: 1001, userId: 501, assetOwnerId: 2001, assetId: 9101, recipientId: 3001, timestamp: '2025-10-23T10:00:00.000Z', version: 1, status: 'Delivered', dataType: 'LEGAL_NOTICE' },
  { id: 10019, publisherId: 1001, userId: 501, assetOwnerId: 2001, assetId: 9101, recipientId: 3002, timestamp: '2025-10-23T10:00:00.000Z', version: 1, status: 'Delivered', dataType: 'LEGAL_NOTICE' },
  // Distribution 10020
  { id: 10020, publisherId: 1002, userId: 515, assetOwnerId: 2007, assetId: 9010, recipientId: 3008, timestamp: '2025-10-24T10:00:00.000Z', version: 1, status: 'Delivered', dataType: 'DISTRIBUTION' },
  { id: 10021, publisherId: 1002, userId: 515, assetOwnerId: 2007, assetId: 9010, recipientId: 3004, timestamp: '2025-10-24T10:00:00.000Z', version: 1, status: 'Delivered', dataType: 'DISTRIBUTION' },
]

export const mockPayloads: Payload[] = [
  { id: 1, envelopeId: 10001, data: payload10001_ohio },
  { id: 2, envelopeId: 10002, data: payload10001_harvard },
  { id: 3, envelopeId: 10003, data: payload10001_calpers },
  { id: 4, envelopeId: 10004, data: {} },
  { id: 5, envelopeId: 10005, data: {} },
  { id: 6, envelopeId: 10006, data: {} },
  { id: 7, envelopeId: 10007, data: payload10003_blackrock },
  { id: 8, envelopeId: 10008, data: payload10003_gic },
  { id: 9, envelopeId: 10009, data: {} },
  { id: 10, envelopeId: 10010, data: {} },
  { id: 11, envelopeId: 10011, data: {} },
  { id: 12, envelopeId: 10012, data: {} },
  { id: 13, envelopeId: 10013, data: {} },
  { id: 14, envelopeId: 10014, data: {} },
  { id: 15, envelopeId: 10015, data: {} },
  { id: 16, envelopeId: 10016, data: payload10008_shared },
  { id: 17, envelopeId: 10017, data: payload10008_shared },
  { id: 18, envelopeId: 10018, data: {} },
  { id: 19, envelopeId: 10019, data: {} },
  { id: 20, envelopeId: 10020, data: {} },
  { id: 21, envelopeId: 10021, data: {} },
]

export const mockDelegations: Delegation[] = [
  { id: 'D-101', subscriberId: 3001, delegateId: 4003, assetScope: 'ALL', typeScope: 'ALL', status: 'Active' },
  { id: 'D-102', subscriberId: 3002, delegateId: 4004, assetScope: [9001, 9002], typeScope: ['CAPITAL_CALL', 'DISTRIBUTION'], status: 'Active' },
  { id: 'D-103', subscriberId: 3003, delegateId: 4006, assetScope: 'ALL', typeScope: ['NAV_UPDATE', 'SOI_UPDATE'], status: 'Active' },
  { id: 'D-104', subscriberId: 3007, delegateId: 4003, assetScope: 'ALL', typeScope: 'ALL', status: 'Active' },
  { id: 'D-105', subscriberId: 3005, delegateId: 4005, assetScope: [9005, 9006], typeScope: 'ALL', status: 'Active' },
  { id: 'D-106', subscriberId: 3008, delegateId: 4001, assetScope: 'ALL', typeScope: ['K-1_TAX_FORM'], status: 'Active' },
  { id: 'D-107', subscriberId: 3004, delegateId: 4002, assetScope: [9009], typeScope: ['K-1_TAX_FORM'], status: 'Pending GP Approval', gpApprovalStatus: 'Pending' },
]
