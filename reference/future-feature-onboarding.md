# Waypoint Onboarding & KYC Verification System

## Feature Status: Future Implementation

**Version:** 1.0  
**Last Updated:** November 2025  
**Author:** Implementation Team  
**Dependencies:** Phase 2+ (requires vLEI integration, external verification services)

---

## 1. Executive Summary

This document specifies the tiered onboarding and Know Your Customer (KYC) verification system for Waypoint Cooperative. Given the sensitivity of data handled by the platform (capital calls, distributions, K-1s with PII, financial statements), institutional-grade identity verification is required before granting access to sensitive operations.

### Core Principle

> **"Register quickly, verify before sensitive operations."**

Users can create accounts and explore the platform immediately, but access to publishing data, managing subscriptions, or approving delegations requires progressive verification.

### Why This Matters

Waypoint handles extremely sensitive private capital market data:

- **Capital Calls/Distributions** – High-value wire instructions (BEC fraud risk)
- **K-1/K-3 Tax Documents** – PII including SSNs, tax IDs, addresses
- **Financial Statements** – Confidential fund performance data
- **Subscription Agreements** – Legal and financial commitments

This requires **institutional-grade verification**, not consumer-level KYC.

---

## 2. Verification Tier Architecture

### 2.1 Tier Definitions

| Tier | Name | Access Level | Verification Requirements |
|------|------|--------------|---------------------------|
| **0** | `REGISTERED` | Dashboard, help docs, profile setup, demo mode | Email + password only |
| **1** | `IDENTITY_VERIFIED` | View envelopes, receive feeds, basic subscriptions, read-only API | Entity verification (LEI, EIN, formation docs) |
| **2** | `FULLY_AUTHORIZED` | Publish envelopes, manage access grants, approve delegations, full API | vLEI credential + enhanced due diligence |

### 2.2 Tier Transition Rules

```
REGISTERED → IDENTITY_VERIFIED
  Trigger: Organization submits required Tier 1 documents
  Process: Automated validation + manual review queue
  SLA: 24-48 hours for standard, 5 business days for complex structures
  Approver: Platform Admin or automated (if all checks pass)

IDENTITY_VERIFIED → FULLY_AUTHORIZED
  Trigger: Organization submits vLEI credential + passes EDD
  Process: vLEI cryptographic verification + AML screening
  SLA: 48-72 hours
  Approver: Platform Admin (manual approval required)

ANY_TIER → SUSPENDED
  Trigger: Failed re-verification, AML alert, fraud detection, manual action
  Process: Immediate access revocation, notification to org
  Restore: Manual review by Platform Admin only
```

### 2.3 Feature Access Matrix

| Feature | REGISTERED | IDENTITY_VERIFIED | FULLY_AUTHORIZED |
|---------|------------|-------------------|------------------|
| View dashboard | ✅ | ✅ | ✅ |
| Edit organization profile | ✅ | ✅ | ✅ |
| Invite users to organization | ❌ | ✅ | ✅ |
| View envelopes (own subscriptions) | ❌ | ✅ | ✅ |
| Mark envelopes as read | ❌ | ✅ | ✅ |
| Subscribe to assets | ❌ | ✅ | ✅ |
| Create access grants | ❌ | ❌ | ✅ |
| Approve LP delegations | ❌ | ❌ | ✅ |
| Publish envelopes | ❌ | ❌ | ✅ |
| Issue corrections | ❌ | ❌ | ✅ |
| Manage subscriptions (as GP) | ❌ | ❌ | ✅ |
| API read access | ❌ | ✅ | ✅ |
| API write access | ❌ | ❌ | ✅ |
| View audit logs | ❌ | ✅ | ✅ |
| Access Registry (admin) | ❌ | ❌ | ✅ (Platform Admin only) |

---

## 3. Data Collection Requirements

### 3.1 Tier 0: Registration (Minimal)

```typescript
interface RegistrationData {
  // Organization basics
  organizationName: string;           // Display name
  organizationType: OrganizationType; // GP, LP, FUND_ADMIN, AUDITOR, etc.
  
  // Primary contact
  contactEmail: string;               // Verified via email confirmation
  contactName: string;
  
  // Authentication
  password: string;                   // Min 12 chars, complexity requirements
  
  // Legal
  tosAcceptedAt: Date;
  privacyPolicyAcceptedAt: Date;
}
```

### 3.2 Tier 1: Identity Verification

#### 3.2.1 Organization Data

```typescript
interface OrganizationVerificationData {
  // Legal Identity
  legalName: string;                  // Exact legal name as registered
  lei: string;                        // 20-character ISO 17442 LEI
  leiStatus: 'ISSUED' | 'LAPSED';     // Validated via GLEIF API
  
  // Tax Identity (US)
  ein?: string;                       // 9-digit EIN (XX-XXXXXXX format)
  einVerified: boolean;               // IRS TIN matching result
  
  // Tax Identity (Non-US)
  foreignTaxId?: string;
  foreignTaxJurisdiction?: string;    // ISO 3166-1 alpha-2 country code
  
  // Formation
  formationJurisdiction: string;      // e.g., "US-DE" for Delaware
  formationDate: Date;
  entityType: EntityType;             // LLC, LP, CORP, etc.
  
  // Address
  principalAddress: Address;
  registeredAgentAddress?: Address;   // If different
  
  // Regulatory (if applicable)
  secRegistrationNumber?: string;     // For registered investment advisers
  nfaId?: string;                     // For commodity pool operators
}

interface Address {
  street1: string;
  street2?: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;                    // ISO 3166-1 alpha-2
}

enum EntityType {
  LLC = 'LLC',
  LP = 'LP',
  LLP = 'LLP',
  CORPORATION = 'CORPORATION',
  S_CORP = 'S_CORP',
  TRUST = 'TRUST',
  SOVEREIGN = 'SOVEREIGN',           // Sovereign wealth funds
  PENSION = 'PENSION',               // Pension funds
  ENDOWMENT = 'ENDOWMENT',
  OTHER = 'OTHER'
}
```

#### 3.2.2 Beneficial Ownership Data

Required for all entities. Collect for individuals with ≥25% ownership or significant control.

```typescript
interface BeneficialOwner {
  id: string;
  organizationId: string;
  
  // Identity
  fullLegalName: string;
  dateOfBirth: Date;                  // Encrypted at rest
  citizenship: string;                // ISO 3166-1 alpha-2
  
  // Tax (US persons)
  ssn?: string;                       // Encrypted at rest, 9 digits
  itin?: string;                      // For non-resident aliens
  
  // Tax (Non-US persons)
  foreignTaxId?: string;
  foreignTaxCountry?: string;
  
  // Address
  residentialAddress: Address;
  
  // Ownership
  ownershipPercentage: number;        // 0-100
  controlType: ControlType;
  
  // Verification
  idDocumentType: IdDocumentType;
  idDocumentNumber: string;           // Encrypted
  idDocumentCountry: string;
  idDocumentExpiry: Date;
  idVerificationStatus: VerificationStatus;
  idVerifiedAt?: Date;
  
  // PEP/Sanctions
  isPEP: boolean;                     // Politically Exposed Person
  pepDetails?: string;
  sanctionsScreeningResult: ScreeningResult;
  sanctionsScreenedAt?: Date;
}

enum ControlType {
  OWNERSHIP = 'OWNERSHIP',            // Direct ownership ≥25%
  CONTROL = 'CONTROL',                // Significant control without ownership
  SENIOR_OFFICER = 'SENIOR_OFFICER',  // CEO, CFO, etc.
  OTHER = 'OTHER'
}

enum IdDocumentType {
  PASSPORT = 'PASSPORT',
  DRIVERS_LICENSE = 'DRIVERS_LICENSE',
  NATIONAL_ID = 'NATIONAL_ID',
  RESIDENCE_PERMIT = 'RESIDENCE_PERMIT'
}

enum VerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED'
}

enum ScreeningResult {
  CLEAR = 'CLEAR',
  MATCH = 'MATCH',                    // Requires manual review
  PENDING = 'PENDING',
  ERROR = 'ERROR'
}
```

#### 3.2.3 Required Documents (Tier 1)

