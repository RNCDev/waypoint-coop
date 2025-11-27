# Waypoint Phase 1: The Digital Clearinghouse

## Vision
To build the "Global Data Clearinghouse" for private market data—a secure, immutable message bus where structured data is pushed from Publisher (GP) to Subscriber (LP) with perfect audit trails.

## Core Philosophy
- **Structured Data Only:** JSON is the primary citizen. No PDFs.
- **Envelope vs. Payload:** Strict routing controls (Envelope) with flexible data schemas (Payload).
- **Dead Simple:** Minimum viable features to ensure security, identity, and data transport.

---

## User Stories

### 1. General Partner (The Publisher)
*   **Smart Paste:** As a GP, I want to copy a table from Excel and paste it into the "Composer" so that it is instantly converted to a JSON payload without manual coding.
*   **Publish to Network:** As a Publisher, I want to define the "Envelope" (Publisher ID, Asset Owner ID, Asset ID) and cryptographically sign the packet with a strict UTC timestamp. (Note: Data Type and Period are flexible metadata, not core routing constraints).
*   **Correction (Append-Only):** As a GP, I want to issue a correction for a previously sent packet, creating a new version (v2) while preserving the original (v1) for the audit trail.
*   **Delegation Approval:** As an Asset Owner (GP), I want to approve or reject an LP's request to delegate access to a third party (e.g., Analytics Agent, Auditor), ensuring I maintain control over who sees my data.
*   **Excel Templates:** As a Publisher, I want to download a basic Excel template with standard headers so I know how to format my data before pasting it.

### 2. Limited Partner (The Subscriber)
*   **The Ledger:** As an LP (or my delegated Analytics Agent), I want a chronological feed of all data events.
*   **Data View:** As an LP, I want to click a ledger item to view the structured JSON data in a human-readable table format.
*   **Read Receipts:** As a Subscriber, I understand that viewing a packet generates a "Read Receipt" visible to the Publisher, confirming delivery.
*   **Magic Link Onboarding:** As a delegated third-party (e.g., Auditor), I want to access shared data via a secure email link without needing to go through a full platform registration flow.
*   **Notification Config:** As an LP, I want to configure alerts (Email, Webhook, SMS) based on data type (e.g., "Alert me for Capital Calls, digest for Quarterly Reports").
*   **Provenance Check:** As an LP, I want to see the cryptographic signature and timestamp for every data packet to verify it hasn't been tampered with.

### 3. Waypoint Admin (The Switch Operator)
*   **Identity Registry:** As Admin, I want to verify and approve new Organization entities (GP/LP) to ensure the network is trusted.
*   **Global Audit:** As Admin, I want a global, immutable log of all transactions (Publish, Access, Delegate) for system health and billing.

---

## Functional Requirements

### A. Authentication & Identity
*   Strict MFA for all users.
*   Role-Based Access Control (RBAC): Admin vs. Viewer.
*   Organization-level identity verification.

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