import { NextRequest, NextResponse } from 'next/server'
import { createSession, getUserSessions, cleanExpiredSessions } from '@/lib/iam/session'
import { getInMemoryDB, isVercel } from '@/lib/in-memory-db'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const sessionSchema = z.object({
  userId: z.number(),
  orgId: z.number(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = sessionSchema.parse(body)

    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      undefined
    const userAgent = request.headers.get('user-agent') || undefined

    const session = await createSession(
      validated.userId,
      validated.orgId,
      ipAddress,
      userAgent
    )

    await cleanExpiredSessions()

    return NextResponse.json(session, { status: 201 })
  } catch (error) {
    console.error('Error creating session:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      )
    }

    const sessions = await getUserSessions(parseInt(userId))
    return NextResponse.json(sessions)
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}
