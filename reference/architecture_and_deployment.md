# Waypoint Architecture and Deployment Guide

## Overview

This document describes the technical architecture for the Waypoint Cooperative Phase 1 demonstration application. The system implements a Relationship-Based Access Control (ReBAC) model for permissioned data exchange in private capital markets.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | Next.js 16 (App Router) | React 19, Server Components, API Routes |
| **Styling** | Tailwind CSS + shadcn/ui | Dark theme, Stripe-like aesthetic |
| **Animation** | Framer Motion | Polished micro-interactions |
| **State** | Zustand | Client-side state management |
| **Database** | Neon (Serverless Postgres) | Persistent storage |
| **ORM** | Prisma | Type-safe database access |
| **Deployment** | Vercel | Edge deployment, auto-scaling |

---

## Database Architecture

### Provider: Neon Serverless Postgres

Neon provides a serverless PostgreSQL database with:
- Connection pooling via pgbouncer
- Automatic scaling
- Branching for development
- Point-in-time recovery

### Connection Strategy

```env
# Pooled connection (for application queries)
DATABASE_URL=postgresql://...@...-pooler.../neondb?sslmode=require

# Direct connection (for migrations)
DATABASE_URL_UNPOOLED=postgresql://...@.../neondb?sslmode=require
```

**Important**: Prisma requires the direct connection for migrations because pgbouncer doesn't support the extended query protocol.

### Prisma Configuration

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DATABASE_URL_UNPOOLED")
}
```

---

## Data Model (ReBAC with Temporal Ownership)

The system implements **Relationship-Based Access Control** where permissions are derived from relationships between entities, not static roles. The model includes temporal tracking to handle ownership transfers and automatic access revocation.

### Core Entities

```
┌─────────────────────────────────────────────────────────────────┐
│                         ORGANIZATIONS                           │
│  (GPs, LPs, Fund Admins, Auditors, Consultants, Tax Advisors)   │
│  Type: String (extensible - no hardcoded enums)                 │
└─────────────────────────────────────────────────────────────────┘
         │                    │                      │
         │ manages            │ subscribes           │ delegated
         ▼                    ▼                      ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐
│     ASSETS      │  │  SUBSCRIPTIONS  │  │    ACCESS GRANTS    │
│  (Funds, SPVs,  │  │  (LP→Asset)     │  │  (Grantor→Grantee)  │
│   PortCos)      │  │  + validFrom    │  │  + validFrom        │
│  Type: String   │  │  + validTo      │  │  + expiresAt        │
└─────────────────┘  └─────────────────┘  └─────────────────────┘
         │                                           │
         │ contains                                  │ enables
         ▼                                           ▼
┌─────────────────┐                      ┌─────────────────────┐
│  DATA PACKETS   │                      │    CAPABILITIES     │
│  (Envelopes)    │                      │  (Publish, View,    │
│                 │                      │   Manage, Approve)  │
└─────────────────┘                      └─────────────────────┘
```

### Temporal Chain of Trust

The system implements automatic access revocation through temporal subscription tracking:

1. **Subscriptions track ownership periods**:
   - `validFrom`: When subscription became active (default: now())
   - `validTo`: When subscription ended (null = currently active)
   - Allows same LP to hold same asset at different times (no unique constraint)

2. **Permission checks validate grant chains**:
   - When checking a grant, verify grantor's authority is still valid
   - If grantor is Manager: pass (always has authority)
   - If grantor is LP: check subscription has `validTo = null` OR `validTo > now()`
   - If chain breaks: deny access even if grant status is ACTIVE

3. **Benefits**:
   - **Auto-revocation**: No manual cleanup when LP sells position
   - **Audit preservation**: Grants remain ACTIVE for history, but fail permission checks
   - **Resilience**: Ownership can transfer without rewriting permission records

### Extensible Type System

- **Organization.type**: `String?` (previously enum) - supports 'GP', 'LP', 'CRYPTO_FUND', etc.
- **Asset.type**: `String` (previously enum) - supports 'FUND', 'SPV', 'PORTFOLIO_COMPANY', etc.
- **Governance enums preserved**: GrantStatus, SubscriptionStatus remain enums (finite states)

### Permission Evaluation

Permissions are evaluated at runtime by traversing the relationship graph:

1. **Is Org the Asset Manager?** → Full authority (root access)
2. **Is Org a Subscriber (LP)?** → Check temporal validity, then grant implicit view rights
3. **Does Org have an Active AccessGrant?** → Validate grant chain, then check capabilities

```typescript
// Permission check with chain validation
const result = await canPerformAction(orgId, 'view', assetId)
// Returns: { 
//   allowed: boolean, 
//   reason: string, 
//   via: 'manager' | 'subscription' | 'grant'
// }

