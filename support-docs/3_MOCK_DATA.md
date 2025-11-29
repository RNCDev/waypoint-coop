# Mock Data for Wireframes & Testing

## 1. Organizations (Orgs)
**Types:**
*   **Delegate:** Fund Admins, GPs (Self-Admin).
*   **Asset Manager:** GPs, VCs, PE Firms.
*   **Limited Partner:** LPs (Pensions, Endowments, Family Offices).
*   **Delegate:** Auditors, Tax, Analytics/BI (LP Servicers).

| ID | Name | Role | Type | Status |
| :--- | :--- | :--- | :--- | :--- |
| `1001` | **Genii Admin Services** | Delegate | Fund Administrator | Verified |
| `1002` | **Alter Domus** | Delegate | Fund Administrator | Verified |
| `1003` | **Carta (Fund Admin)** | Delegate | Fund Administrator | Verified |
| `2001` | **Kleiner Perkins** | Asset Manager | General Partner (GP) | Verified |
| `2002` | **Sequoia Capital** | Asset Manager | General Partner (GP) | Verified |
| `2003` | **Andreessen Horowitz** | Asset Manager | General Partner (GP) | Verified |
| `2004` | **Benchmark** | Asset Manager | General Partner (GP) | Verified |
| `2005` | **Insight Partners** | Asset Manager | General Partner (GP) | Verified |
| `2006` | **Thoma Bravo** | Asset Manager | General Partner (GP) | Verified |
| `2007` | **Vista Equity** | Asset Manager | General Partner (GP) | Verified |
| `3001` | **State of Ohio Pension** | Limited Partner | Limited Partner (LP) | Verified |
| `3002` | **Harvard Management Co.** | Limited Partner | Limited Partner (LP) | Verified |
| `3003` | **Yale Endowment** | Limited Partner | Limited Partner (LP) | Verified |
| `3004` | **CPPIB (Canada Pension)** | Limited Partner | Limited Partner (LP) | Verified |
| `3005` | **BlackRock Solutions** | Limited Partner | Limited Partner (LP) | Verified |
| `3006` | **GIC (Singapore)** | Limited Partner | Limited Partner (LP) | Verified |
| `3007` | **CalPERS** | Limited Partner | Limited Partner (LP) | Verified |
| `3008` | **Teacher's Retirement System of Texas** | Limited Partner | Limited Partner (LP) | Verified |
| `4001` | **Deloitte Audit** | Delegate | Auditor | Verified |
| `4002` | **PwC Tax** | Delegate | Tax Advisor | Verified |
| `4003` | **Chronograph** | Delegate | LP Data/BI Servicer | Verified |
| `4004` | **Mantle** | Delegate | LP Data/BI Servicer | Verified |
| `4005` | **Carta (LP Services)** | Delegate | LP Data/BI Servicer | Verified |
| `4006` | **Burgiss / MSCI** | Delegate | LP Portfolio Analytics | Verified |

## 2. Users
| ID | Name | Email | Org ID | Role | Is Org Admin? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `501` | **Alice Admin** | alice@genii.com | `1001` | Delegate | Yes |
| `502` | **Bob GP** | bob@kleinerperkins.com | `2001` | Asset Manager | Yes |
| `503` | **Charlie LP** | charlie@ohio.gov | `3001` | Limited Partner | No |
| `504` | **Dana Delegate** | dana@deloitte.com | `4001` | Auditor | No |
| `505` | **Eve Analyst** | eve@chronograph.pe | `4003` | Delegate | No |
| `506` | **Frank Founder** | frank@mantle.co | `4004` | Delegate | Yes |
| `507` | **Grace GP** | grace@sequoia.com | `2002` | Asset Manager | Yes |
| `508` | **Harry Harvard** | harry@hmc.harvard.edu | `3002` | Limited Partner | Yes |
| `509` | **Ian Insight** | ian@insightpartners.com | `2005` | Asset Manager | Yes |
| `510` | **Jack Yale** | jack@yale.edu | `3003` | Limited Partner | No |
| `511` | **Karen CPPIB** | karen@cppib.com | `3004` | Limited Partner | Yes |
| `512` | **Leo Thoma** | leo@thomabravo.com | `2006` | Asset Manager | Yes |
| `513` | **Mike Mantle** | mike@mantle.co | `4004` | Delegate | No |
| `514` | **Nancy Nexla** | nancy@nexla.com | `4003` | Delegate | No |
| `515` | **Oscar Ops** | oscar@alterdomus.com | `1002` | Delegate | No |
| `516` | **Pat Partner** | pat@benchmark.com | `2004` | Asset Manager | No |
| `517` | **Quinn Quant** | quinn@msci.com | `4006` | Delegate | No |
| `518` | **Rachel Risk** | rachel@calpers.ca.gov | `3007` | Limited Partner | No |
| `519` | **Steve Sequoia** | steve@sequoia.com | `2002` | Asset Manager | No |
| `520` | **Tina Tax** | tina@pwc.com | `4002` | Tax Delegate | No |

## 3. Assets
*Note: `Default Delegate ID` indicates the primary publisher for display purposes. Actual publishing rights are managed via Publishing Rights (Section 6).*

