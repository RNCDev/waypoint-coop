import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/envelopes/[id]/read - Mark envelope as read
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Check if already read
    const existing = await prisma.readReceipt.findUnique({
      where: {
        envelopeId_userId: {
          envelopeId: id,
          userId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(existing)
    }

    // Get user's organization for audit log
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    })

    const readReceipt = await prisma.readReceipt.create({
      data: {
        envelopeId: id,
        userId,
      },
      include: {
        envelope: {
          select: {
            id: true,
            type: true,
            asset: {
              select: {
                name: true,
              },
            },
          },
        },
        user: {
          select: {
            name: true,
            organization: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'VIEW',
        entityType: 'Envelope',
        entityId: id,
        actorId: userId,
        organizationId: user?.organizationId,
        details: {
          action: 'Read receipt recorded',
        },
      },
    })

    return NextResponse.json(readReceipt)
  } catch (error) {
    console.error('Error marking envelope as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark envelope as read' },
      { status: 500 }
    )
  }
}