```typescript
interface KYCDocument {
  id: string;
  organizationId: string;
  
  documentType: DocumentType;
  fileName: string;
  fileSize: number;
  mimeType: string;
  
  // Storage (encrypted at rest)
  storageUrl: string;                 // S3/GCS signed URL
  encryptionKeyId: string;            // KMS key reference
  
  // Verification
  uploadedAt: Date;
  uploadedBy: string;                 // User ID
  verificationStatus: VerificationStatus;
  verifiedAt?: Date;
  verifiedBy?: string;                // Admin user ID
  rejectionReason?: string;
  
  // Metadata
  documentDate?: Date;                // Date on the document
  expiryDate?: Date;                  // For IDs, certifications
  extractedData?: Record<string, any>; // OCR results
}

enum DocumentType {
  // Formation Documents
  ARTICLES_OF_INCORPORATION = 'ARTICLES_OF_INCORPORATION',
  CERTIFICATE_OF_FORMATION = 'CERTIFICATE_OF_FORMATION',
  CERTIFICATE_OF_GOOD_STANDING = 'CERTIFICATE_OF_GOOD_STANDING',
  OPERATING_AGREEMENT = 'OPERATING_AGREEMENT',
  PARTNERSHIP_AGREEMENT = 'PARTNERSHIP_AGREEMENT',
  BYLAWS = 'BYLAWS',
  
  // Tax Documents
  IRS_LETTER_147C = 'IRS_LETTER_147C',           // EIN confirmation
  W9 = 'W9',
  W8_BEN_E = 'W8_BEN_E',                         // Foreign entity
  
  // Identity Documents (for UBOs)
  PASSPORT = 'PASSPORT',
  DRIVERS_LICENSE = 'DRIVERS_LICENSE',
  UTILITY_BILL = 'UTILITY_BILL',                 // Proof of address
  BANK_STATEMENT = 'BANK_STATEMENT',             // Proof of address
  
  // Authorization
  BOARD_RESOLUTION = 'BOARD_RESOLUTION',         // Authorizing platform use
  AUTHORIZED_SIGNATORY_LIST = 'AUTHORIZED_SIGNATORY_LIST',
  POWER_OF_ATTORNEY = 'POWER_OF_ATTORNEY',
  
  // Regulatory
  SEC_FORM_ADV = 'SEC_FORM_ADV',
  FUND_PROSPECTUS = 'FUND_PROSPECTUS',
  
  // Other
  OTHER = 'OTHER'
}
```

### 3.3 Tier 2: Full Authorization

#### 3.3.1 vLEI Credential

The Verifiable Legal Entity Identifier (vLEI) is a cryptographically verifiable credential that provides organizational identity assurance. It is issued by Qualified vLEI Issuers (QVIs) under the governance of GLEIF.

```typescript
interface VLEICredential {
  organizationId: string;
  
  // Credential Data (ACDC format)
  credentialJson: string;             // Full ACDC credential
  credentialDigest: string;           // SHA-256 hash
  
  // Parsed Fields
  lei: string;                        // Must match organization LEI
  issuerId: string;                   // QVI (Qualified vLEI Issuer) ID
  issuerName: string;
  
  // Validity
  issuedAt: Date;
  expiresAt: Date;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  
  // Verification
  signatureValid: boolean;
  chainValid: boolean;                // Full chain to GLEIF root
  verifiedAt: Date;
  
  // Role Credentials (optional, for authorized representatives)
  roleCredentials?: VLEIRoleCredential[];
}

interface VLEIRoleCredential {
  personLei: string;                  // Individual's LEI credential
  personName: string;
  role: string;                       // e.g., "Official Organizational Role"
  permissions: string[];              // Specific authorities granted
  issuedAt: Date;
  expiresAt: Date;
}
```

#### 3.3.2 Enhanced Due Diligence (EDD)

Required for Tier 2 and triggered automatically for high-risk entities.

```typescript
interface EnhancedDueDiligence {
  organizationId: string;
  
  // Risk Assessment
  riskScore: number;                  // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'PROHIBITED';
  riskFactors: RiskFactor[];
  
  // Source of Funds
  primaryBusinessActivity: string;
  expectedTransactionVolume: string;  // Range bucket
  sourceOfFundsDescription: string;
  sourceOfFundsDocumentation?: string; // Document ID reference
  
  // AML Screening
  amlScreeningProvider: string;       // e.g., "ComplyAdvantage"
  amlScreeningId: string;             // External reference
  amlScreeningResult: ScreeningResult;
  amlScreeningDate: Date;
  amlAlerts?: AMLAlert[];
  
  // Sanctions Screening
  sanctionsLists: string[];           // Lists checked: OFAC, EU, UN, etc.
  sanctionsResult: ScreeningResult;
  sanctionsScreeningDate: Date;
  
  // Adverse Media
  adverseMediaResult: ScreeningResult;
  adverseMediaFindings?: string[];
  
  // Review
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ESCALATED';
}

interface RiskFactor {
  factor: string;
  weight: number;
  description: string;
}

interface AMLAlert {
  alertId: string;
  alertType: string;
  matchedEntity: string;
  matchScore: number;
  disposition: 'TRUE_MATCH' | 'FALSE_POSITIVE' | 'PENDING';
  dispositionBy?: string;
  dispositionAt?: Date;
}
```

#### 3.3.3 High-Risk Triggers

Automatic EDD triggers (configurable):

```typescript
const HIGH_RISK_TRIGGERS = {
  // Jurisdiction-based (FATF high-risk and monitored jurisdictions)
  highRiskCountries: [
    'AF', 'BY', 'MM', 'CF', 'CU', 'CD', 'IR', 'IQ', 'LB', 'LY',
    'ML', 'NI', 'KP', 'RU', 'SO', 'SS', 'SD', 'SY', 'VE', 'YE', 'ZW'
  ],
  
  // Entity type-based
  highRiskEntityTypes: [
    'TRUST',           // Shell company risk
    'SOVEREIGN',       // PEP exposure
    'OTHER'            // Unknown structures
  ],
  
  // Ownership-based
  complexOwnershipThreshold: 4,       // More than 4 ownership layers
  anonymousOwnershipPresent: true,    // Bearer shares, nominees
  
  // Transaction-based
  expectedVolumeThreshold: 50000000,  // $50M+ expected annual volume
  
  // PEP-related
  pepOwnershipThreshold: 10,          // Any UBO with >10% who is PEP
};
```

### 3.4 Data NOT Collected

Based on industry best practices, the following are explicitly NOT part of standard KYC:

| Data Type | Reason for Exclusion |
|-----------|---------------------|
| **MAC Addresses** | Not standard KYC practice; easily spoofed; provides no identity verification value; raises privacy concerns |
| Device fingerprinting | Useful for fraud detection but not identity verification |
| Social media profiles | Not appropriate for institutional finance verification |
| Biometric data storage | Privacy risk; use verification services that don't retain biometrics |

---

## 4. Database Schema Extensions

### 4.1 Prisma Schema Additions

