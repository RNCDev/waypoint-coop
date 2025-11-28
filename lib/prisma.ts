import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Only initialize Prisma if not on Vercel (where we use in-memory DB)
// Check multiple Vercel environment variables
const isVercelEnvironment = 
  process.env.VERCEL === '1' || 
  process.env.VERCEL_ENV || 
  (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL)

let prismaInstance: PrismaClient

if (isVercelEnvironment) {
  // On Vercel, create a mock Prisma client that won't be used
  prismaInstance = {} as PrismaClient
} else {
  // Local development - use real Prisma
  prismaInstance = globalForPrisma.prisma ?? new PrismaClient()
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaInstance
  }
}

export const prisma = prismaInstance

