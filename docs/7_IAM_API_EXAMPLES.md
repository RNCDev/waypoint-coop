# IAM API Examples

## Authentication

All API requests require the `x-user-id` header for authentication:

```bash
curl -H "x-user-id: 501" http://localhost:3000/api/envelopes
```

## Session Management

### Create Session

```bash
curl -X POST http://localhost:3000/api/iam/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 501,
    "orgId": 1
  }'
```

Response:
```json
{
  "id": "abc123...",
  "userId": 501,
  "orgId": 1,
  "createdAt": "2025-11-28T10:00:00.000Z",
  "expiresAt": "2025-11-29T10:00:00.000Z",
  "ipAddress": "127.0.0.1",
  "userAgent": "curl/7.68.0"
}
```

### Get User Sessions

```bash
curl http://localhost:3000/api/iam/sessions?userId=501
```

### Get Specific Session

```bash
curl http://localhost:3000/api/iam/sessions/abc123...
```

### Delete Session

```bash
curl -X DELETE http://localhost:3000/api/iam/sessions/abc123...
```

## Permissions

### Get All Role Permissions

```bash
curl http://localhost:3000/api/iam/permissions
```

Response:
```json
{
  "Platform Admin": {
    "role": "Platform Admin",
    "description": "Full access to all platform resources and operations",
    "permissions": ["admin:all"]
  },
  "Publisher": {
    "role": "Publisher",
    "description": "Can publish envelopes and view organization data",
    "permissions": [
      "envelopes:read",
      "envelopes:write",
      "payloads:read",
      "payloads:write",
      ...
    ]
  }
}
```

### Get Permissions for Specific Role

```bash
curl http://localhost:3000/api/iam/permissions?role=Publisher
```

Response:
```json
{
  "role": "Publisher",
  "description": "Can publish envelopes and view organization data",
  "permissions": [
    "envelopes:read",
    "envelopes:write",
    "payloads:read",
    "payloads:write",
    "organizations:read",
    "assets:read",
    "receipts:read"
  ]
}
```

## Audit Logs

### Get All Audit Events

```bash
curl -H "x-user-id: 501" http://localhost:3000/api/iam/audit
```

### Filter by User

```bash
curl -H "x-user-id: 501" \
  "http://localhost:3000/api/iam/audit?userId=501"
```

### Filter by Organization

```bash
curl -H "x-user-id: 501" \
  "http://localhost:3000/api/iam/audit?orgId=1001"
```

### Filter by Resource

```bash
curl -H "x-user-id: 501" \
  "http://localhost:3000/api/iam/audit?resource=envelopes"
```

### Limit Results

```bash
curl -H "x-user-id: 501" \
  "http://localhost:3000/api/iam/audit?limit=10"
```

Response:
```json
[
  {
    "id": 1,
    "userId": 501,
    "orgId": 1001,
    "action": "CREATE_ENVELOPE",
    "resource": "envelopes",
    "resourceId": 10001,
    "timestamp": "2025-11-28T10:00:00.000Z",
    "ipAddress": "127.0.0.1",
    "userAgent": "curl/7.68.0",
    "status": "success",
    "details": {
      "recipientId": 3001,
      "assetId": 9001
    }
  }
]
```

## Protected Endpoints

### Envelopes

#### Get Envelopes (requires envelopes:read)

```bash
# Platform Admin - sees all envelopes
curl -H "x-user-id: 501" http://localhost:3000/api/envelopes

# Publisher - sees only their published envelopes
curl -H "x-user-id: 521" http://localhost:3000/api/envelopes

# Subscriber - sees only envelopes addressed to them
curl -H "x-user-id: 503" http://localhost:3000/api/envelopes
```

#### Create Envelope (requires envelopes:write)

```bash
curl -X POST http://localhost:3000/api/envelopes \
  -H "x-user-id: 521" \
  -H "Content-Type: application/json" \
  -d '{
    "publisherId": 1001,
    "userId": 521,
    "assetOwnerId": 2001,
    "assetId": 9001,
    "recipientId": 3001,
    "timestamp": "2025-11-28T10:00:00.000Z",
    "dataType": "CAPITAL_CALL",
    "payload": {
      "amount": 1000000,
      "currency": "USD"
    }
  }'
```

#### Get Specific Envelope (requires envelopes:read)

```bash
curl -H "x-user-id: 503" http://localhost:3000/api/envelopes/10001
```

### Payloads

#### Get Payload (requires payloads:read)

```bash
curl -H "x-user-id: 503" \
  http://localhost:3000/api/payloads/10001
```

### Delegations