| ID | Name | Owner ID | Default Delegate ID | Type | Require GP Approval |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `9001` | **KP Fund XVIII** | `2001` | `1001` (Genii) | Fund | Yes |
| `9002` | **KP Growth III** | `2001` | `1001` (Genii) | Fund | No |
| `9003` | **Sequoia Seed 2025** | `2002` | `2002` (Self) | Fund | No |
| `9004` | **Sequoia Growth X** | `2002` | `2002` (Self) | Fund | Yes |
| `9005` | **a16z Crypto IV** | `2003` | `1003` (Carta) | Fund | No |
| `9006` | **a16z Bio II** | `2003` | `1003` (Carta) | Fund | No |
| `9007` | **Benchmark VIII** | `2004` | `1002` (Alter Domus) | Fund | Yes |
| `9008` | **Insight Partners XII** | `2005` | `1002` (Alter Domus) | Fund | No |
| `9009` | **Thoma Bravo XV** | `2006` | `1001` (Genii) | Fund | Yes |
| `9010` | **Vista Equity VIII** | `2007` | `1002` (Alter Domus) | Fund | No |
| `9101` | **Project SpaceX Co-Invest** | `2001` | `1001` (Genii) | Co-Investment | Yes |
| `9102` | **Project Stripe SPV** | `2002` | `2002` (Self) | SPV | No |
| `9103` | **Project Databricks** | `2003` | `1003` (Carta) | Co-Investment | No |

## 4. Transaction Envelopes (The Ledger)

| Env ID | Delegate | On Behalf Of | Asset | Date | Type | Version | Recipients |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `10001` | `1001` (Genii) | `2001` (KP) | `9001` | 2025-10-15 | `CAPITAL_CALL` | v1 | `3001`, `3002`, `3007` |
| `10002` | `2002` (Seq) | `2002` (Seq) | `9003` | 2025-10-16 | `DISTRIBUTION` | v1 | `3002`, `3003`, `3004` |
| `10003` | `1003` (Carta) | `2003` (a16z) | `9005` | 2025-10-17 | `NAV_UPDATE` | v1 | `3005`, `3006` |
| `10004` | `1002` (AD) | `2004` (Bench) | `9007` | 2025-10-18 | `QUARTERLY_REPORT` | v1 | `3001`, `3008` |
| `10005` | `1001` (Genii) | `2006` (Thoma) | `9009` | 2025-10-19 | `CAPITAL_CALL` | v1 | `3004`, `3007` |
| `10006` | `1002` (AD) | `2005` (Insight)| `9008` | 2025-10-20 | `K-1_TAX_FORM` | v1 | `3002`, `3003` |
| `10007` | `2002` (Seq) | `2002` (Seq) | `9102` | 2025-10-21 | `CAPITAL_CALL` | v1 | `3003` |
| `10008` | `1003` (Carta) | `2003` (a16z) | `9006` | 2025-10-22 | `SOI_UPDATE` | v1 | `3005`, `3006` |
| `10009` | `1001` (Genii) | `2001` (KP) | `9101` | 2025-10-23 | `LEGAL_NOTICE` | v1 | `3001`, `3002` |
| `10010` | `1002` (AD) | `2007` (Vista) | `9010` | 2025-10-24 | `DISTRIBUTION` | v1 | `3008`, `3004` |
| `10011` | `1001` (Genii) | `2001` (KP) | `9001` | 2025-10-25 | `CAPITAL_CALL` | v2 (Correction) | `3001`, `3002`, `3007` |

## 5. Subscriptions
*Note: This defines which LPs can access which assets.*

| Subscription ID | Asset ID | Limited Partner ID | Granted By | Status | Granted At |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `S-1001` | `9001` (KP Fund XVIII) | `3001` (Ohio) | `2001` (KP) | Active | 2025-10-01 |
| `S-1002` | `9001` (KP Fund XVIII) | `3002` (Harvard) | `2001` (KP) | Active | 2025-10-01 |
| `S-1003` | `9001` (KP Fund XVIII) | `3007` (CalPERS) | `2001` (KP) | Active | 2025-10-01 |
| `S-1004` | `9003` (Sequoia Seed) | `3002` (Harvard) | `2002` (Sequoia) | Active | 2025-10-02 |
| `S-1005` | `9003` (Sequoia Seed) | `3003` (Yale) | `2002` (Sequoia) | Active | 2025-10-02 |
| `S-1006` | `9005` (a16z Crypto) | `3005` (BlackRock) | `2003` (a16z) | Active | 2025-10-03 |
| `S-1007` | `9005` (a16z Crypto) | `3006` (GIC) | `2003` (a16z) | Active | 2025-10-03 |
| `S-1008` | `9007` (Benchmark VIII) | `3001` (Ohio) | `2004` (Benchmark) | Pending LP Acceptance | 2025-10-04 |
| `S-1009` | `9009` (Thoma Bravo) | `3004` (CPPIB) | `2006` (Thoma) | Active | 2025-10-05 |
| `S-1010` | `9009` (Thoma Bravo) | `3007` (CalPERS) | `2006` (Thoma) | Active | 2025-10-05 |

