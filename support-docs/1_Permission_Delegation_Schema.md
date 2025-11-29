# Permission Schema & Access Control Model

## Overview

Waypoint uses a **unified Access Grant model** where both Asset Managers and Limited Partners can delegate capabilities to Delegate organizations through a single, consistent structure.

**Key Concept: The Access Grant**

An Access Grant represents an "edge" in the permission graph where a grantor (Asset Manager or Limited Partner) grants capabilities to a grantee (always a Delegate organization). The capabilities are determined by flags on the grant:

- **GP Grants** (`canPublish: true`): Asset Manager → Delegate, enabling publishing and management capabilities
- **LP Grants** (`canPublish: false`): Limited Partner → Delegate, enabling data viewing and subscription management

---

## Permission Flow Summary

### Asset Manager (GP) Flow
*   **Root Authority:** GPs have full control over their assets.
*   **Granting Rights:** GPs grant **Publishing Rights** to other organizations (e.g., Fund Admins).
*   **Delegated Capabilities:**
    *   **Publish Data:** Create and send envelopes.
    *   **Manage Subscriptions:** Create/manage LP access.
    *   **Approve Delegations:** Approve LP service providers.
    *   **View Data:** Read access (can be disabled for ops-only roles).

### Subscription Flow
*   **Invitation:** GP invites LP ("Pending LP Acceptance").
*   **Acceptance:** LP accepts invitation ("Active").
*   **Data Access:** LP can view data only when subscription is Active.
*   **Expiration:** Subscriptions can expire or be revoked.

### Limited Partner (LP) Flow
*   **Delegation:** LPs delegate access to service providers (e.g., Auditors, Analytics).
*   **Types of Access:**
    *   **View-Only:** Read data for specific assets/types.
    *   **Subscription Management:** Accept/decline invitations on LP's behalf.
*   **Approval:** Delegations may require GP approval if enforced at the asset level.

---

## Detailed Permission Model

### Asset Manager (GP) Capabilities

| Capability | Implementation | Status |
|------------|----------------|--------|
| **Create Assets** | `POST /api/assets` | ✅ Implemented |
| **Define Limited Partner Universe** | `Subscription` management | ✅ Implemented |
| **Publish Data** | `Envelope` creation | ✅ Implemented |
| **Delegate Subscription Management** | `PublishingRight.canManageSubscriptions = true` | ✅ Implemented |
| **Delegate Publishing Rights** | `PublishingRight` (without canManageSubscriptions) | ✅ Implemented |
| **Delegate Both** | `PublishingRight` with `canManageSubscriptions = true` | ✅ Implemented |
| **Delegate Approval Rights** | `PublishingRight.canApproveDelegations = true` | ✅ Implemented |
| **Delegate Subscription Approval** | `PublishingRight.canApproveSubscriptions = true` | ✅ Implemented |
| **Delegate View-Only Access** | ✅ `PublishingRight` with `canViewData = true` (no other flags needed) | ✅ Implemented |

### Organization with Publishing Rights (Delegate from Asset Manager)

| Action | Right Required | Status |
|--------|----------------|--------|
| **Publish Data** | Has `PublishingRight` | ✅ Implemented |
| **View Data** | `canViewData = true` in PublishingRight | ✅ Implemented |
| **Manage Subscriptions** | `canManageSubscriptions = true` | ✅ Implemented |
| **Approve LP Delegations** | `canApproveDelegations = true` AND asset requires approval | ✅ Implemented |
| **Approve Subscriptions** | `canApproveSubscriptions = true` | ✅ Implemented |

**Note**: `canViewData` flag allows granular control:
- Organization managing subscriptions: `canManageSubscriptions = true, canViewData = false`
- Organization with view-only access: `canViewData = true` (no other flags)
- Organization publishing data: `canViewData = true` (default)

### Limited Partner (LP) Actions

