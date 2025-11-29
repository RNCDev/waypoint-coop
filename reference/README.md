# Reference Files

This folder contains reference copies of the previous implementation's core files.

## Files

- **types-reference.ts** - TypeScript type definitions (Organization, Asset, Subscription, AccessGrant, etc.)
- **permissions-reference.ts** - Permission logic with contextual role derivation
- **mock-data-reference.ts** - Mock data for testing
- **schema-reference.prisma** - Database schema

## API Routes

The API routes in `app/api/` are kept for reference. They include:
- `/api/access-grants/*` - Access grant CRUD
- `/api/subscriptions/*` - Subscription management
- `/api/assets/*` - Asset management
- `/api/envelopes/*` - Envelope/payload management
- And more...

## Notes

These files are kept as reference while rebuilding with the new permission model. The new implementation should be informed by these but may differ significantly based on the new permission file.

