Sovereignty, Delegation, and Trust: A Comprehensive Architecture for Permissioned Data Exchange in Private Capital Markets

Waypoint Cooperative is meant to be an industry-owned infrastructure designed to facilitate structured, machine-to-machine data exchange. This transition represents a shift from a "Push" model (emailing PDFs) to a "Permissioned Pull" or "Streaming" model. In this new paradigm, data sovereignty is paramount. The generator of the data (e.g., the GP or the Fund Admin) retains control over the "Golden Source," granting revocable, granular access rights to consumers (LPs, Auditors, Regulators) via an API.   

Designing this system requires a rigorous understanding of the taxonomy of trust within private equity. We must define not just who the actors are, but the precise nature of their relationships: who acts as a principal, who acts as an agent, who has a fiduciary duty, and who has a statutory right to information.

The Taxonomy of Trust: Stakeholder Dynamics and Data Flows
To architect a robust permission schema, one must first deconstruct the "nodes" (organizations) and "edges" (relationships) that constitute the private market ecosystem. The industry is not a static hierarchy but a dynamic mesh of fiduciary obligations and service contracts.

The General Partner (GP) / Asset Manager
The GP acts as the central node in the fund structure, possessing root authority over the fund's assets and data. While often referred to interchangeably, it is crucial to distinguish between the "Asset Manager" (the management company, e.g., Blackstone, KKR, or a mid-market firm) and the "General Partner" (the specific legal entity, usually a Limited Liability Company or Limited Partnership, formed to manage a specific fund vehicle).   

Fiduciary Role and Data Sovereignty
The GP owes fiduciary duties to the LPs to manage capital, execute investment strategies, and report performance accurately. Consequently, the GP is the primary Grantor of permissions in the network. They originate the most critical data artifacts—valuations, capital calls, and distribution notices—and possess the sovereign right to determine who can view this information.   

The Operational Reality: Delegation
Despite holding root authority, the GP rarely handles all data processing internally. They delegate significant operational authority to third-party Service Providers, primarily Fund Administrators. This creates a "principal-agent" problem in data governance: the GP is legally responsible for the accuracy and security of data they do not physically generate or store. The permission schema must therefore explicitly model this delegation, allowing the GP to grant "Acting As" capabilities to the Administrator while retaining the power to revoke those rights instantly.   

The Limited Partner (LP) / Investor
LPs provide the capital that fuels the ecosystem. This category encompasses a diverse array of institutions: public and private pension funds, endowments, sovereign wealth funds, family offices, and high-net-worth individuals.

Passive vs. Active Data Consumption
Historically, LPs were passive consumers of quarterly PDF reports. However, the modern LP is increasingly sophisticated, demanding granular, raw data to drive their own internal risk analytics and portfolio construction models. They require "look-through" access—not just to aggregate fund-level performance (IRR, TVPI), but to the underlying portfolio company metrics (EBITDA growth, leverage ratios, ESG data).   

The Need for Delegation
LPs often lack the internal infrastructure to ingest and normalize this torrent of data. Consequently, they delegate data management to their own set of vendors: Investment Consultants (e.g., Mercer, Franklin Park, Cambridge Associates), Custodians (e.g., State Street, BNY Mellon), and Data Aggregators (e.g., Burgiss/MSCI, Solovis).   

Implication for Schema: The permission system must allow LPs to grant these third parties access to their specific data slices. However, this creates a tension: GPs are often wary of granting broad access to third-party aggregators due to confidentiality concerns and the risk of data leakage to competitors. The schema must support a workflow where an LP's delegation request might require GP Approval before becoming active.   

The Fund Administrator (The "Operator")
The Fund Administrator is the critical operational engine of the private markets. Contracted by the GP, they maintain the official books and records, calculate Net Asset Value (NAV), process capital calls, distribute reports, and perform Anti-Money Laundering (AML) and Know Your Customer (KYC) checks.   

The "Writer" of Record
While the GP is the authority, the Administrator is often the author of the data. In a digital ledger system, the Administrator needs "Write" and "Publish" permissions delegated by the GP.

Maker-Checker Workflows: Within the Administrator's own organization, strict "Maker-Checker" (or "Four-Eyes") workflows are enforced to prevent fraud. One junior accountant drafts a capital call (Maker), and a senior officer approves it (Checker) before it is published. The permission schema must be granular enough to support these internal workflow states (Draft, Pending Approval, Published).   

Co-Sourcing Models
Increasingly, GPs use "co-sourcing" models where internal GP teams and external Administrator teams work concurrently in the same software platforms. This requires a nuanced permission set where a GP might retain "Final Approval" rights while the Administrator has "Drafting" rights, creating a collaborative data production environment.   

The Auditor and Tax Advisor
These entities provide essential assurance and compliance services, operating on cyclical schedules.

Auditors: The Verifiers
Auditors require "View-Only" access to a vast scope of data—financial statements, bank confirmations, valuations, and legal agreements—to issue an audit opinion. Their access is typically intensive during the "audit season" (Q1/Q2) and dormant otherwise.   