#### Get Delegations (requires delegations:read)

```bash
# Get all delegations for a subscriber
curl -H "x-user-id: 503" \
  "http://localhost:3000/api/delegations?subscriberId=3001"

# Get delegations for a delegate
curl -H "x-user-id: 504" \
  "http://localhost:3000/api/delegations?delegateId=4001"
```

#### Create Delegation (requires delegations:write)

```bash
curl -X POST http://localhost:3000/api/delegations \
  -H "x-user-id: 503" \
  -H "Content-Type: application/json" \
  -d '{
    "subscriberId": 3001,
    "delegateId": 4001,
    "assetScope": "ALL",
    "typeScope": ["CAPITAL_CALL", "DISTRIBUTION"]
  }'
```

#### Update Delegation (requires delegations:approve for GPs)

```bash
curl -X PUT http://localhost:3000/api/delegations/D-101 \
  -H "x-user-id: 502" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Active",
    "gpApprovalStatus": "Approved"
  }'
```

### Organizations

#### Get Organizations (requires organizations:read)

```bash
curl -H "x-user-id: 501" http://localhost:3000/api/organizations
```

#### Get Specific Organization

```bash
curl -H "x-user-id: 501" \
  "http://localhost:3000/api/organizations?id=1001"
```

## Error Responses

### 401 Unauthorized (Missing Authentication)

```json
{
  "error": "Authentication required. Include x-user-id header."
}
```

### 403 Forbidden (Insufficient Permissions)

```json
{
  "error": "Permission denied: envelopes:write required"
}
```

### 404 Not Found

```json
{
  "error": "Envelope not found"
}
```

### 400 Bad Request (Validation Error)

```json
{
  "error": "Validation error",
  "details": [
    {
      "path": ["publisherId"],
      "message": "Required"
    }
  ]
}
```

## Testing Different Roles

### Platform Admin (Alice - User 501)

```bash
# Can access everything
curl -H "x-user-id: 501" http://localhost:3000/api/envelopes
curl -H "x-user-id: 501" http://localhost:3000/api/audit
curl -H "x-user-id: 501" http://localhost:3000/api/organizations
```

### Publisher (Genii - User 521)

```bash
# Can read/write envelopes for their organization
curl -H "x-user-id: 521" http://localhost:3000/api/envelopes
curl -X POST -H "x-user-id: 521" http://localhost:3000/api/envelopes \
  -H "Content-Type: application/json" \
  -d '{...}'

# Cannot access audit logs
curl -H "x-user-id: 521" http://localhost:3000/api/iam/audit
# Returns: 403 Forbidden
```

### Subscriber (Charlie - User 503)

```bash
# Can view their envelopes
curl -H "x-user-id: 503" http://localhost:3000/api/envelopes

# Can manage their delegations
curl -X POST -H "x-user-id: 503" http://localhost:3000/api/delegations \
  -H "Content-Type: application/json" \
  -d '{...}'

# Cannot create envelopes
curl -X POST -H "x-user-id: 503" http://localhost:3000/api/envelopes \
  -H "Content-Type: application/json" \
  -d '{...}'
# Returns: 403 Forbidden
```

### Auditor (Dana - User 504)

```bash
# Can view envelopes via delegation
curl -H "x-user-id: 504" http://localhost:3000/api/envelopes

# Cannot modify anything
curl -X POST -H "x-user-id: 504" http://localhost:3000/api/delegations \
  -H "Content-Type: application/json" \
  -d '{...}'
# Returns: 403 Forbidden
```

## Frontend Usage

### Making Authenticated Requests

```typescript
import { useAuthStore } from '@/store/auth-store'

function MyComponent() {
  const { currentUser } = useAuthStore()
  
  async function fetchEnvelopes() {
    const response = await fetch('/api/envelopes', {
      headers: {
        'x-user-id': currentUser.id.toString(),
      },
    })
    return response.json()
  }
}
```

### Checking Permissions

```typescript
import { useAuthStore } from '@/store/auth-store'

function CreateEnvelopeButton() {
  const { hasPermission } = useAuthStore()
  
  if (!hasPermission('envelopes:write')) {
    return null
  }
  
  return <button onClick={createEnvelope}>Create Envelope</button>
}
```

### Getting Current Context

```typescript
import { useAuthStore } from '@/store/auth-store'

function MyComponent() {
  const { getAuthContext, getPermissions } = useAuthStore()
  
  const context = getAuthContext()
  // { userId, orgId, role, permissions, sessionId }
  
  const permissions = getPermissions()
  // ['envelopes:read', 'envelopes:write', ...]
}
```
