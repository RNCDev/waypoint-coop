# Permission Schema & Access Control Model

## Overview

Waypoint uses a hierarchical permission model where Asset Owners control access to their assets and can delegate various capabilities through Publishing Rights. Subscribers can delegate view-only access to service providers, and can also delegate subscription management (accept/request subscriptions) to entitities like advisors or discretionary portfolio managers.

---

## Permission Flow Summary

### Asset Owner (GP) Flow
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

### Subscriber (LP) Flow
*   **Delegation:** LPs delegate access to service providers (e.g., Auditors, Analytics).
*   **Types of Access:**
    *   **View-Only:** Read data for specific assets/types.
    *   **Subscription Management:** Accept/decline invitations on LP's behalf.
*   **Approval:** Delegations may require GP approval if enforced at the asset level.

---

## Detailed Permission Model

### Asset Owner (GP) Capabilities

| Capability | Implementation | Status |
|------------|----------------|--------|
| **Create Assets** | `POST /api/assets` | ✅ Implemented |
| **Define Subscriber Universe** | `Subscription` management | ✅ Implemented |
| **Publish Data** | `Envelope` creation | ✅ Implemented |
| **Delegate Subscription Management** | `PublishingRight.canManageSubscriptions = true` | ✅ Implemented |
| **Delegate Publishing Rights** | `PublishingRight` (without canManageSubscriptions) | ✅ Implemented |
| **Delegate Both** | `PublishingRight` with `canManageSubscriptions = true` | ✅ Implemented |
| **Delegate Approval Rights** | `PublishingRight.canApproveDelegations = true` | ✅ Implemented |
| **Delegate Subscription Approval** | `PublishingRight.canApproveSubscriptions = true` | ✅ Implemented |
| **Delegate View-Only Access** | ✅ `PublishingRight` with `canViewData = true` (no other flags needed) | ✅ Implemented |

### Organization with Publishing Rights (Delegate from Asset Owner)

| Action | Right Required | Status |
|--------|----------------|--------|
| **Publish Data** | Has `PublishingRight` | ✅ Implemented |
| **View Data** | `canViewData = true` in PublishingRight | ✅ Implemented |
| **Manage Subscriptions** | `canManageSubscriptions = true` | ✅ Implemented |
| **Approve LP Delegations** | `canApproveDelegations = true` AND asset requires approval | ✅ Implemented |
| **Approve Subscriptions** | `canApproveSubscriptions = true` | ✅ Implemented (future use) |

**Note**: `canViewData` flag allows granular control:
- Organization managing subscriptions: `canManageSubscriptions = true, canViewData = false`
- Organization with view-only access: `canViewData = true` (no other flags)
- Organization publishing data: `canViewData = true` (default)

### Subscriber (LP) Actions

| Action | Implementation | Status |
|--------|----------------|--------|
| **Accept Subscriptions** | `POST /api/subscriptions/[id]/accept` | ✅ Implemented |
| **Decline Subscriptions** | `POST /api/subscriptions/[id]/decline` | ✅ Implemented |
| **Request Subscriptions** | `POST /api/subscriptions/request` | ✅ Implemented |
| **View Data** | After subscription is "Active" | ✅ Implemented |
| **Delegate View-Only Access** | `Delegation` to service providers | ✅ Implemented |
| **Delegate Subscription Management** | `Delegation.canManageSubscriptions = true` | ✅ Implemented |
| **Request Secondary Approval** | `Asset.requireGPApprovalForDelegations` | ✅ Implemented |

### Delegate from Subscriber - View Access

| Action | Right/Scope | Status |
|--------|-------------|--------|
| **View Data Only** | Scoped by `Delegation.assetScope` and `Delegation.typeScope` | ✅ Implemented |

### Delegate from Subscriber - Subscription Management

| Action | Right/Scope | Status |
|--------|-------------|--------|
| **Accept Subscriptions** | Delegate with `canManageSubscriptions = true` | ✅ Implemented |
| **Decline Subscriptions** | Delegate with `canManageSubscriptions = true` | ✅ Implemented |
| **Request Subscriptions** | Delegate with `canManageSubscriptions = true` | ✅ Implemented |
| **Manage Subscription Lifecycle** | Delegate with `canManageSubscriptions = true` | ✅ Implemented (accept/decline) |

**Note**: Subscribers can delegate subscription management (accept/decline subscriptions) to portfolio managers via `Delegation.canManageSubscriptions = true`. This allows portfolio managers to handle subscription workflows on behalf of the LP. The delegate must have an active delegation with `canManageSubscriptions = true` for the specific subscriber.

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

- **Pending Asset Owner Approval**: LP has requested subscription, Asset Owner hasn't responded yet
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
        │ Asset Owner           │       │ Publisher (if granted)│
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
1. **Asset Owner** - Always can approve delegations for their assets
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

## Publishing Rights Model

### PublishingRight Flags

```
PublishingRight {
  canManageSubscriptions: boolean    // Can create/manage subscriptions
  canApproveSubscriptions: boolean  // Can approve subscription requests (future)
  canApproveDelegations: boolean    // Can approve LP delegations
  canViewData: boolean              // Can view data envelopes (default: true)
}
```

### Publishing Rights Capabilities Matrix

| Flag Combination | Actions Available | Use Case |
|------------------|-------------------|----------|
| None (just PublishingRight) | Publish data, View data | Standard publishing organization |
| `canManageSubscriptions = true` | + Manage subscriptions | Organization with subscription management |
| `canManageSubscriptions = true`<br/>`canViewData = false` | Manage subscriptions only | Organization managing access without viewing data |
| `canViewData = true`<br/>(no other flags) | View data only | Organization with view-only access (audit/compliance) |
| `canApproveDelegations = true` | + Approve LP delegations | Organization with delegation approval rights |
| `canApproveSubscriptions = true` | + Approve subscription requests | Organization with subscription approval rights |
| All flags | Full delegation | Complete operational control |

---

## Data Access Rules

### Who Can View Envelopes?

1. **Asset Owner**: Can view all envelopes for assets they own
2. **Organization with Publishing Rights**: Can view envelopes for assets where:
   - They have `PublishingRight` with `canViewData = true`
   - Asset is in their `PublishingRight.assetScope`
3. **Subscriber**: Can view envelopes where:
   - `envelope.recipientId === subscriber.orgId`
   - Subscriber has `Active` subscription to `envelope.assetId`
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
- Asset Owners can grant granular permissions by setting appropriate flags

**Subscriber Delegation for Subscription Management**:
- Subscribers can delegate subscription management rights to portfolio managers
- Portfolio managers can accept/request subscriptions on behalf of the subscriber
- Delegation requires subscriber approval (similar to view-access delegations)
- This allows portfolio managers to handle subscription workflows without the subscriber being directly involved

---

## Summary

**What's Working Well**:
- ✅ Core permission model is clean and matches requirements
- ✅ Publishing rights delegation works correctly
- ✅ Subscription management delegation (from Asset Owner) works correctly
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
- Subscribers can delegate subscription management to portfolio managers (to be implemented)