| Action | Implementation | Status |
|--------|----------------|--------|
| **Accept Subscriptions** | `POST /api/subscriptions/[id]/accept` | ✅ Implemented |
| **Decline Subscriptions** | `POST /api/subscriptions/[id]/decline` | ✅ Implemented |
| **Request Subscriptions** | `POST /api/subscriptions/request` | ✅ Implemented |
| **View Data** | After subscription is "Active" | ✅ Implemented |
| **Delegate View-Only Access** | `Delegation` to service providers | ✅ Implemented |
| **Delegate Subscription Management** | `Delegation.canManageSubscriptions = true` | ✅ Implemented |
| **Request Secondary Approval** | `Asset.requireGPApprovalForDelegations` | ✅ Implemented |

### Delegate from Limited Partner - View Access

| Action | Right/Scope | Status |
|--------|-------------|--------|
| **View Data Only** | Scoped by `Delegation.assetScope` and `Delegation.typeScope` | ✅ Implemented |

### Delegate from Limited Partner - Subscription Management

| Action | Right/Scope | Status |
|--------|-------------|--------|
| **Accept Subscriptions** | Delegate with `canManageSubscriptions = true` | ✅ Implemented |
| **Decline Subscriptions** | Delegate with `canManageSubscriptions = true` | ✅ Implemented |
| **Request Subscriptions** | Delegate with `canManageSubscriptions = true` | ✅ Implemented |
| **Manage Subscription Lifecycle** | Delegate with `canManageSubscriptions = true` | ✅ Implemented (accept/decline) |

**Note**: Limited Partners can delegate subscription management (accept/decline subscriptions) to portfolio managers via `Delegation.canManageSubscriptions = true`. This allows portfolio managers to handle subscription workflows on behalf of the LP. The delegate must have an active delegation with `canManageSubscriptions = true` for the specific subscriber.

---

## Subscription Model

### Subscription Lifecycle

```
┌─────────────────────┐
│  GP Creates         │
│  Subscription       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Pending LP          │
│ Acceptance          │
│                     │
│ • GP can publish    │
│   data (data waits) │
│ • LP cannot view    │
└──────────┬──────────┘
           │
     ┌─────┴─────┐
     │           │
     ▼           ▼
┌─────────┐ ┌─────────┐
│ Accept  │ │ Decline │
└────┬────┘ └────┬────┘
     │           │
     ▼           ▼
┌─────────┐ ┌─────────┐
│ Active  │ │ Declined │
│         │ │          │
│ • LP    │ │ • Final  │
│   can   │ │   state  │
│   view  │ │          │
│   data  │ └──────────┘
│         │
│ ┌───────┴───────┐
│ │               │
│ ▼               ▼
│ Revoked      Expired
│ (Final)      (Final)
└───────────────┘

┌─────────────────────┐
│  LP Requests        │
│  Subscription       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Pending Asset       │
│ Owner Approval      │
│                     │
│ • GP can publish    │
│   data (data waits) │
│ • LP cannot view    │
└──────────┬──────────┘
           │
     ┌─────┴─────┐
     │           │
     ▼           ▼
┌─────────┐ ┌─────────┐
│ Approve │ │ Reject  │
└────┬────┘ └────┬────┘
     │           │
     ▼           ▼
┌─────────┐ ┌─────────┐
│ Active  │ │ Declined │
│         │ │          │
│ • LP    │ │ • Final  │
│   can   │ │   state  │
│   view  │ │          │
│   data  │ └──────────┘
│         │
│ ┌───────┴───────┐
│ │               │
│ ▼               ▼
│ Revoked      Expired
│ (Final)      (Final)
└───────────────┘
```

### Subscription States

- **Pending LP Acceptance**: GP has invited LP, LP hasn't responded yet
  - GP can publish data (data will be visible after acceptance)
  - LP cannot view data yet
  - Transitions: → `Active` (via accept) or → `Declined` (via decline)

- **Pending Asset Manager Approval**: LP has requested subscription, Asset Manager hasn't responded yet
  - GP can publish data (data will be visible after approval)
  - LP cannot view data yet
  - Transitions: → `Active` (via approve) or → `Declined` (via reject)

