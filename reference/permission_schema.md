Waypoint Permission & Delegation Schema Specification v2.0

## Revision History
- v1.0: Initial ReBAC specification
- v2.0: Added Temporal Chain of Trust, extensible type system

## 1. Conceptual Model: Relationship-Based Access Control (ReBAC) with Temporal Ownership

The Waypoint permission system utilizes a ReBAC model with temporal tracking. Organizations do not have static "roles" (e.g., "Admin"). Instead, capabilities are derived dynamically from the relationships (edges) an organization has with specific Assets (nodes) **at a given point in time**.

The core mechanism for establishing these relationships is the Access Grant, and the temporal validity of these grants is automatically evaluated through the **Chain of Trust**.

### 1.1 Temporal Chain of Trust

When an LP delegates access to a service provider (consultant, auditor), the delegate's access is **dependent on the LP's continued ownership**. If the LP transfers their position to another party, the original delegate automatically loses access.

**Key Principle**: A grant remains ACTIVE in the database for audit purposes, but permission checks validate the full chain of authority in real-time.

**Example**:
1. CalPERS subscribes to KP Fund XXI (validFrom: Jan 2023, validTo: null)
2. CalPERS grants view access to Cambridge Associates (consultant)
3. CalPERS transfers position to Michigan Pension (CalPERS validTo: July 2024)
4. Cambridge Associates' grant status: still ACTIVE
5. Cambridge Associates' permission check: **DENIED** (chain broken - grantor subscription ended)
6. Michigan Pension grants view access to their own consultant
7. Michigan consultant permission check: **ALLOWED** (valid chain)

## 2. Core Entities & Types

### 2.1 The Asset
Represents a financial vehicle or entity.

**Hierarchy**: Firm (Root) -> Fund -> SPV -> PortfolioCompany.

**Key Properties**:
- `id`: UUID
- `managerId`: The Org ID of the GP (Root Authority)
- `type`: **String** (extensible - e.g., 'FUND', 'SPV', 'PORTFOLIO_COMPANY', 'CRYPTO_VEHICLE')
- `requireGPApprovalForDelegations`: Boolean. If true, LPs cannot grant access to third parties without GP consent

**Note**: Asset types are no longer enums. This allows the system to support new types of investment vehicles without code changes.

### 2.2 The Organization
Represents a legal entity (GP, LP, Admin, Auditor, etc.).

**Key Properties**:
- `id`: UUID
- `lei`: The Legal Entity Identifier (ISO 17442)
- `type`: **String?** (extensible - e.g., 'GP', 'LP', 'FUND_ADMIN', 'AUDITOR', 'CONSULTANT', 'TAX_ADVISOR', 'CRYPTO_FUND', 'SOVEREIGN_WEALTH')
- `vleiCredential`: The Verifiable Credential proving identity

**Note**: Organization types are no longer enums. This future-proofs the system for evolving market participants.

### 2.3 The Subscription (with Temporal Tracking)
Represents the investment relationship with temporal ownership tracking.

**Key Properties**:
- `assetId`: UUID
- `subscriberId`: UUID (The LP)
- `status`: 'ACTIVE' | 'PENDING' | 'CLOSED'
- `accessLevel`: 'FULL' | 'RESTRICTED' (Used for defaulting data visibility)
- `validFrom`: **DateTime** (when subscription became active, default: now())
- `validTo`: **DateTime?** (when subscription ended, null = currently active)
- `commitment`: Float (investment commitment in USD)

**Temporal Semantics**:
- A subscription is **currently valid** if `validTo IS NULL OR validTo > now()`
- Historical subscriptions have `validTo <= now()`
- The same LP can hold the same asset at different time periods (no unique constraint on assetId + subscriberId)
- This enables full audit trail of ownership transfers

**Example Query** (current subscriptions only):
```sql
WHERE status = 'ACTIVE' 
  AND (validTo IS NULL OR validTo > NOW())
```

### 2.4 The Access Grant
The atomic unit of delegation.

