# Waypoint Coop

Developing private markets data rails - A secure, immutable message bus for private market data.

## Overview

Waypoint is a digital clearinghouse for private market data, enabling secure data transactions between General Partners (GPs) and Limited Partners (LPs) with perfect audit trails.

## Features

- **Publisher Terminal (GP)**: Compose and publish data packets with Smart Paste CSV/TSV conversion
- **Subscriber Ledger (LP)**: View chronological feed of data events with read receipt tracking
- **Delegation Management**: Grant access to third-party service providers (auditors, analytics)
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

- **Alice Admin** (Publisher: Genii Admin Services) - Can compose and publish data
- **Bob GP** (Asset Owner: Kleiner Perkins) - Can view assets and publish
- **Charlie LP** (Subscriber: State of Ohio Pension) - Can view ledger and manage delegations
- **Dana Delegate** (Auditor: Deloitte) - Can view delegated data

## Project Structure

```
waypoint-coop/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── composer/          # Publisher composer page
│   ├── history/           # Publisher history page
│   ├── ledger/            # Subscriber ledger page
│   ├── delegations/       # Delegation management
│   ├── registry/          # Admin entity registry
│   └── audit/             # Admin audit log
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── shared/           # Shared components
├── lib/                  # Utilities
│   ├── prisma.ts         # Prisma client
│   ├── mock-data.ts      # Mock data definitions
│   ├── in-memory-db.ts   # In-memory DB for Vercel
│   └── crypto.ts         # Cryptographic utilities
├── prisma/               # Prisma schema and migrations
└── store/                # Zustand stores
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

See the `docs/` folder for detailed documentation:
- `0_PHASE_1_REQUIREMENTS.md` - Feature requirements
- `1_ARCHITECTURE_OVERVIEW.md` - System architecture
- `2_WIREFRAMES.md` - UI wireframes and specifications
- `3_MOCK_DATA.md` - Mock data definitions
- `4_INFRA_BUILD.md` - Infrastructure and build setup
- `5_Design_Guide.md` - Design system and UI patterns

## License

See LICENSE file for details.