```prisma
// Add to existing schema.prisma

// ============================================
// VERIFICATION & KYC MODELS
// ============================================

enum VerificationTier {
  REGISTERED
  IDENTITY_VERIFIED
  FULLY_AUTHORIZED
  SUSPENDED
}

enum VerificationStatus {
  PENDING
  VERIFIED
  FAILED
  EXPIRED
}

enum DocumentType {
  ARTICLES_OF_INCORPORATION
  CERTIFICATE_OF_FORMATION
  CERTIFICATE_OF_GOOD_STANDING
  OPERATING_AGREEMENT
  PARTNERSHIP_AGREEMENT
  BYLAWS
  IRS_LETTER_147C
  W9
  W8_BEN_E
  PASSPORT
  DRIVERS_LICENSE
  UTILITY_BILL
  BANK_STATEMENT
  BOARD_RESOLUTION
  AUTHORIZED_SIGNATORY_LIST
  POWER_OF_ATTORNEY
  SEC_FORM_ADV
  FUND_PROSPECTUS
  OTHER
}

enum EntityType {
  LLC
  LP
  LLP
  CORPORATION
  S_CORP
  TRUST
  SOVEREIGN
  PENSION
  ENDOWMENT
  OTHER
}

enum ControlType {
  OWNERSHIP
  CONTROL
  SENIOR_OFFICER
  OTHER
}

enum ScreeningResult {
  CLEAR
  MATCH
  PENDING
  ERROR
}

enum RiskLevel {
  LOW
  MEDIUM
  HIGH
  PROHIBITED
}

// Extend existing Organization model
model Organization {
  id          String           @id @default(cuid())
  name        String
  type        OrganizationType
  
  // ... existing fields ...
  
  // === NEW: Verification Status ===
  verificationTier      VerificationTier @default(REGISTERED)
  verificationUpdatedAt DateTime?
  verificationUpdatedBy String?
  
  // === NEW: Legal Identity ===
  legalName             String?
  lei                   String?          @unique
  leiStatus             String?          // ISSUED, LAPSED
  leiVerifiedAt         DateTime?
  
  // === NEW: Tax Identity ===
  ein                   String?          // Encrypted
  einVerified           Boolean          @default(false)
  foreignTaxId          String?          // Encrypted
  foreignTaxJurisdiction String?
  
  // === NEW: Formation ===
  formationJurisdiction String?
  formationDate         DateTime?
  entityType            EntityType?
  
  // === NEW: Address ===
  streetAddress1        String?
  streetAddress2        String?
  city                  String?
  stateProvince         String?
  postalCode            String?
  country               String?
  
  // === NEW: Regulatory ===
  secRegistrationNumber String?
  nfaId                 String?
  
  // === NEW: vLEI ===
  vleiCredential        VLEICredential?
  
  // === NEW: Relations ===
  beneficialOwners      BeneficialOwner[]
  kycDocuments          KYCDocument[]
  eddRecords            EnhancedDueDiligence[]
  verificationHistory   VerificationEvent[]
  
  // ... existing relations ...
}

model BeneficialOwner {
  id                    String           @id @default(cuid())
  organizationId        String
  organization          Organization     @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  // Identity
  fullLegalName         String
  dateOfBirth           DateTime         // Encrypted
  citizenship           String
  
  // Tax (encrypted)
  ssn                   String?
  itin                  String?
  foreignTaxId          String?
  foreignTaxCountry     String?
  
  // Address
  streetAddress1        String
  streetAddress2        String?
  city                  String
  stateProvince         String
  postalCode            String
  country               String
  
  // Ownership
  ownershipPercentage   Float
  controlType           ControlType
  
  // ID Verification
  idDocumentType        String
  idDocumentNumber      String           // Encrypted
  idDocumentCountry     String
  idDocumentExpiry      DateTime?
  idVerificationStatus  VerificationStatus @default(PENDING)
  idVerifiedAt          DateTime?
  idVerificationRef     String?          // External provider reference
  
  // PEP/Sanctions
  isPEP                 Boolean          @default(false)
  pepDetails            String?
  sanctionsResult       ScreeningResult  @default(PENDING)
  sanctionsScreenedAt   DateTime?
  sanctionsRef          String?          // External provider reference
  
  // Metadata
  createdAt             DateTime         @default(now())
  updatedAt             DateTime         @updatedAt
  
  @@index([organizationId])
}

model KYCDocument {
  id                    String           @id @default(cuid())
  organizationId        String
  organization          Organization     @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  // Document Info
  documentType          DocumentType
  fileName              String
  fileSize              Int
  mimeType              String
  
  // Storage
  storageProvider       String           @default("s3")
  storageBucket         String
  storageKey            String
  encryptionKeyId       String
  
  // Verification
  verificationStatus    VerificationStatus @default(PENDING)
  verifiedAt            DateTime?
  verifiedBy            String?
  rejectionReason       String?
  
  // Document Metadata
  documentDate          DateTime?
  expiryDate            DateTime?
  extractedData         Json?            // OCR/parsing results
  
  // Audit
  uploadedAt            DateTime         @default(now())
  uploadedBy            String
  
  @@index([organizationId])
  @@index([documentType])
  @@index([verificationStatus])
}

model VLEICredential {
  id                    String           @id @default(cuid())
  organizationId        String           @unique
  organization          Organization     @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  // Credential
  credentialJson        String           @db.Text
  credentialDigest      String
  
  // Parsed
  lei                   String
  issuerId              String
  issuerName            String
  
  // Validity
  issuedAt              DateTime
  expiresAt             DateTime
  status                String           @default("ACTIVE")
  
  // Verification
  signatureValid        Boolean
  chainValid            Boolean
  verifiedAt            DateTime
  
  // Role Credentials
  roleCredentials       Json?
  
  createdAt             DateTime         @default(now())
  updatedAt             DateTime         @updatedAt
}

model EnhancedDueDiligence {
  id                    String           @id @default(cuid())
  organizationId        String
  organization          Organization     @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  // Risk Assessment
  riskScore             Int
  riskLevel             RiskLevel
  riskFactors           Json
  
  // Source of Funds
  primaryBusinessActivity    String?
  expectedTransactionVolume  String?
  sourceOfFundsDescription   String?       @db.Text
  sourceOfFundsDocId         String?
  
  // AML Screening
  amlProvider           String?
  amlExternalId         String?
  amlResult             ScreeningResult  @default(PENDING)
  amlScreenedAt         DateTime?
  amlAlerts             Json?
  
  // Sanctions
  sanctionsLists        Json             @default("[]")
  sanctionsResult       ScreeningResult  @default(PENDING)
  sanctionsScreenedAt   DateTime?
  
  // Adverse Media
  adverseMediaResult    ScreeningResult  @default(PENDING)
  adverseMediaFindings  Json?
  
  // Review
  reviewedBy            String?
  reviewedAt            DateTime?
  reviewNotes           String?          @db.Text
  approvalStatus        String           @default("PENDING")
  
  createdAt             DateTime         @default(now())
  updatedAt             DateTime         @updatedAt
  
  @@index([organizationId])
  @@index([approvalStatus])
}

model VerificationEvent {
  id                    String           @id @default(cuid())
  organizationId        String
  organization          Organization     @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  // Event
  eventType             String           // TIER_CHANGE, DOCUMENT_UPLOADED, REVIEW_COMPLETED, etc.
  previousTier          VerificationTier?
  newTier               VerificationTier?
  
  // Details
  description           String
  metadata              Json?
  
  // Actor
  performedBy           String?          // User ID or "SYSTEM"
  performedAt           DateTime         @default(now())
  
  @@index([organizationId])
  @@index([eventType])
  @@index([performedAt])
}
```

### 4.2 Encryption Requirements

**Fields requiring encryption at rest:**

| Table | Field | Encryption Method |
|-------|-------|-------------------|
| `Organization` | `ein` | AES-256-GCM via KMS |
| `Organization` | `foreignTaxId` | AES-256-GCM via KMS |
| `BeneficialOwner` | `dateOfBirth` | AES-256-GCM via KMS |
| `BeneficialOwner` | `ssn` | AES-256-GCM via KMS |
| `BeneficialOwner` | `itin` | AES-256-GCM via KMS |
| `BeneficialOwner` | `foreignTaxId` | AES-256-GCM via KMS |
| `BeneficialOwner` | `idDocumentNumber` | AES-256-GCM via KMS |
| `KYCDocument` | File contents | AES-256-GCM (S3 SSE-KMS) |
| `VLEICredential` | `credentialJson` | AES-256-GCM via KMS |

**Implementation:**

```typescript
// lib/encryption.ts

import { KMSClient, EncryptCommand, DecryptCommand } from '@aws-sdk/client-kms';

const kms = new KMSClient({ region: process.env.AWS_REGION });
const KYC_KEY_ID = process.env.KYC_ENCRYPTION_KEY_ID;

export async function encryptPII(plaintext: string): Promise<string> {
  const command = new EncryptCommand({
    KeyId: KYC_KEY_ID,
    Plaintext: Buffer.from(plaintext),
    EncryptionContext: {
      purpose: 'kyc-pii',
    },
  });
  
  const response = await kms.send(command);
  return Buffer.from(response.CiphertextBlob!).toString('base64');
}

export async function decryptPII(ciphertext: string): Promise<string> {
  const command = new DecryptCommand({
    CiphertextBlob: Buffer.from(ciphertext, 'base64'),
    EncryptionContext: {
      purpose: 'kyc-pii',
    },
  });
  
  const response = await kms.send(command);
  return Buffer.from(response.Plaintext!).toString('utf-8');
}
```