Portal Friction: Currently, Auditors waste significant time chasing "PBC" (Prepared by Client) lists via email. A permissioned data network would allow the GP to grant the Auditor a "Time-Bounded Read-Only" token to access the relevant historical data directly.   

Tax Advisors: The Specialist Publishers
Tax Advisors (often Big 4 accounting firms) require deep access to transactional data to generate Schedule K-1s (for US investors) or PFIC statements. Uniquely, Tax Advisors act as producers of data. They generate the K-1s which must be distributed to LPs. Therefore, they need a specialized "Publish" permission limited specifically to Tax Artifacts. They should not be able to publish Capital Calls or modify Valuation data.   

Legal Counsel: Fund vs. Deal
The legal function is bifurcated, and the data access needs differ significantly between "Fund Counsel" and "Deal Counsel."

Fund Counsel
Fund Counsel advises on the formation of the fund, the drafting of the Limited Partnership Agreement (LPA), and regulatory compliance. They need access to investor subscription documents, side letters, and fund-level governance data. They are the guardians of the fund's constitutive documents.   

Deal Counsel
Deal Counsel advises on specific M&A transactions (buying or selling a portfolio company). Their access should be scoped strictly to the Deal/SPV level.

Privacy Constraint: Deal Counsel generally should not have access to the LP register or see who the investors in the fund are, unless relevant to specific co-investment syndications. Granting Deal Counsel broad "Fund Level" access is a violation of the principle of least privilege.   

The Custodian
Distinct from the Fund Administrator, the Custodian focuses on the safekeeping of assets. In private markets, this role is less about holding physical stock certificates and more about verifying ownership and managing cash flows.   

Data Validation: Custodians often perform a "shadow" record-keeping function to validate the Administrator's NAV. They require read access to bank ledgers and transaction logs but typically do not write data to the official fund records.   

Architectural Complexity: Modeling Fund Structures and Inheritance
The operational complexity of private equity lies in its structural hierarchy. A "Fund" is rarely a single entity; it is a cluster of legal vehicles. The permission schema must be capable of modeling inheritance—how access to a parent node cascades (or does not cascade) to child nodes.

The Master-Feeder Structure
A common structure for global funds involves a "Master Fund" (where assets are held) fed by multiple "Feeder Funds" (where investors enter).   

Feeder A (Delaware): For US Taxable Investors.

Feeder B (Cayman): For Non-US/Tax-Exempt Investors.

Master Fund: Holds the portfolio.

Permission Logic:

Investment Team: Needs access to the Master Fund to see the aggregate pool of capital available for deployment.

US Tax Advisor: Needs access to Feeder A to generate K-1s for US investors. They may not need access to Feeder B.

LP in Feeder A: Should only see data regarding Feeder A and their pro-rata share of the Master Fund. They must never see the investor list of Feeder B.

Inheritance: Data originating at the Master Fund (e.g., a Portfolio Company exit) cascades up to the Feeders. Permissions for the Fund Admin usually propagate down from the Master to all Feeders, whereas permissions for Tax Advisors might be siloed by Feeder.

Parallel Funds and AIVs
Parallel Funds invest alongside the main fund to accommodate specific legal or regulatory requirements of certain investors. Alternative Investment Vehicles (AIVs) are set up to hold specific assets that might generate adverse tax consequences if held by the main fund.   

Implication: A "Fund" in the permission schema is actually a grouping of these related entities. An "Access Grant" scoped to the "Main Fund" usually implies access to the Parallel Funds and AIVs, but exceptions exist. The schema must allow for "Scope Groups" (e.g., AssetScope: [Fund IV Complex]) that automatically include all related vehicles.

Co-Investment Vehicles
LPs are often offered the opportunity to co-invest in specific deals alongside the fund.   

Data Partitioning: A Co-Invest vehicle is a distinct legal entity. An LP might be an investor in the Main Fund and Co-Invest Vehicle A, but not Co-Invest Vehicle B.

Strict Segregation: The permission schema must ensure that an LP's "view" of the world is the intersection of their subscriptions. They cannot infer the existence or performance of Co-Invest Vehicle B if they are not subscribed to it.

The "Look-Through" Data Demand
LPs increasingly demand "look-through" data—visibility into the underlying portfolio companies (PortCos) held by the fund.   

Granularity: This moves the permission boundary from the "Fund" level down to the "Asset/PortCo" level.

Sensitivity: GPs are hesitant to share raw PortCo data (e.g., customer lists, detailed margins) due to competitive risks. The schema must support Field-Level Security, allowing a GP to publish a "Sanitized" version of a PortCo report to LPs while sharing the "Full" version with the Fund Admin and Auditor.

The Operational Data Plane: Artifacts, Lifecycles, and Privacy
The permission schema must recognize the semantic difference between various data artifacts. Access to a "Capital Call" is functionally different from access to a "K-1" or a "Quarterly Letter."

Capital Activity: Calls and Distributions
These are the heartbeat of the fund.

Nature: High-frequency, time-sensitive, high-value.

