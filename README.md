# Waypoint Cooperative

Developing private markets data rails - A secure, immutable message bus for private market data.

## Overview

Waypoint is a digital clearinghouse for private market data, enabling secure data transactions between General Partners (GPs) and Limited Partners (LPs) with perfect audit trails. Built by the industry, for the industry.

## Features

- **Contextual Organization Roles**: Roles are derived from relationships, not fixed per org
  - Same org can be Asset Manager for one fund and Limited Partner in another
  - Example: Franklin Park manages FP Venture XV but invests in Costanoa Fund VI
- **Composer Terminal (GP/Fund Admin)**: Compose and publish data packets with Smart Paste CSV/TSV conversion
- **History View**: View chronological feed of data packets with filtering, sorting, and version tracking
- **Subscription Management**: Asset Managers and Delegates manage which LPs can access which assets
- **Unified Access Grants**: Single model for delegated capabilities:
  - **GP Grants**: Asset Managers delegate publishing and management to Fund Admins
  - **LP Grants**: Limited Partners delegate data access to service providers (auditors, analytics)
  - **Capability flags**: `canPublish`, `canViewData`, `canManageSubscriptions`, `canApproveDelegations`
- **Correction Workflow**: Append-only correction mechanism maintaining full audit history (v1 -> v2)
- **Identity Registry**: Platform Admin interface for managing Organizations and Users
- **IAM System**: Role-based access control (RBAC) with organization-level user management
- **Admin Console**: Entity registry and global audit log
- **Mock Authentication**: Persona switcher for demo purposes
- **Cryptographic Signing**: SHA-256 hash generation for data integrity
- **Onboarding Demo**: Interactive KYC/verification flow walkthrough for presentations

## Tech Stack

- **Framework**: Next.js 16 (App Router) with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Neon Serverless PostgreSQL with Prisma ORM
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Data Parsing**: Papa Parse for CSV/TSV
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ (Apple Silicon compatible)
- npm
- Vercel CLI (for environment variables)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd waypoint-coop

# Install dependencies
npm install

# Pull environment variables from Vercel
vercel env pull .env.local

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed the database with demo data
npm run db:seed

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`.

### Environment Variables

The following environment variables are required (auto-injected by Vercel/Neon integration):

```env
# Database connection (Neon PostgreSQL)
DATABASE_URL="postgresql://...@...-pooler.../neondb?sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://...@.../neondb?sslmode=require"