---

## 5. API Endpoints

### 5.1 Verification Management APIs

```typescript
// API Route Structure

// === TIER MANAGEMENT ===

// GET /api/verification/status
// Returns current organization verification status and requirements
interface VerificationStatusResponse {
  organizationId: string;
  currentTier: VerificationTier;
  nextTier: VerificationTier | null;
  requirements: TierRequirement[];
  completedRequirements: string[];
  pendingRequirements: string[];
  blockers: string[];
}

// POST /api/verification/submit-for-review
// Submits organization for tier upgrade review
interface SubmitForReviewRequest {
  targetTier: 'IDENTITY_VERIFIED' | 'FULLY_AUTHORIZED';
  attestations: {
    accuracyAttested: boolean;
    authorizedToSubmit: boolean;
    termsAccepted: boolean;
  };
}

// === BENEFICIAL OWNERS ===

// GET /api/verification/beneficial-owners
// POST /api/verification/beneficial-owners
// PUT /api/verification/beneficial-owners/[id]
// DELETE /api/verification/beneficial-owners/[id]

interface BeneficialOwnerRequest {
  fullLegalName: string;
  dateOfBirth: string;            // ISO 8601
  citizenship: string;
  ownershipPercentage: number;
  controlType: ControlType;
  residentialAddress: Address;
  taxInfo: {
    ssn?: string;
    itin?: string;
    foreignTaxId?: string;
    foreignTaxCountry?: string;
  };
}

// === DOCUMENTS ===

// GET /api/verification/documents
// Returns list of uploaded documents and their status

// POST /api/verification/documents/upload
// Uploads a new KYC document
interface DocumentUploadRequest {
  documentType: DocumentType;
  file: File;                     // Multipart form data
  documentDate?: string;
  expiryDate?: string;
}

// DELETE /api/verification/documents/[id]
// Removes a pending document (cannot delete verified documents)

// GET /api/verification/documents/[id]/download
// Returns signed URL for document download (authorized users only)

// === vLEI ===

// POST /api/verification/vlei/submit
// Submits vLEI credential for verification
interface VLEISubmitRequest {
  credentialJson: string;         // Full ACDC credential
}

// GET /api/verification/vlei/status
// Returns vLEI verification status

// === LEI LOOKUP ===

// GET /api/verification/lei/lookup?lei=[LEI]
// Validates LEI against GLEIF and returns entity data
interface LEILookupResponse {
  valid: boolean;
  lei: string;
  legalName: string;
  status: 'ISSUED' | 'LAPSED' | 'PENDING' | 'RETIRED';
  jurisdiction: string;
  registrationDate: string;
  lastUpdateDate: string;
  managingLou: string;
}

// === ADMIN ENDPOINTS ===

// GET /api/admin/verification/queue
// Returns organizations pending review
interface VerificationQueueResponse {
  items: {
    organizationId: string;
    organizationName: string;
    currentTier: VerificationTier;
    requestedTier: VerificationTier;
    submittedAt: Date;
    riskLevel: RiskLevel;
    requiresManualReview: boolean;
  }[];
  total: number;
}

// POST /api/admin/verification/[orgId]/approve
// Approves tier upgrade
interface ApproveRequest {
  tier: VerificationTier;
  notes?: string;
}

// POST /api/admin/verification/[orgId]/reject
// Rejects tier upgrade
interface RejectRequest {
  reason: string;
  requiredActions?: string[];
}

// POST /api/admin/verification/[orgId]/suspend
// Suspends organization
interface SuspendRequest {
  reason: string;
  notifyOrganization: boolean;
}

// POST /api/admin/verification/[orgId]/reinstate
// Reinstates suspended organization
interface ReinstateRequest {
  toTier: VerificationTier;
  notes: string;
}
```

### 5.2 Permission Middleware

```typescript
// lib/verification-middleware.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type TierRequirement = 'REGISTERED' | 'IDENTITY_VERIFIED' | 'FULLY_AUTHORIZED';

export function requireTier(minimumTier: TierRequirement) {
  return async function middleware(
    request: NextRequest,
    context: { params: { orgId: string } }
  ) {
    const { orgId } = context.params;
    
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { verificationTier: true, name: true },
    });
    
    if (!org) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }
    
    const tierHierarchy: Record<TierRequirement, number> = {
      REGISTERED: 0,
      IDENTITY_VERIFIED: 1,
      FULLY_AUTHORIZED: 2,
    };
    
    const currentLevel = tierHierarchy[org.verificationTier as TierRequirement] ?? -1;
    const requiredLevel = tierHierarchy[minimumTier];
    
    if (org.verificationTier === 'SUSPENDED') {
      return NextResponse.json(
        {
          error: 'Organization suspended',
          code: 'ORG_SUSPENDED',
          message: 'This organization has been suspended. Contact support for assistance.',
        },
        { status: 403 }
      );
    }
    
    if (currentLevel < requiredLevel) {
      return NextResponse.json(
        {
          error: 'Insufficient verification',
          code: 'VERIFICATION_REQUIRED',
          currentTier: org.verificationTier,
          requiredTier: minimumTier,
          message: `This action requires ${minimumTier} status. Current status: ${org.verificationTier}`,
          upgradeUrl: '/settings/verification',
        },
        { status: 403 }
      );
    }
    
    // Tier requirement met, continue
    return null;
  };
}

// Usage in API routes:
// 
// export async function POST(request: NextRequest, context) {
//   const tierCheck = await requireTier('FULLY_AUTHORIZED')(request, context);
//   if (tierCheck) return tierCheck;
//   
//   // ... rest of handler
// }
```

---

## 6. External Service Integrations

### 6.1 GLEIF LEI Lookup

The Global Legal Entity Identifier Foundation (GLEIF) provides a free API for validating Legal Entity Identifiers.

```typescript
// lib/integrations/gleif.ts

const GLEIF_API_BASE = 'https://api.gleif.org/api/v1';

interface GLEIFEntity {
  id: string;
  type: string;
  attributes: {
    lei: string;
    entity: {
      legalName: { name: string };
      legalAddress: {
        addressLines: string[];
        city: string;
        region: string;
        country: string;
        postalCode: string;
      };
      jurisdiction: string;
      status: string;
      legalForm: { id: string };
    };
    registration: {
      initialRegistrationDate: string;
      lastUpdateDate: string;
      status: string;
      managingLou: string;
    };
  };
}

export async function lookupLEI(lei: string): Promise<GLEIFEntity | null> {
  // Validate LEI format (20 alphanumeric characters)
  if (!/^[A-Z0-9]{20}$/.test(lei)) {
    throw new Error('Invalid LEI format');
  }
  
  const response = await fetch(`${GLEIF_API_BASE}/lei-records/${lei}`, {
    headers: {
      'Accept': 'application/vnd.api+json',
    },
  });
  
  if (response.status === 404) {
    return null;
  }
  
  if (!response.ok) {
    throw new Error(`GLEIF API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.data as GLEIFEntity;
}

export async function validateLEI(lei: string): Promise<{
  valid: boolean;
  status?: string;
  legalName?: string;
  jurisdiction?: string;
}> {
  const entity = await lookupLEI(lei);
  
  if (!entity) {
    return { valid: false };
  }
  
  return {
    valid: true,
    status: entity.attributes.registration.status,
    legalName: entity.attributes.entity.legalName.name,
    jurisdiction: entity.attributes.entity.jurisdiction,
  };
}
```

### 6.2 Identity Verification Provider

For UBO identity verification, integrate with a provider like Jumio, Onfido, or Persona.

```typescript
// lib/integrations/identity-verification.ts

interface IdentityVerificationConfig {
  provider: 'jumio' | 'onfido' | 'persona';
  apiKey: string;
  apiSecret: string;
  webhookSecret: string;
}

interface VerificationSession {
  sessionId: string;
  sessionUrl: string;           // URL to redirect user to
  expiresAt: Date;
}

interface VerificationResult {
  sessionId: string;
  status: 'PASSED' | 'FAILED' | 'NEEDS_REVIEW';
  documentType: string;
  documentNumber: string;
  documentCountry: string;
  documentExpiry?: Date;
  extractedName: string;
  extractedDob?: Date;
  faceMatchScore?: number;
  rejectionReasons?: string[];
}