// If via 'grant', internally validates:
// 1. Grant status is ACTIVE
// 2. Grant not expired
// 3. Grantor still has authority (temporal subscription check)
```

---

## Application Structure

```
waypoint-coop/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout with fonts, providers
│   ├── globals.css               # Design tokens, theme
│   ├── page.tsx                  # Dashboard landing page
│   │
│   ├── api/                      # API Routes
│   │   ├── organizations/        # Organization CRUD
│   │   ├── assets/               # Asset CRUD
│   │   ├── subscriptions/        # Subscription CRUD
│   │   ├── access-grants/        # Access Grant CRUD + approval
│   │   ├── envelopes/            # Envelope publishing + corrections
│   │   ├── users/                # User management
│   │   └── audit/                # Audit log retrieval
│   │
│   ├── composer/                 # GP/Admin: Publish data packets
│   ├── history/                  # View published envelope history
│   ├── ledger/                   # LP: Chronological feed with read receipts
│   ├── feeds/                    # LP: Subscription-based data feeds
│   ├── subscriptions/            # Manage LP subscriptions
│   ├── access-grants/            # Access Grant management
│   ├── registry/                 # Admin: Organization and User registry
│   ├── audit/                    # Admin: Global audit log
│   └── settings/iam/             # Organization Identity and Access Management
│
├── components/
│   ├── ui/                       # shadcn/ui components
│   └── shared/                   # App-specific components
│       ├── navbar.tsx            # Navigation with persona switcher
│       ├── persona-switcher.tsx  # Demo persona dropdown
│       ├── grant-builder.tsx     # Visual Access Grant creation
│       └── envelope-card.tsx     # Data packet display card
│
├── lib/
│   ├── prisma.ts                 # Prisma client singleton
│   ├── permissions.ts            # ReBAC evaluation logic
│   ├── crypto.ts                 # SHA-256 hash generation
│   └── utils.ts                  # Utility functions
│
├── store/
│   └── auth-store.ts             # Zustand store for persona switching
│
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Demo data seeding
│
└── reference/                    # Documentation
    ├── 0_design_guide.md
    ├── 2_permission_schema.md
    ├── architecture_and_deployment.md  # This file
    └── Waypoint_Narrative.md
```

---

## API Design

All API routes follow RESTful conventions:

| Endpoint | Methods | Purpose |
|----------|---------|---------|
| `/api/organizations` | GET, POST | Organization CRUD |
| `/api/organizations/[id]` | GET, PUT, DELETE | Single organization |
| `/api/assets` | GET, POST | Asset CRUD |
| `/api/assets/[id]` | GET, PUT, DELETE | Single asset |
| `/api/assets/[id]/route-map` | GET | Permission topology visualization |
| `/api/subscriptions` | GET, POST | Subscription management |
| `/api/subscriptions/[id]` | GET, PATCH, DELETE | Single subscription (PATCH for transfers) |
| `/api/access-grants` | GET, POST | Access Grant CRUD |
| `/api/access-grants/[id]` | GET, PUT, DELETE | Single grant |
| `/api/access-grants/[id]/approve` | POST | GP approval workflow |
| `/api/data-packets` | GET, POST | Data packet publishing |
| `/api/data-packets/[id]` | GET | Single data packet |
| `/api/data-packets/[id]/correct` | POST | Correction workflow |
| `/api/data-packets/[id]/read` | POST | Mark as read |
| `/api/audit` | GET | Audit log retrieval |
| `/api/users` | GET, POST | User management |

### Query Parameters

Most list endpoints support filtering:
- `?assetId=xxx` - Filter by asset
- `?subscriberId=xxx` - Filter by subscriber
- `?grantorId=xxx` - Filter by grantor
- `?status=ACTIVE` - Filter by status
- `?type=CAPITAL_CALL` - Filter by type
- `?temporal=current` - Filter subscriptions by temporal state (current/historical/all)
- `?publisherId=xxx` - Filter by publisher (route-map visibility)

---

## Deployment

### Prerequisites

1. **Vercel Account** - For hosting
2. **Neon Account** - For database (created via Vercel integration)
3. **GitHub Repository** - For version control and CI/CD

### Vercel + Neon Setup

1. **Connect Repository to Vercel**
   ```bash
   vercel link
   ```

2. **Create Neon Database via Vercel Dashboard**
   - Go to Storage → Create Database
   - Select Neon
   - Choose region (us-east-1 recommended)
   - Vercel will auto-inject environment variables

3. **Pull Environment Variables Locally**
   ```bash
   vercel env pull .env.local
   ```

4. **Run Database Migrations**
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

5. **Deploy**
   ```bash
   git push origin main
   # Vercel will auto-deploy on push
   ```

### Environment Variables

Required variables (auto-injected by Vercel/Neon integration):

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Pooled connection string |
| `DATABASE_URL_UNPOOLED` | Direct connection for migrations |
| `PGHOST` | Database host |
| `PGUSER` | Database user |
| `PGPASSWORD` | Database password |
| `PGDATABASE` | Database name |

### Vercel Configuration

The `vercel.json` file configures:
- Build command: `npm run build`
- Framework: Next.js
- Region: `iad1` (US East)

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

---

## Local Development

### Initial Setup

```bash
# Clone repository
git clone <repo-url>
cd waypoint-coop