# Individual connection parameters
PGHOST="..."
PGUSER="..."
PGPASSWORD="..."
PGDATABASE="..."
```

To get these variables locally:
```bash
vercel link
vercel env pull .env.local
```

## Demo Personas

Switch between demo personas using the dropdown in the navigation:

| Persona | Organization | Type | Access |
|---------|--------------|------|--------|
| **Alice Admin** | Waypoint Cooperative | Platform Admin | Registry, Audit logs, IAM |
| **Bob GP** | Kleiner Perkins | Asset Manager | Full management, publishing |
| **Genii Publisher** | Genii Admin Services | Fund Admin | Publishing, subscriptions |
| **Charlie LP** | State of Ohio Pension | Limited Partner | History, grants |
| **Dana Delegate** | Deloitte | Auditor | Delegated view access |

## Onboarding Demo

A standalone interactive demo showing the KYC/verification onboarding flow for new organizations.

### Launching the Demo

- **Click the ✨ Demo button** next to the persona picker in the navigation
- **Or navigate directly** to `/demo/onboarding`

### Demo Features

- **Two Personas**: Limited Partner (LP) and Fund Administrator flows
- **12-Screen Flow**: Registration → Email → Dashboard → Verification → Approval
- **Customizable Data**: Edit `public/demo-data.json` before presentations to personalize for your audience

### Customizing for Presentations

Edit `public/demo-data.json` to customize:

```json
{
  "demoConfig": {
    "recipientCompany": "Your Client Name",  // Shows on welcome screen
    "presenterName": "Your Name"
  },
  "personas": {
    "lp": {
      "organization": {
        "name": "Client's Organization Name",
        "lei": "THEIR_LEI_NUMBER"
      },
      "contact": {
        "name": "Contact Name",
        "email": "contact@example.com"
      }
    }
  }
}
```

### Demo Flow

1. **Welcome** - Select organization type (LP or Fund Admin)
2. **Registration** - Pre-filled organization form
3. **Email Verification** - Simulated with skip button
4. **Tier 0 Dashboard** - Shows locked features
5. **LEI Verification** - GLEIF validation simulation
6. **Organization Details** - Entity information
7. **Beneficial Owners** - UBO disclosure with verification badges
8. **Document Upload** - Required documentation
9. **Review & Submit** - Attestations
10. **Pending Review** - Status timeline
11. **Approved** - Success with confetti! 🎉

## Project Structure

```
waypoint-coop/
├── app/                    # Next.js App Router
│   ├── api/                # API routes
│   │   ├── organizations/  # Organization CRUD
│   │   ├── assets/         # Asset CRUD
│   │   ├── subscriptions/  # Subscription management
│   │   ├── access-grants/  # Access Grant CRUD + approval
│   │   ├── envelopes/      # Envelope publishing + corrections
│   │   ├── users/          # User management
│   │   └── audit/          # Audit log retrieval
│   ├── demo/onboarding/    # Interactive onboarding demo
│   ├── composer/           # Compose and publish data
│   ├── history/            # Data packet history with filtering
│   ├── subscriptions/      # Subscription management
│   ├── access-grants/      # Access Grant management
│   ├── settings/iam/       # Identity and Access Management page
│   ├── registry/           # Admin entity registry
│   └── audit/              # Admin audit log
├── components/             # React components
│   ├── ui/                 # shadcn/ui components
│   └── shared/             # Shared components
├── lib/                    # Utilities
│   ├── prisma.ts           # Prisma client
│   ├── permissions.ts      # ReBAC permission system
│   ├── crypto.ts           # Cryptographic utilities
│   └── utils.ts            # Helper functions
├── prisma/                 # Prisma schema and migrations
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Demo data seeding
├── store/                  # Zustand stores
│   └── auth-store.ts       # Persona switching
└── reference/              # Documentation
```

## Available Scripts

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

## Vercel Deployment

The application is configured for automatic deployment to Vercel:

1. **Connect your GitHub repository to Vercel**
2. **Create a Neon database via Vercel Dashboard**
   - Go to Storage → Create Database → Select Neon
3. **Vercel will auto-detect Next.js and inject environment variables**
4. **Push to main branch to trigger deployment**

### Build Configuration

The `vercel.json` file is pre-configured:
```json
{
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

## Database

- **Provider**: Neon Serverless PostgreSQL
- **ORM**: Prisma
- **Region**: US East (iad1)
- **Connection**: Pooled via pgbouncer, direct for migrations

### Database Management

```bash
# View data in browser
npm run db:studio

# Reset and reseed
npm run db:reset

# Create a new migration
npx prisma migrate dev --name <migration-name>
```

## Documentation

See the `reference/` folder for detailed documentation:

- `architecture_and_deployment.md` - System architecture and deployment guide
- `0_design_guide.md` - Design system and UI patterns
- `2_permission_schema.md` - ReBAC permission model
- `Waypoint_Narrative.md` - Stakeholder dynamics and data flows

## Phase 1 Scope

This demonstration covers:

| Area | Features |
|------|----------|
| **Access & Permissions** | Identity Verification, Permission Rules, Audit Logging, Access Changes |
| **Security** | SHA-256 hashing, Audit trails, Role-based access |
| **Data Artifacts** | Capital Calls, Distributions, Financial Statements, Tax Documents |

## License

See LICENSE file for details.