export interface IdentityVerificationProvider {
  createSession(beneficialOwnerId: string, returnUrl: string): Promise<VerificationSession>;
  getResult(sessionId: string): Promise<VerificationResult>;
  handleWebhook(payload: unknown, signature: string): Promise<VerificationResult>;
}

// Example: Jumio implementation
export class JumioProvider implements IdentityVerificationProvider {
  private apiKey: string;
  private apiSecret: string;
  
  constructor(config: IdentityVerificationConfig) {
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
  }
  
  async createSession(beneficialOwnerId: string, returnUrl: string): Promise<VerificationSession> {
    const response = await fetch('https://netverify.com/api/v4/initiate', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64')}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Waypoint/1.0',
      },
      body: JSON.stringify({
        customerInternalReference: beneficialOwnerId,
        successUrl: returnUrl,
        errorUrl: `${returnUrl}?error=true`,
        workflowId: 100, // ID + Selfie workflow
      }),
    });
    
    const data = await response.json();
    
    return {
      sessionId: data.transactionReference,
      sessionUrl: data.redirectUrl,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    };
  }
  
  async getResult(sessionId: string): Promise<VerificationResult> {
    // Implementation...
    throw new Error('Not implemented');
  }
  
  async handleWebhook(payload: unknown, signature: string): Promise<VerificationResult> {
    // Implementation...
    throw new Error('Not implemented');
  }
}
```

### 6.3 AML/Sanctions Screening Provider

For AML and sanctions screening, integrate with a provider like ComplyAdvantage, Refinitiv, or Dow Jones.

```typescript
// lib/integrations/aml-screening.ts

interface AMLScreeningConfig {
  provider: 'complyadvantage' | 'refinitiv' | 'dow_jones';
  apiKey: string;
}

interface ScreeningRequest {
  searchTerm: string;                // Entity or individual name
  type: 'company' | 'person';
  birthYear?: number;                // For individuals
  countries?: string[];              // ISO country codes
  filters: {
    types: ('sanction' | 'pep' | 'adverse-media' | 'warning')[];
  };
}

interface ScreeningMatch {
  matchId: string;
  matchScore: number;                // 0-100
  matchedName: string;
  matchTypes: string[];
  sources: {
    name: string;
    url?: string;
    listingDate?: Date;
  }[];
  pep?: {
    class: string;                   // e.g., "Head of State"
    country: string;
  };
  sanction?: {
    authority: string;
    program: string;
    listingDate: Date;
  };
}

interface ScreeningResult {
  searchId: string;
  status: 'no_match' | 'potential_match' | 'true_match';
  totalMatches: number;
  matches: ScreeningMatch[];
}

export interface AMLScreeningProvider {
  screen(request: ScreeningRequest): Promise<ScreeningResult>;
  getSearch(searchId: string): Promise<ScreeningResult>;
  monitorEntity(entityId: string, request: ScreeningRequest): Promise<string>; // Returns monitor ID
  removeMonitor(monitorId: string): Promise<void>;
}

// Example: ComplyAdvantage implementation
export class ComplyAdvantageProvider implements AMLScreeningProvider {
  private apiKey: string;
  
  constructor(config: AMLScreeningConfig) {
    this.apiKey = config.apiKey;
  }
  
  async screen(request: ScreeningRequest): Promise<ScreeningResult> {
    const response = await fetch('https://api.complyadvantage.com/searches', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        search_term: request.searchTerm,
        client_ref: `waypoint-${Date.now()}`,
        search_type: request.type,
        fuzziness: 0.6,
        filters: {
          types: request.filters.types,
          birth_year: request.birthYear,
          countries: request.countries,
        },
      }),
    });
    
    const data = await response.json();
    
    return {
      searchId: data.content.data.id,
      status: data.content.data.total_hits === 0 ? 'no_match' : 'potential_match',
      totalMatches: data.content.data.total_hits,
      matches: data.content.data.hits.map(this.mapMatch),
    };
  }
  
  private mapMatch(hit: any): ScreeningMatch {
    // Map provider response to our interface
    return {
      matchId: hit.id,
      matchScore: hit.match_score || 0,
      matchedName: hit.name,
      matchTypes: hit.types || [],
      sources: hit.sources || [],
    };
  }
  
  async getSearch(searchId: string): Promise<ScreeningResult> {
    throw new Error('Not implemented');
  }
  
  async monitorEntity(entityId: string, request: ScreeningRequest): Promise<string> {
    throw new Error('Not implemented');
  }
  
  async removeMonitor(monitorId: string): Promise<void> {
    throw new Error('Not implemented');
  }
}
```

### 6.4 vLEI Credential Verification

vLEI credentials are based on the KERI (Key Event Receipt Infrastructure) and ACDC (Authentic Chained Data Containers) specifications.

```typescript
// lib/integrations/vlei.ts

// Note: This uses the signify-ts library for KERI/ACDC operations
// import { Serder, verifySignature } from 'signify-ts';

interface VLEIVerificationResult {
  valid: boolean;
  lei: string;
  issuerId: string;
  issuerName: string;
  issuedAt: Date;
  expiresAt: Date;
  signatureValid: boolean;
  chainValid: boolean;
  errors: string[];
}

export async function verifyVLEICredential(
  credentialJson: string
): Promise<VLEIVerificationResult> {
  const errors: string[] = [];
  
  try {
    const credential = JSON.parse(credentialJson);
    
    // 1. Parse the ACDC credential
    // const serder = new Serder(credential);
    
    // 2. Verify the signature
    // const signatureValid = await verifySignature(serder);
    const signatureValid = true; // Placeholder
    if (!signatureValid) {
      errors.push('Invalid credential signature');
    }
    
    // 3. Verify the issuance chain back to GLEIF root
    const chainValid = await verifyIssuanceChain(credential);
    if (!chainValid) {
      errors.push('Invalid issuance chain');
    }
    
    // 4. Check expiration
    const expiresAt = new Date(credential.a?.dt || Date.now());
    if (expiresAt < new Date()) {
      errors.push('Credential has expired');
    }
    
    // 5. Extract LEI and issuer info
    const lei = credential.a?.LEI || '';
    const issuerId = credential.i || '';
    
    // 6. Verify LEI is valid in GLEIF
    const { validateLEI } = await import('./gleif');
    const leiResult = await validateLEI(lei);
    if (!leiResult.valid) {
      errors.push('LEI not found in GLEIF registry');
    }
    
    return {
      valid: errors.length === 0,
      lei,
      issuerId,
      issuerName: credential.a?.issuerName || 'Unknown QVI',
      issuedAt: new Date(credential.a?.issuedAt || Date.now()),
      expiresAt,
      signatureValid,
      chainValid,
      errors,
    };
  } catch (error) {
    return {
      valid: false,
      lei: '',
      issuerId: '',
      issuerName: '',
      issuedAt: new Date(),
      expiresAt: new Date(),
      signatureValid: false,
      chainValid: false,
      errors: [`Failed to parse credential: ${(error as Error).message}`],
    };
  }
}

async function verifyIssuanceChain(credential: any): Promise<boolean> {
  // Traverse the credential chain:
  // vLEI Credential -> QVI Credential -> GLEIF Root
  // Each step must have valid signatures
  
  // Implementation depends on KERI/ACDC infrastructure
  // This is a placeholder for the actual chain verification
  
  return true; // Placeholder
}
```

---

## 7. Verification Workflows

### 7.1 Automated Verification Flow (Tier 1)

```typescript
// lib/verification/tier1-workflow.ts

interface Tier1CheckResult {
  passed: boolean;
  checks: {
    name: string;
    status: 'PASSED' | 'FAILED' | 'SKIPPED';
    message?: string;
  }[];
  requiresManualReview: boolean;
  riskLevel: RiskLevel;
}