## 6. Access Grants (Unified Model)
*Note: This unified model replaces separate Publishing Rights and Delegations.*

### GP Grants (`canPublish: true`)
*Asset Managers delegate publishing and management capabilities to Delegates (Fund Admins).*

| Grant ID | Grantor (GP) | Grantee (Delegate) | Asset Scope | Publish | View | Manage Subs | Approve Subs | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `AG-001` | `2001` (KP) | `1001` (Genii) | ALL | ✓ | ✓ | ✓ | ✓ | Active |
| `AG-002` | `2003` (a16z) | `1003` (Carta) | `9005`, `9006` | ✓ | ✓ | ✗ | ✗ | Active |
| `AG-003` | `2004` (Benchmark) | `1002` (Aduro) | `9007` | ✓ | ✓ | ✓ | ✗ | Active |
| `AG-004` | `2005` (Insight) | `1002` (Aduro) | `9008` | ✓ | ✓ | ✗ | ✓ | Active |
| `AG-005` | `2006` (Thoma) | `1001` (Genii) | `9009` | ✓ | ✓ | ✓ | ✓ | Active |
| `AG-006` | `2007` (Vista) | `1002` (Aduro) | `9010` | ✓ | ✓ | ✗ | ✗ | Active |

### LP Grants (`canPublish: false`)
*Limited Partners delegate data access to service providers.*

| Grant ID | Grantor (LP) | Grantee (Delegate) | Asset Scope | Type Scope | View | Manage Subs | Status | GP Approval |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `AG-101` | `3001` (Ohio) | `4003` (Chronograph) | ALL | ALL | ✓ | ✓ | Active | N/A |
| `AG-114` | `3002` (Harvard) | `4004` (Mantle) | `9001`, `9002` | CAPITAL_CALL, DIST | ✓ | ✗ | Active | Approved |
| `AG-115` | `3003` (Yale) | `4006` (Burgiss) | ALL | NAV_UPDATE, SOI | ✓ | ✗ | Active | N/A |
| `AG-103` | `3007` (CalPERS) | `4003` (Chronograph) | ALL | ALL | ✓ | ✗ | Active | N/A |
| `AG-128` | `3005` (BlackRock) | `4005` (Carta LP) | `9005`, `9006` | ALL | ✓ | ✗ | Active | N/A |
| `AG-108` | `3008` (TRS Texas) | `4001` (Deloitte) | ALL | K-1_TAX_FORM | ✓ | ✗ | Active | Approved |
| `AG-121` | `3004` (CPPIB) | `4002` (PwC) | `9009` | K-1_TAX_FORM | ✓ | ✗ | Pending Approval | Pending |

## 7. Permissions
*Note: Fine-grained permissions per user (beyond role-based defaults).*

| Permission ID | User ID | Resource | Action | Scope |
| :--- | :--- | :--- | :--- | :--- |
| `P-1001` | `501` (Alice) | `registry` | `view`, `update` | All |
| `P-1002` | `501` (Alice) | `audit` | `view` | All |
| `P-1003` | `502` (Bob) | `subscriptions` | `view`, `create`, `update`, `delete` | Assets: `9001`, `9002` |
| `P-1004` | `502` (Bob) | `access-grants` | `view`, `create`, `update` | All owned assets |
| `P-1005` | `521` (Genii Delegate) | `subscriptions` | `view` | Assets: `9001`, `9002`, `9009` |

## 8. Sample Payloads

### A. Capital Call (Envelope `10001`)
```json
{
  "currency": "USD",
  "due_date": "2025-10-31",
  "bank_details": { "swift": "BOFAUS3N", "account": "123456789" },
  "line_items": [
    { "lp_id": 3001, "lp_name": "State of Ohio", "amount": 5000000.00, "share_pct": 0.05 },
    { "lp_id": 3002, "lp_name": "Harvard Mgmt", "amount": 12500000.00, "share_pct": 0.125 },
    { "lp_id": 3007, "lp_name": "CalPERS", "amount": 10000000.00, "share_pct": 0.10 }
  ]
}
```

### B. NAV Update (Envelope `10003`)
```json
{
  "period_end": "2025-09-30",
  "fund_level_metrics": {
    "gross_asset_value": 450000000.00,
    "net_asset_value": 448000000.00,
    "dpi": 0.15,
    "tvpi": 1.45
  },
  "lp_metrics": [
    { "lp_id": 3005, "nav": 25000000.00, "unfunded_commitment": 5000000.00 },
    { "lp_id": 3006, "nav": 15000000.00, "unfunded_commitment": 2000000.00 }
  ]
}
```

### C. Schedule of Investments (Envelope `10008`)
```json
{
  "portfolio_companies": [
    { "name": "Stripe", "sector": "Fintech", "cost": 15000000.00, "fair_value": 45000000.00 },
    { "name": "Databricks", "sector": "Data", "cost": 10000000.00, "fair_value": 22000000.00 },
    { "name": "OpenAI", "sector": "AI", "cost": 5000000.00, "fair_value": 85000000.00 }
  ]
}
```
