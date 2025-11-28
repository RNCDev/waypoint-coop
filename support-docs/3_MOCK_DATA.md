# Mock Data for Wireframes & Testing

## 1. Organizations (Orgs)
**Types:**
*   **Publisher:** Fund Admins, GPs (Self-Admin).
*   **Asset Owner:** GPs, VCs, PE Firms.
*   **Subscriber:** LPs (Pensions, Endowments, Family Offices).
*   **Delegate:** Auditors, Tax, Analytics/BI (LP Servicers).

| ID | Name | Role | Type | Status |
| :--- | :--- | :--- | :--- | :--- |
| `1001` | **Genii Admin Services** | Publisher | Fund Administrator | Verified |
| `1002` | **Alter Domus** | Publisher | Fund Administrator | Verified |
| `1003` | **Carta (Fund Admin)** | Publisher | Fund Administrator | Verified |
| `2001` | **Kleiner Perkins** | Asset Owner | General Partner (GP) | Verified |
| `2002` | **Sequoia Capital** | Asset Owner | General Partner (GP) | Verified |
| `2003` | **Andreessen Horowitz** | Asset Owner | General Partner (GP) | Verified |
| `2004` | **Benchmark** | Asset Owner | General Partner (GP) | Verified |
| `2005` | **Insight Partners** | Asset Owner | General Partner (GP) | Verified |
| `2006` | **Thoma Bravo** | Asset Owner | General Partner (GP) | Verified |
| `2007` | **Vista Equity** | Asset Owner | General Partner (GP) | Verified |
| `3001` | **State of Ohio Pension** | Subscriber | Limited Partner (LP) | Verified |
| `3002` | **Harvard Management Co.** | Subscriber | Limited Partner (LP) | Verified |
| `3003` | **Yale Endowment** | Subscriber | Limited Partner (LP) | Verified |
| `3004` | **CPPIB (Canada Pension)** | Subscriber | Limited Partner (LP) | Verified |
| `3005` | **BlackRock Solutions** | Subscriber | Limited Partner (LP) | Verified |
| `3006` | **GIC (Singapore)** | Subscriber | Limited Partner (LP) | Verified |
| `3007` | **CalPERS** | Subscriber | Limited Partner (LP) | Verified |
| `3008` | **Teacher's Retirement System of Texas** | Subscriber | Limited Partner (LP) | Verified |
| `4001` | **Deloitte Audit** | Delegate | Auditor | Verified |
| `4002` | **PwC Tax** | Delegate | Tax Advisor | Verified |
| `4003` | **Chronograph** | Delegate | LP Data/BI Servicer | Verified |
| `4004` | **Mantle** | Delegate | LP Data/BI Servicer | Verified |
| `4005` | **Carta (LP Services)** | Delegate | LP Data/BI Servicer | Verified |
| `4006` | **Burgiss / MSCI** | Delegate | LP Portfolio Analytics | Verified |

## 2. Users
| ID | Name | Email | Org ID | Role |
| :--- | :--- | :--- | :--- | :--- |
| `501` | **Alice Admin** | alice@genii.com | `1001` | Publisher (Admin) |
| `502` | **Bob GP** | bob@kleinerperkins.com | `2001` | Asset Owner (Admin) |
| `503` | **Charlie LP** | charlie@ohio.gov | `3001` | Subscriber (Viewer) |
| `504` | **Dana Delegate** | dana@deloitte.com | `4001` | Auditor (Restricted) |
| `505` | **Eve Analyst** | eve@chronograph.pe | `4003` | Delegate (Analytics) |
| `506` | **Frank Founder** | frank@mantle.co | `4004` | Delegate (Analytics) |
| `507` | **Grace GP** | grace@sequoia.com | `2002` | Asset Owner (Admin) |
| `508` | **Harry Harvard** | harry@hmc.harvard.edu | `3002` | Subscriber (Admin) |
| `509` | **Ian Insight** | ian@insightpartners.com | `2005` | Asset Owner (Admin) |
| `510` | **Jack Yale** | jack@yale.edu | `3003` | Subscriber (Viewer) |
| `511` | **Karen CPPIB** | karen@cppib.com | `3004` | Subscriber (Admin) |
| `512` | **Leo Thoma** | leo@thomabravo.com | `2006` | Asset Owner (Admin) |
| `513` | **Mike Mantle** | mike@mantle.co | `4004` | Delegate (Analytics) |
| `514` | **Nancy Nexla** | nancy@nexla.com | `4003` | Delegate (Integration) |
| `515` | **Oscar Ops** | oscar@alterdomus.com | `1002` | Publisher (Ops) |
| `516` | **Pat Partner** | pat@benchmark.com | `2004` | Asset Owner (Signer) |
| `517` | **Quinn Quant** | quinn@msci.com | `4006` | Delegate (Analytics) |
| `518` | **Rachel Risk** | rachel@calpers.ca.gov | `3007` | Subscriber (Risk) |
| `519` | **Steve Sequoia** | steve@sequoia.com | `2002` | Asset Owner (IR) |
| `520` | **Tina Tax** | tina@pwc.com | `4002` | Tax Delegate |

