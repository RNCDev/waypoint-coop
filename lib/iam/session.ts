import { Session } from '@/types/iam'
import { getInMemoryDB, isVercel } from '@/lib/in-memory-db'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000

export function generateSessionId(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function createSession(
  userId: number,
  orgId: number,
  ipAddress?: string,
  userAgent?: string
): Promise<Session> {
  const sessionId = generateSessionId()
  const createdAt = new Date().toISOString()
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString()

  const session: Session = {
    id: sessionId,
    userId,
    orgId,
    createdAt,
    expiresAt,
    ipAddress,
    userAgent,
  }

  if (isVercel()) {
    const db = getInMemoryDB()
    db.sessions.push(session)
  } else {
    try {
      await prisma.session.create({
        data: session,
      })
    } catch (error) {
      console.error('Failed to create session:', error)
    }
  }

  return session
}

export async function getSession(sessionId: string): Promise<Session | null> {
  if (isVercel()) {
    const db = getInMemoryDB()
    const session = db.sessions.find(s => s.id === sessionId)
    
    if (!session) return null
    
    if (new Date(session.expiresAt) < new Date()) {
      return null
    }
    
    return session
  } else {
    try {
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
      })
      
      if (!session) return null
      
      if (new Date(session.expiresAt) < new Date()) {
        await prisma.session.delete({ where: { id: sessionId } })
        return null
      }
      
      return session
    } catch (error) {
      return null
    }
  }
}

export async function deleteSession(sessionId: string): Promise<void> {
  if (isVercel()) {
    const db = getInMemoryDB()
    const index = db.sessions.findIndex(s => s.id === sessionId)
    if (index !== -1) {
      db.sessions.splice(index, 1)
    }
  } else {
    try {
      await prisma.session.delete({ where: { id: sessionId } })
    } catch (error) {
      console.error('Failed to delete session:', error)
    }
  }
}

export async function getUserSessions(userId: number): Promise<Session[]> {
  if (isVercel()) {
    const db = getInMemoryDB()
    return db.sessions.filter(s => s.userId === userId && new Date(s.expiresAt) >= new Date())
  } else {
    try {
      const sessions = await prisma.session.findMany({
        where: {
          userId,
          expiresAt: { gte: new Date().toISOString() },
        },
      })
      return sessions
    } catch (error) {
      return []
    }
  }
}

export async function cleanExpiredSessions(): Promise<void> {
  const now = new Date().toISOString()
  
  if (isVercel()) {
    const db = getInMemoryDB()
    db.sessions = db.sessions.filter(s => s.expiresAt >= now)
  } else {
    try {
      await prisma.session.deleteMany({
        where: { expiresAt: { lt: now } },
      })
    } catch (error) {
      console.error('Failed to clean expired sessions:', error)
    }
  }
}