```typescript
type GrantStatus = 'ACTIVE' | 'PENDING_APPROVAL' | 'REVOKED' | 'EXPIRED';
type Capability = 'Publish' | 'View' | 'ManageSubscriptions' | 'ApproveDelegations';
type DataArtifact = 'CAPITAL_CALL' | 'DISTRIBUTION' | 'FINANCIAL_STATEMENT' | 'TAX_DOCUMENT' | 'LEGAL_DOCUMENT';

interface AccessGrant {
  id: string;
  
  // The Edge
  grantorId: string;      // Org ID delegating the right (GP or LP)
  granteeId: string;      // Org ID receiving the right (Admin, Consultant, Auditor)
  
  // Scope of Access
  assetId?: string;       // Specific asset, or null for global grants
  // Multi-asset support via AccessGrantAsset junction table
  
  // Capabilities (Fine-Grained Flags)
  canPublish: boolean;              // Create & Broadcast Data Packets (GP-side only)
  canViewData: boolean;             // Read Data Packets
  canManageSubscriptions: boolean;  // Invite/Revoke LPs (GP-side) or Manage own (LP-side)
  canApproveDelegations: boolean;   // Approve LP->Vendor grants (GP-side only)

  // Governance & Lifecycle
  status: GrantStatus;
  approvedBy?: string;    // User ID that approved this grant (for LP delegations requiring GP approval)
  approvedAt?: DateTime;  // Approval timestamp
  
  validFrom: DateTime;    // When grant becomes active (default: now())
  expiresAt?: DateTime;   // When grant expires (critical for temporary auditors)
  revokedAt?: DateTime;   // When grant was revoked
  
  // Metadata
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

**Important**: The grant's status may be ACTIVE, but the permission check will fail if the grantor's authority is no longer valid (broken chain).

## 3. Contextual Role Evaluation Logic (with Chain of Trust)

The system evaluates permissions ("Can Org X perform Action Y on Asset Z?") by traversing the graph and validating temporal chains.

### 3.1 Context: Asset Manager (The GP)
**Logic**: `Asset.managerId === CurrentOrg.id`

**Rights**: Superuser. Can perform all actions. Can create/revoke Access Grants for any delegate on this asset.

**Chain Validation**: Not applicable (root authority, always valid)

### 3.2 Context: Limited Partner (The LP)
**Logic**: Exists Subscription where `subscriberId === CurrentOrg.id AND status === 'ACTIVE' AND (validTo IS NULL OR validTo > now())`

**Rights**:
- **Implicit View**: Can view data packets for subscribed assets (subject to temporal validity)
- **Delegation**: Can create AccessGrant where grantorId is self (subject to GP approval check)

**Chain Validation**: Subscription must be temporally valid

### 3.3 Context: The Delegate (Admin, Auditor, Consultant)
**Logic**: Exists AccessGrant where `granteeId === CurrentOrg.id AND status === 'ACTIVE' AND assetScope includes Target Asset`

**Rights**: Strictly defined by the capabilities in the Grant

**Chain Validation**: **CRITICAL - Two-Step Check**:
1. **Grant Status Check**: Is grant ACTIVE and not expired?
2. **Grantor Authority Check**: Does grantor still have authority?
   - If grantor is Manager: YES (always valid)
   - If grantor is LP: Check subscription `(validTo IS NULL OR validTo > now())`
   - If grantor subscription invalid: **DENY ACCESS** (chain broken)

**Example Flow**:
```typescript
// Step 1: Find active grant
const grant = await findGrant({ granteeId: consultantId, assetId, status: 'ACTIVE' })