Risk: These documents contain wire instructions. Fraud (Business Email Compromise) is a massive risk.

Permissioning: Requires strong identity verification (vLEI) for the publisher. LPs often delegate the receipt and processing of these notices to Custodians or Trustees, but rarely the authority to move cash (which remains with the LP's treasury team).   

Financial Reporting: PCAPs and Financial Statements
PCAP (Partner Capital Account Statement): Shows the LP's specific balance, contributions, and distributions.

Privacy Rule: A PCAP is strictly private to the LP. An "Access Grant" given to an Auditor allows them to see all PCAPs (to verify the total), but an "Access Grant" given to an LP Consultant must only allow them to see the PCAPs of that specific LP client.

Implementation: The system must support Row-Level Security (RLS) where the SubscriberId is a mandatory filter for external delegates.   

Tax Artifacts: The K-1 / K-3
Sensitivity: Maximum. Contains Personally Identifiable Information (PII) including Social Security Numbers, Tax IDs, and home addresses.   

Workflow: Produced by Tax Advisors, approved by GP, distributed to LPs.

Regulation: GDPR and CCPA implications are severe here. Access logs must be immutable. The permission schema should support a PII_Masking flag, allowing, for example, an LP's investment analyst to see the tax numbers (income, loss) without seeing the PII headers, while the tax director sees both.

Shadow Accounting: The Mechanism to Replace
Currently, LPs employ teams or vendors to manually key data from these PDFs into systems like eFront.

The Waypoint Solution: By granting an API permission, the GP allows the LP's system to "pull" the structured JSON data directly.

Implication: The permission is not just for a "User" (human) but for a "Service Principal" (machine/application). The schema must support Machine-to-Machine (M2M) authentication flows using OAuth2 or mTLS.   

Designing the Permission Schema: Relationship-Based Access Control (ReBAC)
Traditional Role-Based Access Control (RBAC)—where users are assigned static roles like "Admin" or "Viewer"—fails in private equity due to "Role Explosion." An organization might be the GP for Fund A, an LP in Fund B, and a Co-Investor in Deal C. Creating a unique role for every combination is unmanageable.   

Instead, we propose a Relationship-Based Access Control (ReBAC) model, inspired by Google's Zanzibar system. In ReBAC, permissions are derived from the relationships (edges) between entities (nodes).   

The Access Grant: The Atomic Unit of Trust
The fundamental unit of our schema is the Access Grant. This is not a role; it is a directed edge in the graph connecting a Grantor to a Grantee regarding a specific Scope.

Structure of an Access Grant:
Grantor: The entity owning the data (e.g., The GP).

Grantee: The entity receiving access (e.g., The Fund Admin).

Scope: The set of Assets (Fund I, Fund II) and Data Types (Capital Calls, Financials).

Capabilities: The specific actions allowed (Publish, View, Approve).

Dynamic Contextual Roles
Roles are evaluated at runtime based on the relationship:

Context: Is Org X the Manager of Asset Y?

If Yes: Org X has Root Authority (Asset Manager Role).

Context: Is Org A the Subscriber to Asset Y?

If Yes: Org A has Subscriber Rights (Limited Partner Role).

Context: Is there an AccessGrant from Org X (Manager) to Org Z?

If Yes: Org Z has Delegate Rights (Service Provider Role) defined by the grant capabilities.

Delegation Logic and Chain of Trust
The schema must support specific delegation patterns identified in the research:

GP -> Admin Delegation
Pattern: The GP grants canPublish and canManageSubscriptions to the Admin.

Audit: When the Admin publishes a Capital Call, the system records: "Published by User Alice (Admin Org) on behalf of GP Org via Grant #123." This preserves the chain of authority.   

LP -> Consultant Delegation
Pattern: The LP grants canViewData to their Consultant.

Constraint: The Consultant's view is strictly limited to the LP's data slice. They inherit the LP's visibility restrictions.

The "Approval Handshake" (The GP Veto)
Research indicates GPs are protective of their data. Even if an LP wants to share data with a Consultant, the GP may require oversight.

Mechanism: If the Asset has the flag requireGPApprovalForDelegations: true, any Access Grant initiated by an LP enters a Pending_Approval state. It only becomes Active once the GP (or a delegate with canApproveDelegations) signs off on it. This feature is critical for "Most Favored Nation" (MFN) compliance and confidentiality agreements.   

Identity and Trust Anchors: vLEI Integration
Permissions are useless without Identity. To prevent fraud (e.g., a fake auditor requesting access), the system should integrate Verifiable Legal Entity Identifiers (vLEIs).   

Usage: The Grantor and Grantee are identified by their LEIs. The AccessGrant is cryptographically signed using the Grantor's vLEI credential. This creates a portable, verifiable proof of delegation that can be verified by any participant in the network without centralized database lookups, enhancing the decentralized nature of the cooperative.   

Technical Specification: permissions.md Rewrite
The following is the drafted content for the permissions.md file, rewritten to reflect the ReBAC architecture and complex delegation logic.