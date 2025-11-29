# Waypoint Coop

Developing private markets data rails - A secure, immutable message bus for private market data.

## Overview

Waypoint is a digital clearinghouse for private market data, enabling secure data transactions between General Partners (GPs) and Limited Partners (LPs) with perfect audit trails.

## Features

- **Contextual Organization Roles**: Roles are derived from relationships, not fixed per org
  - Same org can be Asset Manager for one fund and Limited Partner in another
  - Example: Franklin Park manages FP Venture XV but invests in Costanoa Fund VI
- **Composer Terminal (GP/Fund Admin)**: Compose and publish data packets with Smart Paste CSV/TSV conversion
- **LP Ledger**: View chronological feed of data events with read receipt tracking
- **Subscription Management**: Asset Managers and Delegates manage which LPs can access which assets
- **Unified Access Grants**: Single model for delegated capabilities:
  - **GP Grants**: Asset Managers delegate publishing and management to Fund Admins
  - **LP Grants**: Limited Partners delegate data access to service providers (auditors, analytics)
  - **Capability flags**: `canPublish`, `canViewData`, `canManageSubscriptions`, `canApproveSubscriptions`, `canApproveDelegations`
- **Correction Workflow**: Append-only correction mechanism maintaining full audit history (v1 -> v2)
- **Identity Registry**: Platform Admin interface for managing Organizations and Users
- **IAM System**: Role-based access control (RBAC) with organization-level user management
- **Admin Console**: Entity registry and global audit log
- **Mock Authentication**: Persona switcher for demo purposes
- **Cryptographic Signing**: SHA-256 hash generation for data integrity

## Tech Stack

- **Framework**: Next.js 14+ (App Router) with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Prisma ORM with SQLite (local) / In-memory (Vercel)
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Data Parsing**: Papa Parse for CSV/TSV
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ (Apple Silicon compatible)
- npm

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and set DATABASE_URL="file:./dev.db"

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed the database with mock data
npm run db:seed

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`.

## Demo Personas

Switch between demo personas using the dropdown in the navigation:

- **Alice Admin** (Platform Admin: Waypoint Coop) - Manages platform registry, audit logs, and IAM
- **Bob GP** (Asset Manager: Kleiner Perkins) - Manages subscriptions, access grants, publishes data, and views history
- **Genii Publisher** (Delegate: Genii Admin Services) - Views subscriptions, publishes data, views history, and manages IAM
- **Charlie LP** (Limited Partner: State of Ohio Pension) - Views feeds, ledger, manages access grants, and IAM
- **Dana Delegate** (Auditor: Deloitte) - Views delegated data and manages IAM

## Project Structure

```
waypoint-coop/
├── app/                    # Next.js App Router
│   ├── api/                # API routes
│   │   ├── subscriptions/      # Subscription CRUD
│   │   ├── access-grants/      # Unified Access Grant CRUD
│   │   └── envelopes/          # Envelope CRUD & Corrections
│   ├── composer/           # Composer page (publish data)
│   ├── history/            # Published data history
│   ├── ledger/             # LP ledger page
│   ├── feeds/              # LP subscription feeds
│   ├── subscriptions/      # Subscription management
│   ├── access-grants/      # Unified Access Grant management
│   ├── settings/iam/       # IAM settings page
│   ├── registry/           # Admin entity registry (Organizations & Users)
│   └── audit/              # Admin audit log
├── components/             # React components
│   ├── ui/                 # shadcn/ui components
│   └── shared/             # Shared components
├── lib/                    # Utilities
│   ├── prisma.ts           # Prisma client
│   ├── permissions.ts      # Permission system & RBAC
│   ├── api-guard.ts        # API route guards
│   ├── mock-data.ts        # Mock data (Organizations, Users, Assets, AccessGrants)
│   ├── in-memory-db.ts     # In-memory DB for Vercel
│   └── crypto.ts           # Cryptographic utilities
├── prisma/                 # Prisma schema and migrations
└── store/                  # Zustand stores
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with mock data
- `npm run db:studio` - Open Prisma Studio
- `npm run db:reset` - Reset database and reseed

## Vercel Deployment

The application is configured for automatic deployment to Vercel:

1. Connect your GitHub repository to Vercel
2. Vercel will auto-detect Next.js settings
3. The application uses in-memory storage on Vercel (no database required)
4. Mock data is loaded on each API route invocation

### Environment Variables

For Vercel deployment, no environment variables are required as the app uses in-memory storage.

For local development, create a `.env` file:
```
DATABASE_URL="file:./dev.db"
NODE_ENV="development"
```

## Database

- **Local Development**: SQLite database (`prisma/dev.db`)
- **Vercel Production**: In-memory storage (resets on each serverless function invocation)

## Documentation

See the `support-docs/` folder for detailed documentation:
- `0_Phase_1_Overview.md` - Feature requirements and user stories
- `1_Permission_Delegation_Schema.md` - Permission model
- `2_Architecture_Overview.md` - System architecture
- `3_Mock_Data.md` - Mock data definitions
- `8_infra-build.md` - Infrastructure setup
- `9_design_guide.md` - Design system and UI patterns

## License

See LICENSE file for details.