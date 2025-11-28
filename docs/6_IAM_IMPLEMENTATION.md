# IAM Implementation Guide

## Overview

The Waypoint application now includes a comprehensive Identity and Access Management (IAM) system that provides role-based access control (RBAC), permission management, session handling, and audit logging.

## Architecture

### Core Components

1. **Permission System** (`/lib/iam/permissions.ts`)
   - Defines all available permissions in the system
   - Maps roles to their respective permissions
   - Provides utilities for permission checking

2. **Authorization** (`/lib/iam/authorization.ts`)
   - Resource-level access control
   - Context-based authorization checks
   - Delegation-aware access control

3. **Middleware** (`/lib/iam/middleware.ts`)
   - Request authentication
   - Permission enforcement
   - Audit event logging

4. **Session Management** (`/lib/iam/session.ts`)
   - Session creation and validation
   - Session expiration handling
   - Multi-session support per user

## Permission Model

### Permission Format

Permissions follow the pattern: `resource:action`

Examples:
- `envelopes:read` - Read access to envelopes
- `envelopes:write` - Write access to envelopes
- `delegations:approve` - Approve delegations
- `admin:all` - Full administrative access

### Available Permissions

- **Envelopes**: `read`, `write`, `delete`
- **Payloads**: `read`, `write`
- **Delegations**: `read`, `write`, `approve`, `revoke`
- **Organizations**: `read`, `write`, `delete`
- **Users**: `read`, `write`, `delete`
- **Assets**: `read`, `write`
- **Audit**: `read`
- **Receipts**: `read`, `write`
- **Admin**: `all` (superuser access)

## Role Definitions

### Platform Admin
- **Description**: Full access to all platform resources and operations
- **Permissions**: `admin:all`
- **Use Case**: Platform operators and system administrators

### Admin
- **Description**: Organization administrator with broad permissions
- **Key Permissions**: All envelope, delegation, organization, user, asset, audit, and receipt operations
- **Use Case**: Organization-level administrators

### Publisher
- **Description**: Can publish envelopes and view organization data
- **Key Permissions**: Read/write envelopes and payloads, read organizations and assets
- **Use Case**: Fund administrators who publish data

### Asset Owner
- **Description**: Can manage assets and approve delegations
- **Key Permissions**: Read/write envelopes/payloads/assets, approve delegations
- **Use Case**: General Partners (GPs) who own funds

### Subscriber
- **Description**: Can view envelopes and manage delegations
- **Key Permissions**: Read envelopes/payloads, read/write delegations
- **Use Case**: Limited Partners (LPs) who receive data

### Auditor
- **Description**: Read-only access to delegated data
- **Key Permissions**: Read envelopes, payloads, delegations, organizations, assets
- **Use Case**: Third-party auditors with delegated access

### Other Roles
- **Viewer**: Read-only access to organization data
- **Analytics**: Access to analytics and reporting data
- **Tax**: Access to tax-related documents
- **Integration**: API integration access
- **Ops**: Operational access for publishers
- **Signer**: Can sign and approve documents
- **IR**: Investor relations access
- **Risk**: Risk management and compliance access
- **Restricted**: Limited read-only access

## API Authentication

### Header-Based Authentication

All protected API routes require authentication via the `x-user-id` header:

```typescript
const response = await fetch('/api/envelopes', {
  headers: {
    'x-user-id': '501',
  },
})
```

### Middleware Usage

#### Basic Permission Check

```typescript
import { withPermission } from '@/lib/iam/middleware'

export const GET = withPermission('envelopes:read')(async (request, auth, user, org) => {
  // Your handler logic
})
```

#### Multiple Permissions

```typescript
import { requirePermissions } from '@/lib/iam/middleware'

export const POST = requirePermissions('envelopes:write', 'assets:read')(
  async (request, auth, user, org) => {
    // Your handler logic
  }
)
```

#### Custom Authorization

```typescript
import { withAuth } from '@/lib/iam/middleware'
import { authorize } from '@/lib/iam/authorization'

export const GET = withAuth(async (request, auth, user, org) => {
  authorize(auth, 'envelopes:read')
  
  // Custom authorization logic
  if (someCondition) {
    throw new AuthorizationError('Custom error message')
  }
  
  // Your handler logic
})
```

## Resource-Level Access Control

### Envelope Access

Users can access envelopes if they:
1. Are the publisher of the envelope
2. Are the asset owner of the envelope
3. Are the recipient (subscriber) of the envelope
4. Have delegated access through an active delegation

```typescript
import { canAccessEnvelope } from '@/lib/iam/authorization'

if (!canAccessEnvelope(authContext, envelope, organization)) {
  throw new AuthorizationError('Cannot access this envelope')
}
```

### Delegation-Based Access

Delegates can access envelopes based on:
1. Active delegation status
2. Asset scope (specific assets or ALL)
3. Data type scope (specific types or ALL)

```typescript
import { canAccessEnvelopeViaDelegate } from '@/lib/iam/authorization'

if (canAccessEnvelopeViaDelegate(authContext, envelope, delegations)) {
  // Allow access
}
```

## Session Management

### Creating Sessions

```typescript
import { createSession } from '@/lib/iam/session'

const session = await createSession(
  userId,
  orgId,
  ipAddress,
  userAgent
)
```

### Session Validation

