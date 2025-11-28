# IAM Quick Start Guide

## Overview
The Waypoint application now has a complete IAM (Identity and Access Management) system with role-based access control, session management, and audit logging.

## Getting Started

### 1. Run Database Migrations
```bash
npm run db:generate
npm run db:migrate
```

### 2. Start the Application
```bash
npm run dev
```

### 3. View IAM Interface
- Log in as **Alice Admin** (Platform Admin)
- Navigate to **IAM** in the navigation
- View your permissions and all role definitions

## Quick Reference

### Testing Different Roles

**Switch Personas** via the dropdown in navigation:
- **Alice Admin (501)** - Platform Admin - Full access
- **Genii Publisher (521)** - Publisher - Can create envelopes
- **Bob GP (502)** - Asset Owner - Can approve delegations
- **Charlie LP (503)** - Subscriber - Can view ledger
- **Dana Delegate (504)** - Auditor - Read-only delegated access

### API Authentication

All API calls now require the `x-user-id` header:

```javascript
fetch('/api/envelopes', {
  headers: {
    'x-user-id': '501'
  }
})
```

### Check Permissions in UI

```tsx
import { useAuthStore } from '@/store/auth-store'

function MyComponent() {
  const { hasPermission } = useAuthStore()
  
  if (hasPermission('envelopes:write')) {
    return <CreateButton />
  }
  
  return null
}
```

### Common API Endpoints

```bash
# View permissions for a role
GET /api/iam/permissions?role=Publisher

# Create a session
POST /api/iam/sessions
{ "userId": 501, "orgId": 1 }

# View audit logs (requires admin)
GET /api/iam/audit
Headers: x-user-id: 501

# Get envelopes (filtered by access)
GET /api/envelopes
Headers: x-user-id: 503
```

## Permission Types

### Format: `resource:action`

**Resources:**
- envelopes, payloads, delegations, organizations, users, assets, audit, receipts, admin

**Actions:**
- read, write, delete, approve, revoke, all

**Examples:**
- `envelopes:read` - Can view envelopes
- `delegations:approve` - Can approve delegation requests
- `admin:all` - Full administrative access

## Role Summary

| Role | Key Permissions | Use Case |
|------|----------------|----------|
| Platform Admin | admin:all | System operators |
| Admin | All except admin:all | Org administrators |
| Publisher | envelopes R/W, payloads R/W | Fund administrators |
| Asset Owner | envelopes R/W, delegations approve | General Partners |
| Subscriber | envelopes R, delegations R/W | Limited Partners |
| Auditor | Read-only | Third-party auditors |

## Testing IAM

### 1. Test Authorization
```bash
# Should succeed (Platform Admin)
curl -H "x-user-id: 501" http://localhost:3000/api/audit

# Should fail (Publisher has no audit:read)
curl -H "x-user-id: 521" http://localhost:3000/api/audit
# Returns: 403 Forbidden
```

### 2. Test Access Control
```bash
# Publisher can create envelopes
curl -X POST -H "x-user-id: 521" http://localhost:3000/api/envelopes \
  -H "Content-Type: application/json" \
  -d '{"publisherId":1001,...}'

# Auditor cannot create envelopes
curl -X POST -H "x-user-id: 504" http://localhost:3000/api/envelopes \
  -H "Content-Type: application/json" \
  -d '{"publisherId":1001,...}'
# Returns: 403 Forbidden
```

### 3. View Audit Logs
As Platform Admin:
1. Visit `/iam` page
2. Make some API calls (create envelope, update delegation)
3. Call `GET /api/iam/audit` to see logged events

## File Locations

### Core IAM
- `lib/iam/permissions.ts` - Permission definitions
- `lib/iam/authorization.ts` - Access control logic
- `lib/iam/middleware.ts` - API protection
- `lib/iam/session.ts` - Session management

### API Routes
- `app/api/iam/sessions/` - Session management
- `app/api/iam/permissions/` - Permission discovery
- `app/api/iam/audit/` - Audit log viewing

### UI Components
- `components/iam/permission-badge.tsx` - Permission display
- `components/iam/role-permissions-card.tsx` - Role overview
- `components/iam/user-permissions-view.tsx` - User access display
- `app/iam/page.tsx` - IAM management interface

### Documentation
- `docs/6_IAM_IMPLEMENTATION.md` - Complete guide
- `docs/7_IAM_API_EXAMPLES.md` - API usage examples
- `IAM_SUMMARY.md` - Implementation summary
- `IMPLEMENTATION_COMPLETE.md` - Completion checklist

## Common Tasks

### Add New Permission
1. Add to Permission type in `types/iam.ts`
2. Update permissionLabels in `components/iam/permission-badge.tsx`
3. Add to appropriate roles in `lib/iam/permissions.ts`

### Create New Role
1. Add to UserRole type in `types/index.ts`
2. Add role definition to ROLE_PERMISSIONS in `lib/iam/permissions.ts`
3. Test with persona switcher

### Protect New API Route
```typescript
import { withPermission } from '@/lib/iam/middleware'

export const GET = withPermission('resource:read')(async (request, auth, user, org) => {
  // Your handler logic
})
```

### Log Audit Event
```typescript
import { logAuditEvent } from '@/lib/iam/middleware'

await logAuditEvent(
  auth,
  'ACTION_NAME',
  'resource',
  resourceId,
  'success',
  request,
  { optional: 'details' }
)
```

## Troubleshooting

### 401 Unauthorized
- Missing `x-user-id` header
- Invalid user ID

### 403 Forbidden
- User lacks required permission
- Resource access denied
- Organizational boundary violation

### Check Current User Permissions
```typescript
const { getPermissions, getAuthContext } = useAuthStore()

console.log('Permissions:', getPermissions())
console.log('Context:', getAuthContext())
```

## Production Checklist

Before deploying to production:

- [ ] Replace header auth with JWT/OAuth
- [ ] Add multi-factor authentication
- [ ] Implement rate limiting
- [ ] Configure production database
- [ ] Enable real-time audit monitoring
- [ ] Set up IP-based restrictions
- [ ] Add automated security testing
- [ ] Configure session expiration policies
- [ ] Enable audit log retention
- [ ] Set up security alerts

## Need Help?

- **Implementation Guide**: `docs/6_IAM_IMPLEMENTATION.md`
- **API Examples**: `docs/7_IAM_API_EXAMPLES.md`
- **Summary**: `IAM_SUMMARY.md`
- **Completion Checklist**: `IMPLEMENTATION_COMPLETE.md`

## Status

✅ **IAM Implementation: COMPLETE**

All 7 tasks completed:
1. ✅ IAM types and permission definitions
2. ✅ Authorization middleware and utilities
3. ✅ Prisma schema with IAM models
4. ✅ IAM API routes for session management
5. ✅ Authorization on existing API routes
6. ✅ Auth store with IAM capabilities
7. ✅ UI components for permission management

The system is fully operational and ready for use!