## 3. Assets
| ID | Name | Owner ID | Publisher ID | Type |
| :--- | :--- | :--- | :--- | :--- |
| `9001` | **KP Fund XVIII** | `2001` | `1001` (Genii) | Fund |
| `9002` | **KP Growth III** | `2001` | `1001` (Genii) | Fund |
| `9003` | **Sequoia Seed 2025** | `2002` | `2002` (Self) | Fund |
| `9004` | **Sequoia Growth X** | `2002` | `2002` (Self) | Fund |
| `9005` | **a16z Crypto IV** | `2003` | `1003` (Carta) | Fund |
| `9006` | **a16z Bio II** | `2003` | `1003` (Carta) | Fund |
| `9007` | **Benchmark VIII** | `2004` | `1002` (Alter Domus) | Fund |
| `9008` | **Insight Partners XII** | `2005` | `1002` (Alter Domus) | Fund |
| `9009` | **Thoma Bravo XV** | `2006` | `1001` (Genii) | Fund |
| `9010` | **Vista Equity VIII** | `2007` | `1002` (Alter Domus) | Fund |
| `9101` | **Project SpaceX Co-Invest** | `2001` | `1001` (Genii) | Co-Investment |
| `9102` | **Project Stripe SPV** | `2002` | `2002` (Self) | SPV |
| `9103` | **Project Databricks** | `2003` | `1003` (Carta) | Co-Investment |

## 4. Transaction Envelopes (The Ledger)

| Env ID | Publisher | On Behalf Of | Asset | Date | Type | Recipients |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `10001` | `1001` (Genii) | `2001` (KP) | `9001` | 2025-10-15 | `CAPITAL_CALL` | `3001`, `3002`, `3007` |
| `10002` | `2002` (Seq) | `2002` (Seq) | `9003` | 2025-10-16 | `DISTRIBUTION` | `3002`, `3003`, `3004` |
| `10003` | `1003` (Carta) | `2003` (a16z) | `9005` | 2025-10-17 | `NAV_UPDATE` | `3005`, `3006` |
| `10004` | `1002` (AD) | `2004` (Bench) | `9007` | 2025-10-18 | `QUARTERLY_REPORT` | `3001`, `3008` |
| `10005` | `1001` (Genii) | `2006` (Thoma) | `9009` | 2025-10-19 | `CAPITAL_CALL` | `3004`, `3007` |
| `10006` | `1002` (AD) | `2005` (Insight)| `9008` | 2025-10-20 | `K-1_TAX_FORM` | `3002`, `3003` |
| `10007` | `2002` (Seq) | `2002` (Seq) | `9102` | 2025-10-21 | `CAPITAL_CALL` | `3003` |
| `10008` | `1003` (Carta) | `2003` (a16z) | `9006` | 2025-10-22 | `SOI_UPDATE` | `3005`, `3006` |
| `10009` | `1001` (Genii) | `2001` (KP) | `9101` | 2025-10-23 | `LEGAL_NOTICE` | `3001`, `3002` |
| `10010` | `1002` (AD) | `2007` (Vista) | `9010` | 2025-10-24 | `DISTRIBUTION` | `3008`, `3004` |

## 5. Delegation Relationships (The "Access Graph")
*Note: This defines who can see what on behalf of the Subscriber.*

| Delegation ID | Subscriber (Grantor) | Delegate (Grantee) | Scope (Assets) | Scope (Type) | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `D-101` | `3001` (Ohio) | `4003` (Chronograph) | ALL | ALL | **Active** |
| `D-102` | `3002` (Harvard) | `4004` (Mantle) | `9001`, `9002` | `CAPITAL_CALL`, `DIST` | **Active** |
| `D-103` | `3003` (Yale) | `4006` (Burgiss) | ALL | `NAV_UPDATE`, `SOI` | **Active** |
| `D-104` | `3007` (CalPERS) | `4003` (Chronograph) | ALL | ALL | **Active** |
| `D-105` | `3005` (BlackRock) | `4005` (Carta LP) | `9005`, `9006` | ALL | **Active** |
| `D-106` | `3008` (TRS Texas) | `4001` (Deloitte) | ALL | `K-1_TAX_FORM` | **Active** |
| `D-107` | `3004` (CPPIB) | `4002` (PwC) | `9009` | `K-1_TAX_FORM` | **Pending GP Approval** |

## 6. Sample Payloads

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