```typescript
import { getSession } from '@/lib/iam/session'

const session = await getSession(sessionId)
if (!session) {
  // Session expired or invalid
}
```

### Session Cleanup

```typescript
import { cleanExpiredSessions } from '@/lib/iam/session'

await cleanExpiredSessions()
```

## Audit Logging

### Automatic Logging

The middleware automatically logs IAM-related events when using `logAuditEvent`:

```typescript
import { logAuditEvent } from '@/lib/iam/middleware'

await logAuditEvent(
  auth,
  'CREATE_ENVELOPE',
  'envelopes',
  envelopeId,
  'success',
  request,
  { recipientId, assetId }
)
```

### Audit Event Structure

```typescript
interface AuditEvent {
  id: number
  userId: number
  orgId: number
  action: string
  resource: Resource
  resourceId?: number
  timestamp: string
  ipAddress?: string
  userAgent?: string
  status: 'success' | 'failure'
  details?: any
}
```

## Frontend Integration

### Using the Auth Store

```typescript
import { useAuthStore } from '@/store/auth-store'

function MyComponent() {
  const { 
    currentUser, 
    currentOrg, 
    getPermissions, 
    hasPermission,
    getAuthContext 
  } = useAuthStore()
  
  if (hasPermission('envelopes:write')) {
    // Show write UI
  }
}
```

### Permission-Based UI

```typescript
import { useAuthStore } from '@/store/auth-store'

function ActionButton() {
  const { hasPermission } = useAuthStore()
  
  if (!hasPermission('envelopes:write')) {
    return null
  }
  
  return <button>Create Envelope</button>
}
```

## UI Components

### Permission Badge

Display individual permissions:

```tsx
import { PermissionBadge } from '@/components/iam/permission-badge'

<PermissionBadge permission="envelopes:read" />
```

### Role Permissions Card

Display all permissions for a role:

```tsx
import { RolePermissionsCard } from '@/components/iam/role-permissions-card'

<RolePermissionsCard role="Publisher" />
```

### User Permissions View

Show current user's permissions:

```tsx
import { UserPermissionsView } from '@/components/iam/user-permissions-view'

<UserPermissionsView />
```

## API Routes

### IAM Endpoints

#### Sessions

- `POST /api/iam/sessions` - Create a new session
- `GET /api/iam/sessions?userId={id}` - Get user sessions
- `GET /api/iam/sessions/{id}` - Get specific session
- `DELETE /api/iam/sessions/{id}` - Delete session

#### Permissions

- `GET /api/iam/permissions` - Get all role permissions
- `GET /api/iam/permissions?role={role}` - Get permissions for specific role

#### Audit

- `GET /api/iam/audit` - Get audit events (requires `audit:read` permission)
- Query params: `userId`, `orgId`, `resource`, `limit`

## Database Schema

### Session Model

```prisma
model Session {
  id         String   @id
  userId     Int
  orgId      Int
  createdAt  String
  expiresAt  String
  ipAddress  String?
  userAgent  String?
}
```

### AuditEvent Model

```prisma
model AuditEvent {
  id         Int      @id @default(autoincrement())
  userId     Int
  orgId      Int
  action     String
  resource   String
  resourceId Int?
  timestamp  String
  ipAddress  String?
  userAgent  String?
  status     String
  details    String?
}
```

## Best Practices

1. **Always use middleware** for API route protection
2. **Check resource-level access** in addition to permission checks
3. **Log audit events** for sensitive operations
4. **Clean up expired sessions** periodically
5. **Use the principle of least privilege** when assigning roles
6. **Validate delegation scope** before granting access
7. **Include context information** in audit logs

## Security Considerations

1. **Header-based auth** is for demo purposes only; use proper JWT/OAuth in production
2. **Session tokens** should be cryptographically secure (currently using crypto.randomBytes)
3. **Audit logs** should be immutable and stored securely
4. **Permission checks** should happen on both frontend and backend
5. **Sensitive operations** should require additional verification
6. **Session duration** should be configurable based on security requirements

## Testing IAM

### Testing Permissions

```typescript
import { hasPermission } from '@/lib/iam/permissions'

const canRead = hasPermission('Publisher', 'envelopes:read') // true
const canDelete = hasPermission('Publisher', 'envelopes:delete') // false
```

### Testing Authorization

```typescript
import { canAccessEnvelope } from '@/lib/iam/authorization'

const context = createAuthContext(user, org)
const hasAccess = canAccessEnvelope(context, envelope, org)
```

### Testing with Different Personas

Use the persona switcher in the UI to test different role permissions:
1. Switch to different user (e.g., Platform Admin, Publisher, Subscriber)
2. Navigate to /iam to view current permissions
3. Try accessing different resources to verify access control

## Migration Guide

If upgrading from the previous version:

1. Run database migration: `npm run db:generate && npm run db:migrate`
2. Update API calls to include `x-user-id` header
3. Replace custom auth checks with IAM middleware
4. Update UI components to use auth store hooks
5. Test all protected routes with different roles

## Future Enhancements

Potential improvements for production:

1. JWT-based authentication
2. OAuth/OIDC integration
3. Multi-factor authentication (MFA)
4. Fine-grained permissions (e.g., field-level access)
5. Dynamic role assignment
6. Permission inheritance
7. Time-based access controls
8. IP-based restrictions
9. Rate limiting per role
10. Real-time permission updates
