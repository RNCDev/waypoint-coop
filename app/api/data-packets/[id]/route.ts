import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/data-packets/[id] - Get a single data packet
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const dataPacket = await prisma.dataPacket.findUnique({
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

    if (!dataPacket) {
      return NextResponse.json(
        { error: 'Data packet not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(dataPacket)
  } catch (error) {
    console.error('Error fetching data packet:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data packet' },
      { status: 500 }
    )
  }
}