export async function runTier1Verification(
  organizationId: string
): Promise<Tier1CheckResult> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      beneficialOwners: true,
      kycDocuments: true,
    },
  });
  
  if (!org) {
    throw new Error('Organization not found');
  }
  
  const checks: Tier1CheckResult['checks'] = [];
  let requiresManualReview = false;
  
  // Check 1: LEI Validation
  if (org.lei) {
    const leiResult = await validateLEI(org.lei);
    checks.push({
      name: 'LEI_VALIDATION',
      status: leiResult.valid && leiResult.status === 'ISSUED' ? 'PASSED' : 'FAILED',
      message: leiResult.valid ? undefined : 'LEI not found or lapsed',
    });
    
    // Verify legal name matches
    if (leiResult.legalName && leiResult.legalName !== org.legalName) {
      checks.push({
        name: 'LEGAL_NAME_MATCH',
        status: 'FAILED',
        message: `Name mismatch: GLEIF shows "${leiResult.legalName}"`,
      });
      requiresManualReview = true;
    }
  } else {
    checks.push({
      name: 'LEI_VALIDATION',
      status: 'FAILED',
      message: 'LEI not provided',
    });
  }
  
  // Check 2: Required Documents
  const requiredDocs = getRequiredDocuments(org.entityType, org.country);
  for (const docType of requiredDocs) {
    const doc = org.kycDocuments.find(d => d.documentType === docType);
    checks.push({
      name: `DOCUMENT_${docType}`,
      status: doc ? (doc.verificationStatus === 'VERIFIED' ? 'PASSED' : 'PENDING') : 'FAILED',
      message: doc ? undefined : `Missing: ${docType}`,
    });
  }
  
  // Check 3: Beneficial Ownership
  const totalOwnership = org.beneficialOwners.reduce(
    (sum, bo) => sum + bo.ownershipPercentage,
    0
  );
  
  if (totalOwnership < 75) {
    checks.push({
      name: 'UBO_COVERAGE',
      status: 'FAILED',
      message: `Only ${totalOwnership}% ownership disclosed (minimum 75%)`,
    });
  } else {
    checks.push({
      name: 'UBO_COVERAGE',
      status: 'PASSED',
    });
  }
  
  // Check 4: UBO Identity Verification
  for (const bo of org.beneficialOwners) {
    if (bo.idVerificationStatus !== 'VERIFIED') {
      checks.push({
        name: `UBO_ID_${bo.id}`,
        status: 'FAILED',
        message: `UBO "${bo.fullLegalName}" identity not verified`,
      });
    }
  }
  
  // Check 5: Sanctions Screening
  const sanctionsResult = await screenOrganization(org);
  if (sanctionsResult.status === 'potential_match') {
    checks.push({
      name: 'SANCTIONS_SCREENING',
      status: 'FAILED',
      message: 'Potential sanctions match - requires review',
    });
    requiresManualReview = true;
  } else {
    checks.push({
      name: 'SANCTIONS_SCREENING',
      status: 'PASSED',
    });
  }
  
  // Calculate risk level
  const riskLevel = calculateRiskLevel(org, checks);
  
  // Auto-approve if all checks pass and low/medium risk
  const passed = checks.every(c => c.status === 'PASSED') &&
                 !requiresManualReview &&
                 riskLevel !== 'HIGH' &&
                 riskLevel !== 'PROHIBITED';
  
  return {
    passed,
    checks,
    requiresManualReview,
    riskLevel,
  };
}

function getRequiredDocuments(entityType: EntityType | null, country: string | null): DocumentType[] {
  const base: DocumentType[] = [
    'CERTIFICATE_OF_FORMATION',
    'CERTIFICATE_OF_GOOD_STANDING',
  ];
  
  if (country === 'US') {
    base.push('IRS_LETTER_147C'); // EIN verification
    base.push('W9');
  } else {
    base.push('W8_BEN_E');
  }
  
  if (entityType === 'LLC') {
    base.push('OPERATING_AGREEMENT');
  } else if (entityType === 'LP' || entityType === 'LLP') {
    base.push('PARTNERSHIP_AGREEMENT');
  } else if (entityType === 'CORPORATION') {
    base.push('BYLAWS');
  }
  
  return base;
}

async function screenOrganization(org: any): Promise<{ status: string }> {
  // Placeholder for actual screening implementation
  return { status: 'no_match' };
}

function calculateRiskLevel(org: any, checks: any[]): RiskLevel {
  // Placeholder for actual risk calculation
  return 'LOW';
}
```

### 7.2 Manual Review Queue

```typescript
// lib/verification/review-queue.ts

interface ReviewQueueItem {
  id: string;
  organizationId: string;
  organizationName: string;
  requestedTier: VerificationTier;
  submittedAt: Date;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignedTo?: string;
  status: 'PENDING' | 'IN_REVIEW' | 'ESCALATED';
  
  // Summary
  automatedChecksPassed: number;
  automatedChecksFailed: number;
  riskLevel: RiskLevel;
  flags: string[];
  
  // For reviewer
  checklist: ReviewChecklistItem[];
}

interface ReviewChecklistItem {
  id: string;
  description: string;
  required: boolean;
  completed: boolean;
  completedBy?: string;
  completedAt?: Date;
  notes?: string;
}

const TIER_1_REVIEW_CHECKLIST: Omit<ReviewChecklistItem, 'id' | 'completed' | 'completedBy' | 'completedAt' | 'notes'>[] = [
  {
    description: 'Verify formation documents are authentic and match claimed entity',
    required: true,
  },
  {
    description: 'Confirm LEI registration matches organization details',
    required: true,
  },
  {
    description: 'Verify all UBOs with >25% ownership are disclosed',
    required: true,
  },
  {
    description: 'Review and clear any sanctions screening matches',
    required: true,
  },
  {
    description: 'Verify authorized representative has authority to act',
    required: true,
  },
  {
    description: 'Check for adverse media or regulatory actions',
    required: false,
  },
];

const TIER_2_REVIEW_CHECKLIST: Omit<ReviewChecklistItem, 'id' | 'completed' | 'completedBy' | 'completedAt' | 'notes'>[] = [
  ...TIER_1_REVIEW_CHECKLIST,
  {
    description: 'Verify vLEI credential signature chain to GLEIF root',
    required: true,
  },
  {
    description: 'Confirm vLEI issuer (QVI) is authorized',
    required: true,
  },
  {
    description: 'Complete Enhanced Due Diligence review',
    required: true,
  },
  {
    description: 'Verify source of funds documentation (if high-risk)',
    required: false,
  },
  {
    description: 'Obtain senior management approval (if high-value)',
    required: false,
  },
];

export async function createReviewQueueItem(
  organizationId: string,
  requestedTier: VerificationTier
): Promise<ReviewQueueItem> {
  // Implementation...
  throw new Error('Not implemented');
}

export async function assignReview(
  itemId: string,
  assigneeId: string
): Promise<void> {
  // Implementation...
}

export async function completeChecklistItem(
  itemId: string,
  checklistItemId: string,
  completedBy: string,
  notes?: string
): Promise<void> {
  // Implementation...
}

export async function approveReview(
  itemId: string,
  approvedBy: string,
  notes?: string
): Promise<void> {
  // Update organization tier
  // Log verification event
  // Send notification to organization
}

export async function rejectReview(
  itemId: string,
  rejectedBy: string,
  reason: string,
  requiredActions: string[]
): Promise<void> {
  // Keep organization at current tier
  // Log verification event
  // Send notification with required actions
}
```

---

## 8. Audit & Compliance

### 8.1 Verification Audit Trail

All verification-related actions must be logged to the audit trail:

```typescript
// Verification events to log

enum VerificationEventType {
  // Registration
  REGISTRATION_STARTED = 'REGISTRATION_STARTED',
  REGISTRATION_COMPLETED = 'REGISTRATION_COMPLETED',
  
  // Documents
  DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
  DOCUMENT_VERIFIED = 'DOCUMENT_VERIFIED',
  DOCUMENT_REJECTED = 'DOCUMENT_REJECTED',
  DOCUMENT_DELETED = 'DOCUMENT_DELETED',
  DOCUMENT_EXPIRED = 'DOCUMENT_EXPIRED',
  
  // UBOs
  UBO_ADDED = 'UBO_ADDED',
  UBO_UPDATED = 'UBO_UPDATED',
  UBO_REMOVED = 'UBO_REMOVED',
  UBO_ID_VERIFIED = 'UBO_ID_VERIFIED',
  UBO_ID_FAILED = 'UBO_ID_FAILED',
  
