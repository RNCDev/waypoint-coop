# Waypoint Infrastructure & Build Setup

This document outlines the infrastructure setup required for smooth local development and automatic deployments to Vercel on every push to the `main` branch.

## Prerequisites

- **Node.js** 18+ and npm (or yarn/pnpm)
- **Git** for version control
- **GitHub account**
- **Vercel account** linked to GitHub

## Local Development Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/RNCDev/waypoint-coop.git
cd waypoint-coop

# Install dependencies
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```bash
# .env
DATABASE_URL="file:./dev.db"
NODE_ENV="development"
```

**Note:** The `.env` file should be in `.gitignore` and not committed to the repository.

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations to create SQLite database
npx prisma migrate dev --name init

# Seed the database with mock data
npm run db:seed
```

The seed script will populate the database with all mock data.

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## Vercel Deployment Setup

### 1. Connect GitHub Repository to Vercel

1. Log in to [Vercel](https://vercel.com) with your GitHub account
2. Click **"Add New Project"**
3. Import the `waypoint-coop` repository
4. Vercel will auto-detect Next.js settings

### 2. Configure Build Settings

Vercel should auto-detect these settings, but verify:

- **Framework Preset:** Next.js
- **Root Directory:** `./` (root)
- **Build Command:** `npm run build`
- **Output Directory:** `.next` (default)
- **Install Command:** `npm install`

### 3. Environment Variables (Vercel)

In the Vercel project settings, add environment variables:

- **`NODE_ENV`:** `production` (for production deployments)
- **`DATABASE_URL`:** Not needed (using in-memory storage on Vercel)

**Note:** Since we're using in-memory storage on Vercel (not SQLite), no database connection string is required.

### 4. Automatic Deployments

Once connected, Vercel will automatically:
- Deploy on every push to `main` branch
- Create preview deployments for pull requests
- Run build checks before deployment

## GitHub Workflow

### Branch Strategy

- **`main`** branch: Production-ready code, auto-deploys to Vercel
- **Feature branches:** Create preview deployments on Vercel

### Git Workflow

```bash
# Create a feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "Add feature X"

# Push to GitHub (creates preview deployment)
git push origin feature/my-feature

# After review, merge to main (triggers production deployment)
git checkout main
git merge feature/my-feature
git push origin main
```

## Project Scripts

The following npm scripts are configured in `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio",
    "db:reset": "rm -f prisma/dev.db && npm run db:migrate && npm run db:seed"
  }
}
```

## Database Management

### Local Development

- **Database File:** `prisma/dev.db` (SQLite)
- **Schema:** `prisma/schema.prisma`
- **Migrations:** `prisma/migrations/`
- **Seed Data:** `prisma/seed.ts`

### Common Database Commands

```bash
# View database in Prisma Studio (GUI)
npm run db:studio

# Reset database (delete and recreate with seed data)
npm run db:reset

# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy
```

### Vercel (Production)

- **Storage:** In-memory (no persistent database)
- **Data Source:** Mock data loaded on each API route invocation
- **No Migrations:** Not applicable for in-memory storage

## Troubleshooting

### Local Development Issues

**Database locked error:**
```bash
# Kill any processes using the database
# Then reset:
npm run db:reset
```

**Prisma client out of sync:**
```bash
npx prisma generate
```

**Port 3000 already in use:**
```bash
# Use a different port
npm run dev -- -p 3001
```

### Vercel Deployment Issues

**Build fails:**
1. Check build logs in Vercel dashboard
2. Run `npm run build` locally to reproduce
3. Ensure all dependencies are in `package.json`

**API routes not working:**
1. Verify API routes are in `app/api/` directory (App Router)
2. Check serverless function logs in Vercel dashboard
3. Ensure in-memory data layer is properly implemented
