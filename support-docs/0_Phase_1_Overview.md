# Waypoint Phase 1: The Digital Clearinghouse

## Vision
To build the "Global Data Clearinghouse" for private market data—a secure, immutable message bus where structured data is pushed from Asset Managers (GPs) to Limited Partners (LPs) with perfect audit trails.

## Core Philosophy
- **Structured Data Only:** JSON is the primary citizen. No PDFs.
- **Envelope vs. Payload:** Strict routing controls (Envelope) with flexible data schemas (Payload).
- **Dead Simple:** Minimum viable features to ensure security, identity, and data transport.

---

## User Stories

### 1. Asset Manager (The GP)
*   **Smart Paste:** As a GP, I want to copy a table from Excel and paste it into the "Composer" so that it is instantly converted to a JSON payload without manual coding. ✅
*   **Publish to Network:** As an Asset Manager, I want to define the "Envelope" (Publisher ID, Asset Manager ID, Asset ID) and cryptographically sign the packet with a strict UTC timestamp. (Note: Data Type and Period are flexible metadata, not core routing constraints). ✅
*   **Correction (Append-Only):** As a GP, I want to issue a correction for a previously sent packet, creating a new version (v2) while preserving the original (v1) for the audit trail. ✅
*   **Subscription Management:** As an Asset Manager, I want to issue and manage subscriptions, controlling which LPs can access which assets. ✅
*   **Publishing Rights Management:** As an Asset Manager, I want to grant publishing rights to Fund Admins (Delegates) and manage which organizations can publish data, manage subscriptions, or approve LP service providers for my assets. ✅
*   **Delegation Approval:** As an Asset Manager (GP), I want to optionally require approval for LP delegations at the asset level, ensuring I maintain control over who sees my data. ✅
*   **Excel Templates:** As an Asset Manager, I want to download a basic Excel template with standard headers so I know how to format my data before pasting it. ✅

### 2. Limited Partner (The LP)
*   **Subscription Feeds:** As an LP, I want to view and accept subscription invitations for assets I'm interested in. ✅
*   **The Ledger:** As an LP (or my delegated Analytics Agent), I want a chronological feed of all data events for subscribed assets. ✅
*   **Data View:** As an LP, I want to click a ledger item to view the structured JSON data in a human-readable table format. ✅
*   **Read Receipts:** As a Limited Partner, I understand that viewing a packet generates a "Read Receipt" visible to the Asset Manager, confirming delivery. ✅
*   **Service Provider Access (Delegation Management):** As an LP, I want to delegate access to my data to third-party service providers (auditors, analytics, portfolio managers), with optional GP approval based on asset settings. ✅
*   **Magic Link Onboarding:** As a delegated third-party (e.g., Auditor), I want to access shared data via a secure email link without needing to go through a full platform registration flow. (Simulated in Mock)
*   **Notification Config:** As an LP, I want to configure alerts (Email, Webhook, SMS) based on data type (e.g., "Alert me for Capital Calls, digest for Quarterly Reports"). (Placeholder UI)
*   **Provenance Check:** As an LP, I want to see the cryptographic signature and timestamp for every data packet to verify it hasn't been tampered with. ✅

### 3. Delegate (Fund Admin, Service Provider)
*   **Subscription Viewing:** As a Delegate with publishing rights, I want to view subscriptions for assets I have publishing rights to, even if I can't manage them. ✅
*   **Subscription Management:** As a Delegate with delegated rights, I want to manage subscriptions on behalf of the Asset Manager. ✅
*   **Publish Data:** As a Delegate, I want to compose and publish data packets for assets I have publishing rights to. ✅
*   **History View:** As a Delegate, I want to view the history of published data for assets I manage. ✅

### 4. Waypoint Admin (The Switch Operator)
*   **Identity Registry:** As Admin, I want to verify and approve new Organization entities (Asset Manager/Limited Partner/Delegate) to ensure the network is trusted. ✅
*   **Global Audit:** As Admin, I want a global, immutable log of all transactions (Publish, Access, Delegate) for system health and billing. ✅
*   **Platform IAM:** As Admin, I want to manage Waypoint team members and their permissions. ✅

### 5. Identity and Access Management (IAM)
*   **Organization User Management:** As an Organization Admin, I want to manage users within my organization, including inviting new users and setting admin roles. ✅
*   **Role-Based Access Control:** As a user, I want my permissions to be determined by my role (Platform Admin, Asset Manager, Limited Partner, Delegate) and organization-level admin status. ✅
*   **Permission System:** As the system, I want to enforce permissions at the API level, ensuring users can only access resources they're authorized to view or modify. ✅

---

## Functional Requirements

### A. Authentication & Identity
*   Strict MFA for all users (planned for future phases).
*   Role-Based Access Control (RBAC): Platform Admin, Asset Manager, Limited Partner, Delegate.
*   Organization-level identity verification.
*   Organization-level user management (IAM) for admins.
*   Permission-based API access control.

### B. The "Composer" (Input)
*   Text area accepting Tab-Separated Values (TSV) from Excel/CSV.
*   Real-time conversion to JSON.
*   Preview table for verification before sending.

### C. The "Ledger" (Storage & View)
*   Immutable storage of JSON blobs.
*   Versioning system (v1, v2, v3).
*   **No Deletes:** "Soft delete" or "Revoke" only flags the record as inaccessible, but the cryptographic hash remains.

### D. Notifications
*   User-configurable triggers.
*   Support for Email (SendGrid/AWS SES) and Webhooks (for system-to-system integration).

---

## Out of Scope for Phase 1
*   **Schema Translation:** The system will not validate the *contents* of the JSON, only that it *is* valid JSON.
*   **OCR:** No image upload/scanning. Text/Data paste only.
*   **In-App Chat:** All communication regarding approvals/rejections happens via email notifications.
*   **PDF Generation:** The system does not generate PDFs.