  // Screening
  SANCTIONS_SCREENING_RUN = 'SANCTIONS_SCREENING_RUN',
  SANCTIONS_MATCH_CLEARED = 'SANCTIONS_MATCH_CLEARED',
  SANCTIONS_MATCH_CONFIRMED = 'SANCTIONS_MATCH_CONFIRMED',
  AML_ALERT_CREATED = 'AML_ALERT_CREATED',
  AML_ALERT_RESOLVED = 'AML_ALERT_RESOLVED',
  
  // Tier changes
  TIER_UPGRADE_REQUESTED = 'TIER_UPGRADE_REQUESTED',
  TIER_UPGRADE_APPROVED = 'TIER_UPGRADE_APPROVED',
  TIER_UPGRADE_REJECTED = 'TIER_UPGRADE_REJECTED',
  TIER_DOWNGRADED = 'TIER_DOWNGRADED',
  
  // vLEI
  VLEI_SUBMITTED = 'VLEI_SUBMITTED',
  VLEI_VERIFIED = 'VLEI_VERIFIED',
  VLEI_REJECTED = 'VLEI_REJECTED',
  VLEI_EXPIRED = 'VLEI_EXPIRED',
  
  // Suspension
  ORGANIZATION_SUSPENDED = 'ORGANIZATION_SUSPENDED',
  ORGANIZATION_REINSTATED = 'ORGANIZATION_REINSTATED',
  
  // Review
  REVIEW_ASSIGNED = 'REVIEW_ASSIGNED',
  REVIEW_ESCALATED = 'REVIEW_ESCALATED',
  REVIEW_COMPLETED = 'REVIEW_COMPLETED',
}

interface VerificationAuditEntry {
  id: string;
  timestamp: Date;
  eventType: VerificationEventType;
  organizationId: string;
  
  // Actor
  actorType: 'USER' | 'ADMIN' | 'SYSTEM' | 'EXTERNAL_SERVICE';
  actorId: string;
  actorName: string;
  
  // Target (optional)
  targetType?: 'DOCUMENT' | 'UBO' | 'VLEI' | 'REVIEW';
  targetId?: string;
  
  // Details
  previousValue?: any;
  newValue?: any;
  metadata?: Record<string, any>;
  
  // Integrity
  hash: string;                      // SHA-256 of entry
  previousHash: string;              // Chain integrity
}
```

### 8.2 Retention Requirements

| Data Type | Retention Period | Rationale |
|-----------|------------------|-----------|
| Verification events | 7 years | BSA/AML requirement |
| KYC documents | 5 years after relationship ends | FinCEN requirement |
| Sanctions screening results | 5 years | OFAC requirement |
| Rejected applications | 5 years | Regulatory requirement |
| UBO information | 5 years after relationship ends | CDD requirement |
| vLEI credentials | Until superseded + 2 years | Chain of custody |

### 8.3 Regulatory Reporting

```typescript
// lib/verification/reporting.ts

interface SARReport {
  // Suspicious Activity Report structure
  filingType: 'INITIAL' | 'CORRECT' | 'JOINT';
  filingDate: Date;
  
  subjectInformation: {
    type: 'INDIVIDUAL' | 'ENTITY';
    name: string;
    identifiers: { type: string; value: string }[];
    address: Address;
  };
  
  suspiciousActivity: {
    dateRange: { from: Date; to: Date };
    amountInvolved?: number;
    activityTypes: string[];
    narrative: string;
  };
  
  filingInstitution: {
    name: string;
    ein: string;
    contact: { name: string; phone: string };
  };
}

// Generate SAR when required
export async function generateSAR(
  organizationId: string,
  activityDescription: string
): Promise<SARReport> {
  // Implementation...
  throw new Error('Not implemented');
}
```

---

## 9. Security Considerations

### 9.1 Data Protection

| Control | Implementation |
|---------|---------------|
| Encryption at rest | AES-256-GCM via AWS KMS for all PII |
| Encryption in transit | TLS 1.3 minimum |
| Access logging | All PII access logged with user, timestamp, purpose |
| Data masking | SSN/TIN shown as `***-**-1234` in UI |
| Field-level encryption | Separate KMS keys for different data classes |
| Key rotation | Annual rotation with 90-day overlap |

### 9.2 Access Controls

```typescript
// Who can access verification data

const VERIFICATION_ACCESS_MATRIX = {
  // Organization's own data
  ownOrganization: {
    viewStatus: ['any_user'],
    viewDocuments: ['admin', 'compliance'],
    uploadDocuments: ['admin', 'compliance'],
    viewUBOs: ['admin', 'compliance'],
    editUBOs: ['admin'],
    submitForReview: ['admin'],
  },
  
  // Platform admin access
  platformAdmin: {
    viewQueue: ['PLATFORM_ADMIN', 'COMPLIANCE_OFFICER'],
    assignReview: ['PLATFORM_ADMIN', 'COMPLIANCE_OFFICER'],
    approveReject: ['PLATFORM_ADMIN', 'COMPLIANCE_OFFICER'],
    suspend: ['PLATFORM_ADMIN'],
    viewAnyOrgData: ['PLATFORM_ADMIN', 'COMPLIANCE_OFFICER'],
    exportReports: ['COMPLIANCE_OFFICER'],
  },
};
```

### 9.3 Rate Limiting

```typescript
// Rate limits for verification endpoints

const VERIFICATION_RATE_LIMITS = {
  // Document uploads
  documentUpload: {
    perMinute: 5,
    perHour: 20,
    perDay: 50,
  },
  
  // LEI lookups
  leiLookup: {
    perMinute: 10,
    perHour: 100,
  },
  
  // Verification submissions
  submitForReview: {
    perDay: 3,      // Prevent spam submissions
  },
  
  // Identity verification sessions
  idVerification: {
    perDay: 5,      // Limit failed attempts
  },
};
```

---

## 10. Error Handling & Edge Cases

### 10.1 Common Error Scenarios

```typescript
// lib/verification/errors.ts

export class VerificationError extends Error {
  constructor(
    public code: VerificationErrorCode,
    message: string,
    public userMessage: string,
    public recoverable: boolean = true
  ) {
    super(message);
  }
}

enum VerificationErrorCode {
  // LEI errors
  LEI_INVALID_FORMAT = 'LEI_INVALID_FORMAT',
  LEI_NOT_FOUND = 'LEI_NOT_FOUND',
  LEI_LAPSED = 'LEI_LAPSED',
  LEI_MISMATCH = 'LEI_MISMATCH',
  
  // Document errors
  DOCUMENT_INVALID_FORMAT = 'DOCUMENT_INVALID_FORMAT',
  DOCUMENT_TOO_LARGE = 'DOCUMENT_TOO_LARGE',
  DOCUMENT_EXPIRED = 'DOCUMENT_EXPIRED',
  DOCUMENT_UNREADABLE = 'DOCUMENT_UNREADABLE',
  
  // UBO errors
  UBO_INCOMPLETE = 'UBO_INCOMPLETE',
  UBO_OWNERSHIP_MISMATCH = 'UBO_OWNERSHIP_MISMATCH',
  UBO_ID_VERIFICATION_FAILED = 'UBO_ID_VERIFICATION_FAILED',
  
  // Screening errors
  SANCTIONS_MATCH = 'SANCTIONS_MATCH',
  PEP_MATCH = 'PEP_MATCH',
  ADVERSE_MEDIA = 'ADVERSE_MEDIA',
  
  // vLEI errors
  VLEI_INVALID = 'VLEI_INVALID',
  VLEI_SIGNATURE_INVALID = 'VLEI_SIGNATURE_INVALID',
  VLEI_CHAIN_INVALID = 'VLEI_CHAIN_INVALID',
  VLEI_EXPIRED = 'VLEI_EXPIRED',
  VLEI_LEI_MISMATCH = 'VLEI_LEI_MISMATCH',
  
  // Process errors
  ALREADY_AT_TIER = 'ALREADY_AT_TIER',
  PREREQUISITES_NOT_MET = 'PREREQUISITES_NOT_MET',
  REVIEW_IN_PROGRESS = 'REVIEW_IN_PROGRESS',
  ORGANIZATION_SUSPENDED = 'ORGANIZATION_SUSPENDED',
  
  // External service errors
  GLEIF_UNAVAILABLE = 'GLEIF_UNAVAILABLE',
  ID_PROVIDER_UNAVAILABLE = 'ID_PROVIDER_UNAVAILABLE',
  AML_PROVIDER_UNAVAILABLE = 'AML_PROVIDER_UNAVAILABLE',
}