// Step 2: Validate grantor's chain
if (grant.grantor.managerId === assetId) {
  // Grantor is manager - always valid
  return ALLOW
} else {
  // Grantor is LP - check subscription
  const subscription = await findSubscription({ 
    subscriberId: grant.grantorId, 
    assetId,
    status: 'ACTIVE'
  })
  
  if (!subscription || (subscription.validTo && subscription.validTo <= now())) {
    return DENY // Chain broken - grantor no longer owns the asset
  }
  
  return ALLOW // Chain valid
}
```

4. Workflows and State Transitions
4.1 GP Delegating to Fund Administrator
GP creates Access Grant.

granteeId: Admin_Org_ID.

assetScope: All Assets (Master + Feeders).

capabilities: { canPublish: true, canManageSubscriptions: true }.

Result: Admin can now upload Capital Calls and invite LPs. The system logs these actions as "Admin acting for GP."

4.2 LP Delegating to Consultant (With GP Approval)
Asset Config: requireGPApprovalForDelegations is set to true.

LP creates Access Grant for Consultant_Org_ID.

System State: Grant status is set to Pending_Approval. Access is denied.

Notification: System alerts GP and Delegates with canApproveDelegations (e.g., Fund Admin).

Action: Fund Admin reviews Consultant identity. Clicks "Approve".

System State: Grant status updates to Active. approvedBy is set to Admin_Org_ID. Access is granted.

4.3 Tax Advisor Workflow (Restricted Publishing)
GP creates Access Grant for Deloitte/PwC.

capabilities: { canPublish: true }.

dataTypeScope: { type: 'SPECIFIC', artifacts: }.

Result: Tax Advisor can upload K-1s. If they try to upload a Capital Call or Valuation Report, the API rejects the request (403 Forbidden).

## 5. Security & Shadow Data Prevention (Enhanced with Temporal Tracking)

### 5.1 Expiration and Renewal
Auditor grants should default to `expiresAt: [End of Audit Cycle]`.

This prevents "Shadow Access" where an auditor retains access indefinitely.

### 5.2 Automatic Revocation Through Temporal Chain

**Primary Mechanism**: When an LP subscription ends (via position transfer or redemption), the chain of trust breaks automatically.

**Implementation**:
1. LP subscription is closed by setting `validTo` to transfer date
2. Grants created by that LP remain status = ACTIVE (for audit trail)
3. Permission checks validate the chain in real-time
4. Result: All delegates of the original LP automatically lose access

**Example Timeline**:
```
T0: CalPERS subscribes to Fund (validFrom: 2023-01-01, validTo: null)
T1: CalPERS grants view to Cambridge (status: ACTIVE)
T2: CalPERS sells position (validTo: 2024-07-15)
T3: Michigan Pension subscribes (validFrom: 2024-07-15, validTo: null)
T4: Permission check for Cambridge → DENIED (grantor subscription ended)
T5: Michigan grants view to their consultant → ALLOWED (valid chain)
```

**Benefits**:
- No manual revocation needed
- Grants remain in database for audit trail
- New owner's delegates don't see old owner's grants
- Full history preserved

### 5.3 Manual Revocation
GPs can still manually revoke grants by setting `status = 'REVOKED'` and `revokedAt = now()`.

This immediately terminates access regardless of temporal validity.

7. Implementation Strategy: From Standards to Software
Transitioning the industry to this architecture requires a phased approach that leverages existing standards to minimize friction.

7.1 Leveraging Standards: ILPA, OCF, and FIBO
The permission schema is payload-agnostic, but its utility maximizes when the "Data Artifacts" are standardized.

ILPA Data Standards: The dataTypeScope should map natively to the ILPA Reporting Template 2.0. This allows LPs to auto-ingest standardized fee and expense data.   

Open Cap Table Format (OCF): For Venture Capital funds, the schema should support OCF payloads. Access to the "Cap Table" artifact can be strictly governed, allowing Deal Counsel to see the capitalization structure without exposing LP contact details.   

FIBO (Financial Industry Business Ontology): We align our terminology (e.g., definitions of "Collective Investment Vehicle," "General Partner") with FIBO to ensure semantic consistency with banking systems and regulatory reporting requirements.   

7.2 The Interoperability Layer
Waypoint acts as the permission layer, but it connects to existing nodes.

Fund Admins: Will integrate their existing platforms (e.g., FIS, SS&C) to "Push" envelopes to Waypoint via API.

LPs: Will connect their aggregation systems (e.g., Addepar, Caissa) to "Pull" envelopes.

The "Switch": Waypoint functions as the "Switch" enforcing the Access Grants detailed in permissions.md. It validates the vLEI signature, checks the AccessGrant status, and routes the data.

7.3 Addressing the "Shadow Data" Legacy
The ultimate goal is to eliminate Shadow Accounting. By providing a trusted, permissioned API (the "Golden Source"), LPs no longer need to manually re-key data. They can trust the digital feed because:

Identity is verified (vLEI).

Authority is explicit (The Access Grant).

Integrity is cryptographic (Signed Envelopes).

## 8. Conclusion: Temporal Trust and Extensibility

The transition from document-based workflows to structured data exchange in private equity is not merely a technological upgrade; it is a restructuring of trust. The current ecosystem, reliant on email and PDFs, is fragile, opaque, and inefficient. 

The Waypoint Cooperative model, underpinned by the flexible Access Grant (ReBAC) permission schema detailed in this specification, offers a viable path forward with two critical enhancements:

### Temporal Chain of Trust (v2.0)
By tracking ownership periods and validating delegation chains in real-time, the system achieves:
- **Automatic Access Revocation**: No manual cleanup when ownership transfers
- **Complete Audit Trail**: Historical grants preserved, current access dynamically validated
- **Resilient Architecture**: Ownership can change hands without rewriting permission records

### Extensible Type System (v2.0)
By removing hardcoded organization and asset type enums, the system supports:
- **Future Market Participants**: Crypto funds, sovereign wealth funds, family offices
- **New Investment Vehicles**: Digital assets, tokenized securities, hybrid structures
- **Zero Code Changes**: New types added through configuration, not deployment

By formally modeling the complex web of delegations between GPs, LPs, and their service providers with temporal awareness, this architecture restores data sovereignty to the asset owners while enabling the operational efficiency of digital automation. 

It transforms the Limited Partnership Agreement from a static legal document into dynamic, enforceable code—paving the way for a real-time, transparent, and secure private capital market that adapts to ownership changes automatically and supports the evolving landscape of alternative investments.