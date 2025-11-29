import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/envelopes/[id] - Get a single envelope
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const envelope = await prisma.envelope.findUnique({
      where: { id },
      include: {
        publisher: true,
        asset: {
          include: {
            manager: true,
          },
        },
        parent: true,
        children: {
          orderBy: { version: 'desc' },
        },
        readReceipts: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                organization: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!envelope) {
      return NextResponse.json(
        { error: 'Envelope not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(envelope)
  } catch (error) {
    console.error('Error fetching envelope:', error)
    return NextResponse.json(
      { error: 'Failed to fetch envelope' },
      { status: 500 }
    )
  }
}