- **Active**: LP has accepted the subscription
  - LP can view all data (including data sent before acceptance)
  - Transitions: → `Revoked` (via GP revoke) or → `Expired` (via expiration)

- **Declined**: LP has declined the invitation
  - Final state (no transitions)
  - Data sent before decline remains in system but is not visible

- **Revoked**: GP has revoked the subscription
  - Final state (no transitions)
  - Historical data remains in system but is not visible

- **Expired**: Subscription has passed its `expiresAt` date
  - Final state (no transitions)
  - Historical data remains in system but is not visible

---

## Delegation Model

### Delegation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    SUBSCRIBER (LP)                           │
│  Creates Delegation to Service Provider                     │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Check Asset Requirements     │
        │  requireGPApprovalForDelegations? │
        └───────────────┬───────────────┘
                        │
            ┌───────────┴───────────┐
            │                       │
            ▼                       ▼
    ┌───────────────┐       ┌───────────────┐
    │ No Approval   │       │ Approval      │
    │ Required      │       │ Required      │
    └───────┬───────┘       └───────┬───────┘
            │                       │
            ▼                       ▼
    ┌───────────────┐       ┌───────────────┐
    │ Status:       │       │ Status:       │
    │ Active        │       │ Pending GP    │
    │               │       │ Approval      │
    └───────────────┘       └───────┬───────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
        ┌───────────────────────┐       ┌───────────────────────┐
        │ Asset Manager           │       │ Delegate (if granted)│
        │ (Always can approve)  │       │ canApproveDelegations │
        └───────────┬───────────┘       └───────────┬───────────┘
                    │                               │
                    └───────────────┬───────────────┘
                                    │
                            ┌───────┴───────┐
                            │               │
                            ▼               ▼
                    ┌───────────┐   ┌───────────┐
                    │ Approved  │   │ Rejected  │
                    └─────┬─────┘   └─────┬─────┘
                          │               │
                          ▼               ▼
                    ┌───────────┐   ┌───────────┐
                    │ Status:   │   │ Status:   │
                    │ Active    │   │ Rejected  │
                    └───────────┘   └───────────┘
```

### Delegation Approval Logic

**Who Can Approve:**
1. **Asset Manager** - Always can approve delegations for their assets
2. **Organization with Publishing Rights** - Can approve if:
   - Has `PublishingRight` with `canApproveDelegations = true`
   - Delegation involves assets in their `assetScope`
   - Asset has `requireGPApprovalForDelegations = true`

**Delegation Scope:**
- `assetScope: 'ALL'` - All assets the subscriber is subscribed to
- `assetScope: [assetId1, assetId2]` - Specific assets
- `typeScope: 'ALL'` - All data types
- `typeScope: ['CAPITAL_CALL', 'DISTRIBUTION']` - Specific data types

---

## Scope Definitions

### Understanding `assetScope: 'ALL'`

When a Delegation or PublishingRight uses `assetScope: 'ALL'`, this is evaluated **dynamically** at access-check time:

| Context | `'ALL'` Means |
|---------|---------------|
| **PublishingRight** | All assets owned by the Asset Manager who granted the right |
| **Delegation** | All assets the Limited Partner currently has active subscriptions to |

**Important Behavior for Delegations:**

The `'ALL'` scope is not a snapshot—it expands automatically as the subscriber gains new subscriptions:

```
Example:
1. LP delegates to Auditor with assetScope: 'ALL'
2. LP currently subscribed to: Fund A, Fund B
3. Auditor can view: Fund A, Fund B data

Later:
4. LP accepts subscription to Fund C
5. Auditor can now view: Fund A, Fund B, Fund C data (automatic)
```

**GP Approval Consideration:**

If a subscriber has an `'ALL'` scope delegation and later subscribes to a new asset that has `requireGPApprovalForDelegations: true`, the existing delegation **will still grant access** to the new asset without requiring re-approval. 

GPs who want strict control should:
- Use specific asset IDs in delegation scopes rather than `'ALL'`
- Or require new delegations to be created for sensitive assets

### Delegation Chaining (Not Supported)

Delegations **cannot be chained**. A delegate with `canManageSubscriptions: true` can manage subscriptions on behalf of the subscriber, but **cannot create new delegations** for that subscriber.

```
Allowed:
  LP → Delegate (canManageSubscriptions: true)
  Delegate can: accept/decline subscriptions for LP

