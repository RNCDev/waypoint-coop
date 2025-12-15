Resilient Architecture: Temporal Chain of Trust
Evaluation of Separation
We have confirmed that separating Subscriptions (Economic Interest/Ownership) and Access Grants (Delegated Permission) is the correct architectural choice.

Resilience: It allows "Ownership" to transfer (LP X sells to LP Y) without manually rewriting every permission record.
Security: It enables a "Chain of Trust" where a delegate's access is strictly dependent on the grantor's continued ownership.
Goals
 Generalize Schema: Remove hardcoded enums (OrgType, AssetType) to support future industry participants.
 Temporal Ownership: Track the lifespan of an investment (validFrom, validTo) to handle secondary sales.
 Chain of Trust: Update permission logic to automatically invalidate a delegate's access if the grantor's subscription ends.
 Visualization: Emphasize the current state of the network in the UI.
Implementation Plan
1. Schema Refactoring (Generalization & History)
prisma/schema.prisma:

  Types: Convert OrgType and AssetType to String.
  Subscription History:
  Add validFrom (DateTime, default now).
  Add validTo (DateTime, optional).
  Remove `@@unique([assetId, subscriberId])` to allow historical records of the same LP holding the same asset at different times.
  Access Grants:
  Ensure validFrom exists (currently createdAt serves this, but validFrom is explicit).
2. "Chain of Trust" Permission Logic
lib/permissions.ts:

  Update canPerformAction to enforce the chain:
 Check Grant: If user has an active AccessGrant.
 Verify Grantor: Look up the grantorId of that grant.
 Validate Grantor's Rights:
  If Grantor is Manager: Pass.
  If Grantor is LP: Check if LP has a valid Subscription (Active AND validTo is null/future).
  Result: If LP X sells to LP Y today, LP X's consultants lose access immediately because the "Chain of Trust" is broken.
3. API Updates for "Current State"
  **`app/api/assets/[id]/route-map/route.ts`**:
  Filter Subscriptions: where: { validTo: null } (or future).
  Filter Grants: Ensure related Grantor's subscription is valid.
  app/api/subscriptions/route.ts:
  Add support for querying "Active" (validTo future) vs "Historical" (validTo past).
4. UI Updates
  components/shared/route-map.tsx:
  Add visual indicator for "Current State".
  Only render nodes that pass the temporal validity check.
  app/subscriptions/page.tsx:
  Add columns for "Start Date" and "End Date".
  Update status badges to reflect "Transferred" or "Historical" states.
Migration Steps
 Update Schema: Apply String types and temporal fields.
 Update Seeds: Use string literals.
 Reset DB: Clean slate for the new resilient model.
Benefits
  Auto-Revocation: No need to manually find and revoke every consultant's access when an LP sells.
  Future-Proof: Can add "Crypto Funds" or "AI Auditors" without code changes.
  Audit Ready: Full history of who owned what and when.