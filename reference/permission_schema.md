Waypoint Permission & Delegation Schema Specification v1.0

1. Conceptual Model: Relationship-Based Access Control (ReBAC)
The Waypoint permission system utilizes a ReBAC model. Organizations do not have static "roles" (e.g., "Admin"). Instead, capabilities are derived dynamically from the relationships (edges) an organization has with specific Assets (nodes).

The core mechanism for establishing these relationships is the Access Grant.

2. Core Entities & Types
2.1 The Asset (Asset)
Represents a financial vehicle or entity.

Hierarchy: Firm (Root) -> Fund -> SPV -> PortfolioCompany.

Key Properties:

id: UUID.

managerId: The Org ID of the GP (Root Authority).

requireGPApprovalForDelegations: Boolean. If true, LPs cannot grant access to third parties without GP consent.

2.2 The Organization (Org)
Represents a legal entity (GP, LP, Admin, Auditor).

Key Properties:

id: UUID.

lei: The Legal Entity Identifier (ISO 17442).

vleiCredential: The Verifiable Credential proving identity.

2.3 The Subscription (Subscription)
Represents the investment relationship.

Key Properties:

assetId: UUID.

subscriberId: UUID (The LP).

status: 'Active' | 'Pending' | 'Closed'.

accessLevel: 'Full' | 'Restricted' (Used for defaulting data visibility).

2.4 The Access Grant (AccessGrant)
The atomic unit of delegation.

TypeScript
type GrantStatus = 'Active' | 'Pending_Approval' | 'Revoked' | 'Expired';
type Capability = 'Publish' | 'View' | 'ManageSubscriptions' | 'ApproveDelegations';
type DataArtifact = 'CapitalCall' | 'Distribution' | 'FinancialStatement' | 'TaxDocument' | 'LegalDocument';

interface AccessGrant {
  id: string;
  
  // The Edge
  grantorId: string;      // Org ID delegating the right (GP or LP)
  granteeId: string;      // Org ID receiving the right (Admin, Consultant, Auditor)
  
  // Scope of Access
  assetScope: {
    type: 'ALL' | 'SPECIFIC' | 'TAG_BASED';
    ids?: string;       // List of Asset IDs
    tags?: string;      // e.g., ["Vintage_2023", "European_Funds"]
  };
  
  dataTypeScope: {
    type: 'ALL' | 'SPECIFIC';
    artifacts?: DataArtifact; // e.g., ONLY for Tax Advisors
  };

  // Capabilities (Fine-Grained Flags)
  capabilities: {
    canPublish: boolean;              // Create & Broadcast Envelopes (GP-side only)
    canViewData: boolean;             // Read Envelopes
    canManageSubscriptions: boolean;  // Invite/Revoke LPs (GP-side) or Manage own (LP-side)
    canApproveDelegations: boolean;   // Approve LP->Vendor grants (GP-side only)
    canMaskPII: boolean;              // If true, PII fields are redacted in the view
  };

  // Governance & Lifecycle
  status: GrantStatus;
  approvalChain?: {
    required: boolean;
    approvedBy?: string; // GP Org ID that approved this LP delegation
    approvedAt?: string; // Timestamp
  };
  
  validFrom: string; // Timestamp
  expiresAt?: string; // Timestamp (Critical for temporary auditors)
  
  // Non-Repudiation
  signature: string; // Cryptographic signature of the Grantor using vLEI
}

3. Contextual Role Evaluation Logic
The system evaluates permissions ("Can Org X perform Action Y on Asset Z?") by traversing the graph.

3.1 Context: Asset Manager (The GP)
Logic: Asset.managerId === CurrentOrg.id

Rights: Superuser. Can perform all actions. Can create/revoke Access Grants for any delegate on this asset.

3.2 Context: Limited Partner (The LP)
Logic: Exists Subscription where subscriberId === CurrentOrg.id AND status === 'Active'.

Rights:

Implicit View: Can view data envelopes targeted to All Investors or specifically to CurrentOrg.id.

Delegation: Can create AccessGrant where grantorId is self. (Subject to GP Approval check).

3.3 Context: The Delegate (Admin, Auditor, Consultant)
Logic: Exists AccessGrant where granteeId === CurrentOrg.id AND status === 'Active' AND assetScope includes Target Asset.

Rights: Strictly defined by the capabilities object in the Grant.

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

5. Security & Shadow Data Prevention
5.1 Expiration and Renewal
Auditor grants should default to expiresAt: [End of Audit Cycle].

This prevents "Shadow Access" where an auditor retains access indefinitely.

5.2 Revocation Cascades
If a GP revokes a Grant to a Fund Admin, all downstream actions and permissions for that Admin are instantly terminated across the Asset Scope.

If an LP subscription is terminated (e.g., Secondary Sale), all Grants created by that LP for that Asset are automatically transitioned to Revoked.

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

8. Conclusion
The transition from document-based workflows to structured data exchange in private equity is not merely a technological upgrade; it is a restructuring of trust. The current ecosystem, reliant on email and PDFs, is fragile, opaque, and inefficient. The Waypoint Cooperative model, underpinned by the flexible Access Grant (ReBAC) permission schema detailed in this report, offers a viable path forward.

By formally modeling the complex web of delegations between GPs, LPs, and their service providers, this architecture restores data sovereignty to the asset owners while enabling the operational efficiency of digital automation. It transforms the Limited Partnership Agreement from a static legal document into dynamic, enforceable code—paving the way for a real-time, transparent, and secure private capital market.