NOT Allowed:
  LP → Delegate A (canManageSubscriptions: true)
  Delegate A → Delegate B (BLOCKED)
```

This prevents unauthorized expansion of data access through delegation chains.

---

## Unified Access Grant Model

### AccessGrant Structure

```typescript
AccessGrant {
  id: string
  
  // THE EDGE
  grantorId: number      // Asset Manager OR Limited Partner org
  granteeId: number      // Always a Delegate org
  
  // SCOPE
  assetScope: number[] | 'ALL'
  dataTypeScope: DataType[] | 'ALL'
  
  // CAPABILITIES
  canPublish: boolean              // Send envelopes (GP grants only)
  canViewData: boolean             // View envelopes
  canManageSubscriptions: boolean  // GP: invite/revoke | LP: accept/request for LP
  canApproveSubscriptions: boolean // Approve LP subscription requests (GP only)
  canApproveDelegations: boolean   // Approve LP→Delegate grants (GP only)
  
  // APPROVAL WORKFLOW (for LP grants requiring GP approval)
  requiresApproval: boolean
  approvalStatus: 'Pending' | 'Approved' | 'Rejected' | null
  approvedById: number | null
  approvedAt: string | null
  
  // METADATA
  status: 'Active' | 'Revoked' | 'Pending Approval'
  grantedAt: string
}
```

### Grant Types

| Grant Type | `canPublish` | Grantor | Use Case |
|------------|--------------|---------|----------|
| **GP Grant** | `true` | Asset Manager | Delegate publishing and management to Fund Admin |
| **LP Grant** | `false` | Limited Partner | Delegate data access to service providers |

### Flag Definitions: `canManageSubscriptions` vs `canApproveSubscriptions`

These two flags serve distinct purposes in the subscription workflow:

| Flag | Purpose | Actions Enabled |
|------|---------|-----------------|
| `canManageSubscriptions` | **Proactive subscription management** | Create new subscriptions (invite LPs), revoke existing subscriptions, update subscription details |
| `canApproveSubscriptions` | **Reactive subscription approval** | Approve or reject LP-initiated subscription requests (status: "Pending Asset Manager Approval") |

**Why Separate Flags?**
- A Fund Admin may need to invite LPs (`canManageSubscriptions`) but the GP wants to personally approve inbound requests (`canApproveSubscriptions: false`)
- An operations team may only handle approvals (`canApproveSubscriptions`) without the ability to proactively grant access
- Full delegation grants both flags

**Example Configurations:**
1. **Full subscription control**: `canManageSubscriptions: true, canApproveSubscriptions: true`
2. **Invite-only (GP approves requests)**: `canManageSubscriptions: true, canApproveSubscriptions: false`
3. **Approval-only (GP initiates)**: `canManageSubscriptions: false, canApproveSubscriptions: true`

### Access Grant Capabilities Matrix

| Grant Configuration | Actions Available | Use Case |
|---------------------|-------------------|----------|
| GP Grant (default) | Publish data, View data | Standard publishing organization |
| GP Grant + `canManageSubscriptions = true` | + Manage subscriptions | Organization with subscription management |
| GP Grant + `canViewData = false` | Publish without viewing | Ops role |
| LP Grant (view only) | View data only | Audit/compliance access |
| LP Grant + `canManageSubscriptions = true` | + Accept/request subscriptions | Portfolio manager |
| GP Grant + `canApproveDelegations = true` | + Approve LP grants | Full delegation control |
| GP Grant + `canApproveSubscriptions = true` | + Approve subscription requests | Subscription approval rights |

---

## Data Access Rules

### Who Can View Envelopes?

1. **Asset Manager**: Can view all envelopes for assets they own
2. **Organization with Publishing Rights**: Can view envelopes for assets where:
   - They have `PublishingRight` with `canViewData = true`
   - Asset is in their `PublishingRight.assetScope`
3. **Limited Partner**: Can view envelopes where:
   - `envelope.recipientId === subscriber.orgId`
   - Limited Partner has `Active` subscription to `envelope.assetId`
   - Subscription is not expired (`expiresAt` check)
4. **Delegate (View Access)**: Can view envelopes where:
   - Delegation is `Active`
   - `envelope.recipientId === delegation.subscriberId`
   - Asset matches `delegation.assetScope`
   - Data type matches `delegation.typeScope`

### Publishing Rules

- **Organization can publish** if they have `PublishingRight` for the asset
- **Recipient must have subscription** (Active or Pending LP Acceptance)
- **Data sent before acceptance** becomes visible after LP accepts subscription

---

## View-Only Access Implementation

**Implementation**: `canViewData` flag added to `PublishingRight` model.

**Use Cases**:

1. **Organization Managing Subscriptions** - Manages subscriber universe and delegation rights
   - Configuration: `canManageSubscriptions=true, canApproveDelegations=true, canViewData=false`
   - Result: Can manage subscriptions and approve delegations, but cannot view actual data envelopes
   - Rationale: Manages access control but doesn't need to see the data itself

2. **Organization with View-Only Access** - Needs to audit/review data
   - Configuration: `canViewData=true` (no other flags)
   - Result: Can view all data envelopes for auditing, but cannot publish or manage subscriptions
   - Rationale: Needs read-only access to verify data integrity

3. **Organization Publishing Data** - Publishes data
   - Configuration: `canViewData=true` (default)
   - Result: Can publish and view data they publish
   - Rationale: Needs to see what they've published

**How It Works**:
- `canViewData` defaults to `true` for backward compatibility
- Organizations with Publishing Rights can only view envelopes for assets where they have `PublishingRight` with `canViewData=true`
- Asset Managers can grant granular permissions by setting appropriate flags

**Limited Partner Delegation for Subscription Management**:
- Limited Partners can delegate subscription management rights to portfolio managers
- Portfolio managers can accept/request subscriptions on behalf of the subscriber
- Delegation requires subscriber approval (similar to view-access delegations)
- This allows portfolio managers to handle subscription workflows without the subscriber being directly involved

---

## Summary

**What's Working Well**:
- ✅ Core permission model is clean and matches requirements
- ✅ Publishing rights delegation works correctly
- ✅ Subscription management delegation (from Asset Manager) works correctly
- ✅ LP delegation with approval works correctly
- ✅ Asset creation with approval requirements
- ✅ Organization approval of delegations (via Publishing Rights)
- ✅ Granular view access control via `canViewData` flag
  - Organizations can manage subscriptions without viewing data (`canViewData = false`)
  - Organizations can have view-only access for audit/compliance (`canViewData = true`, no other flags)
  - Organizations can view data they publish (`canViewData = true`, default)

**Status**:
- ✅ All core features are implemented
- ✅ Asset creation API with approval requirements
- ✅ Organization approval of delegations (via Publishing Rights)
- ✅ Subscription acceptance/decline endpoints
- ✅ Subscription expiration checking
- ✅ Status transition validation

**Key Design Decisions**:
- Subscriptions separate from data access (subscriptions define who CAN access, envelopes are the delivery)
- Data sent before subscription acceptance becomes visible after acceptance (incentivizes onboarding)
- Delegation approval can be delegated via Publishing Rights (granular control)
- All data is immutable (revoked subscriptions hide data but don't delete it)
- Rights-based model: Permissions described in terms of rights and actions, not specific organizational roles
- Limited Partners can delegate subscription management to portfolio managers via `Delegation.canManageSubscriptions`
- Subscription management (`canManageSubscriptions`) and subscription approval (`canApproveSubscriptions`) are separate concerns
- Delegation chaining is not supported (delegates cannot create delegations for their managed subscribers)