# Install dependencies
npm install

# Pull environment variables from Vercel
vercel env pull .env.local

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Start development server
npm run dev
```

### Available Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript type checking |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed database with demo data |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:reset` | Reset database and reseed |

### Prisma Studio

For visual database management:
```bash
npm run db:studio
```

Opens at http://localhost:5555

---

## Security Considerations

### Phase 1 Security Features

1. **Data Integrity** - SHA-256 hashes for all envelopes
2. **Audit Logging** - Complete trail of all actions
3. **Permission Checks** - ReBAC evaluation on every action
4. **Approval Workflows** - GP approval for LP delegations

### Future Considerations (Phase 2+)

- vLEI integration for identity verification
- mTLS for machine-to-machine authentication
- Field-level encryption for PII
- SOC 2 / ISO 27001 compliance

---

## Demo Personas

The application includes demo personas for testing different user flows and temporal scenarios:

| Persona | Organization | Type | Access |
|---------|--------------|------|--------|
| Alice Admin | Waypoint Cooperative | PLATFORM_ADMIN | Registry, Audit |
| Bob GP | Kleiner Perkins | GP | Full management |
| Genii Publisher | Genii Admin Services | FUND_ADMIN | Publishing |
| Charlie LP | State of Ohio Pension | LP | Feeds, History |
| Dana Delegate | Deloitte | AUDITOR | Delegated view |
| Sarah Michigan | Michigan State Pension | LP | Position transfer recipient |

### Temporal Chain of Trust Demonstrations

**Scenario 1: LP Position Transfer (CalPERS → Michigan Pension)**
- CalPERS subscription to KP Fund XXI: CLOSED with validTo 3 months ago
- Michigan Pension subscription: ACTIVE with validFrom 3 months ago
- CalPERS consultant (Cambridge): Grant ACTIVE but access DENIED (broken chain)
- Michigan consultant (Cambridge): Grant ACTIVE and access ALLOWED (valid chain)

**Scenario 2: Publisher Administrative Change**
- KP Fund XX switched from Genii Admin to SS&C Admin 1 year ago
- Old admin grant: EXPIRED with expiresAt in past
- New admin grant: ACTIVE from transition date
- Demonstrates seamless operational transitions

**Scenario 3: Historical Ownership**
- Ohio Pension's historical position in KP Fund XX (2020-2023)
- Subscription closed with validTo = 2023-12-31
- Full audit trail preserved

Switch personas using the dropdown in the navigation bar.

---

## Troubleshooting

### Common Issues

**Database connection errors**
- Ensure `.env.local` has correct `DATABASE_URL`
- Check if Neon database is accessible
- Verify SSL mode is set to `require`

**Prisma migration errors**
- Use `DATABASE_URL_UNPOOLED` for migrations
- Run `npm run db:generate` before `npm run db:migrate`

**Build errors on Vercel**
- Check that Prisma schema is valid
- Ensure all dependencies are in `package.json`
- Verify environment variables are set in Vercel dashboard

### Getting Help

- Check the `reference/` folder for detailed documentation
- Review Prisma logs: `DEBUG=prisma* npm run dev`
- Check Neon dashboard for database issues

---

## References

- [Waypoint Narrative](./Waypoint_Narrative.md) - Stakeholder dynamics and data flows
- [Permission Schema](./2_permission_schema.md) - ReBAC model specification
- [Design Guide](./0_design_guide.md) - UI/UX patterns and styling
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Neon Documentation](https://neon.tech/docs)