// Error recovery strategies
const ERROR_RECOVERY: Record<VerificationErrorCode, {
  retry: boolean;
  userAction: string;
  supportAction?: string;
}> = {
  [VerificationErrorCode.LEI_LAPSED]: {
    retry: false,
    userAction: 'Please renew your LEI with your Local Operating Unit (LOU) before continuing.',
  },
  [VerificationErrorCode.SANCTIONS_MATCH]: {
    retry: false,
    userAction: 'Your verification requires manual review. Our compliance team will contact you within 2 business days.',
    supportAction: 'Escalate to compliance for manual sanctions review.',
  },
  [VerificationErrorCode.GLEIF_UNAVAILABLE]: {
    retry: true,
    userAction: 'LEI verification service is temporarily unavailable. Please try again in a few minutes.',
  },
  // ... other recovery strategies
} as Record<VerificationErrorCode, { retry: boolean; userAction: string; supportAction?: string }>;
```

### 10.2 Handling Partial Verification

```typescript
// When external services fail mid-verification

interface PartialVerificationState {
  organizationId: string;
  startedAt: Date;
  completedSteps: string[];
  pendingSteps: string[];
  failedSteps: { step: string; error: string; retryable: boolean }[];
  canResume: boolean;
  resumeToken?: string;
}

export async function resumeVerification(
  resumeToken: string
): Promise<Tier1CheckResult> {
  // Load saved state
  // Skip completed steps
  // Retry failed retryable steps
  // Continue with pending steps
  throw new Error('Not implemented');
}
```

---

## 11. Testing Strategy

### 11.1 Test Data & Sandbox

```typescript
// Test LEIs (GLEIF sandbox)
const TEST_LEIS = {
  valid: '5493001KJTIIGC8Y1R12',
  lapsed: '5493001KJTIIGC8Y1R13',
  notFound: '9999999999999999999X',
};

// Test scenarios
const TEST_SCENARIOS = {
  happyPath: {
    lei: TEST_LEIS.valid,
    documents: ['all_valid'],
    ubos: ['clean'],
    expectedTier: 'IDENTITY_VERIFIED',
  },
  sanctionsMatch: {
    lei: TEST_LEIS.valid,
    documents: ['all_valid'],
    ubos: ['sanctions_match'],
    expectedOutcome: 'MANUAL_REVIEW',
  },
  lapsedLEI: {
    lei: TEST_LEIS.lapsed,
    expectedError: 'LEI_LAPSED',
  },
  // ... more scenarios
};
```

### 11.2 Integration Test Checklist

- [ ] LEI validation against GLEIF sandbox
- [ ] Document upload and storage encryption
- [ ] UBO identity verification flow
- [ ] Sanctions screening with test matches
- [ ] vLEI credential parsing and validation
- [ ] Tier upgrade workflow (happy path)
- [ ] Tier upgrade workflow (rejection)
- [ ] Manual review queue assignment
- [ ] Audit log generation
- [ ] Rate limiting enforcement
- [ ] Error recovery flows

---

## 12. Implementation Phases

### Phase 2a: Basic Tiering (MVP)

**Scope:**
- Database schema additions
- Tier 0 → Tier 1 flow (LEI + basic docs only)
- Feature gating middleware
- Admin approval UI

**Not included:**
- UBO identity verification
- AML/sanctions screening
- vLEI support

**Estimated effort:** 2-3 weeks

### Phase 2b: Full KYC

**Scope:**
- UBO management
- Identity verification integration
- AML/sanctions screening
- Automated verification workflow

**Estimated effort:** 3-4 weeks

### Phase 2c: vLEI & Full Authorization

**Scope:**
- vLEI credential verification
- Enhanced Due Diligence
- Tier 2 workflow
- Full audit compliance

**Estimated effort:** 2-3 weeks

---

## 13. Dependencies & Prerequisites

### External Services Required

| Service | Purpose | Estimated Cost |
|---------|---------|----------------|
| AWS KMS | PII encryption | ~$1/key/month + usage |
| AWS S3 | Document storage | ~$0.023/GB/month |
| GLEIF API | LEI validation | Free |
| Identity verification (Jumio/Onfido) | UBO ID verification | $2-5/verification |
| AML screening (ComplyAdvantage) | Sanctions/PEP screening | $0.10-0.50/search |
| vLEI verification | KERI/ACDC infrastructure | TBD |

### Internal Prerequisites

- [ ] KMS key provisioning and IAM policies
- [ ] S3 bucket with encryption and lifecycle policies
- [ ] Webhook endpoints for external service callbacks
- [ ] Admin user roles for compliance team
- [ ] Audit log infrastructure

---

## 14. Open Questions

1. **vLEI Availability**: What percentage of target organizations currently have vLEIs? Should Tier 2 have an alternative path for orgs without vLEIs?

2. **Re-verification Frequency**: How often should organizations re-verify? Annual? Upon material change?

3. **Partial Access**: Should there be intermediate states between tiers? (e.g., view-only access before full Tier 1?)

4. **Cross-Border Considerations**: How to handle non-US entities with different document requirements?

5. **Delegation During Verification**: Can a Tier 1 org delegate to a Tier 2 org, or must the grantor always have equal or higher tier?

6. **Grace Periods**: Should there be a grace period when documents expire before access is revoked?

7. **Onboarding Assistance**: Should Waypoint offer concierge onboarding for large LPs/GPs?

---

## 15. References

### Regulatory & Standards

1. **FinCEN Customer Due Diligence Rule (31 CFR 1010.230)**
   - https://www.fincen.gov/resources/statutes-and-regulations/cdd-final-rule
   - Defines CDD and beneficial ownership requirements for financial institutions

2. **FATF Recommendations**
   - https://www.fatf-gafi.org/recommendations.html
   - International standards for AML/CFT compliance

3. **OFAC Sanctions Programs**
   - https://ofac.treasury.gov/sanctions-programs-and-country-information
   - US sanctions lists and compliance requirements

4. **Bank Secrecy Act (BSA)**
   - https://www.fincen.gov/resources/statutes-regulations/bank-secrecy-act
   - AML recordkeeping and reporting requirements

### Identity & Verification Standards

5. **Legal Entity Identifier (LEI) - ISO 17442**
   - https://www.gleif.org/en/about-lei/introducing-the-legal-entity-identifier-lei
   - Global standard for legal entity identification

6. **GLEIF vLEI Ecosystem Governance Framework**
   - https://www.gleif.org/vlei
   - Verifiable LEI credential specifications

7. **KERI (Key Event Receipt Infrastructure)**
   - https://keri.one/
   - Decentralized key management for vLEI

8. **ACDC (Authentic Chained Data Containers)**
   - https://trustoverip.github.io/tswg-acdc-specification/
   - Verifiable credential format used by vLEI

### Industry Standards

9. **ILPA Data Standards**
   - https://ilpa.org/data-standards/
   - Private equity reporting standards

10. **FIBO (Financial Industry Business Ontology)**
    - https://spec.edmcouncil.org/fibo/
    - Semantic standard for financial entities

### Technology Documentation

11. **AWS KMS Best Practices**
    - https://docs.aws.amazon.com/kms/latest/developerguide/best-practices.html

12. **Prisma Field-Level Encryption**
    - https://www.prisma.io/docs/concepts/components/prisma-client/field-level-encryption

### Vendor Documentation

13. **Jumio Identity Verification**
    - https://www.jumio.com/kyc-process/

14. **ComplyAdvantage AML Screening**
    - https://complyadvantage.com/

15. **Onfido Identity Verification**
    - https://onfido.com/

### KYC/AML Best Practices

16. **Thomson Reuters: 5 Essential Steps for KYC/AML Onboarding**
    - https://legal.thomsonreuters.com/blog/5-essential-steps-for-kyc-aml-onboarding-and-compliance/

17. **Signzy: KYC Best Practices for Fraud Prevention**
    - https://www.signzy.com/us/blog/7-kyc-best-practices-for-smarter-compliance-fraud-prevention/

---

*This document should be reviewed and updated as regulatory requirements evolve and implementation progresses.*

*Last reviewed: November 2025*

