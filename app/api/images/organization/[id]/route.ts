import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/images/organization/[id] - Get organization image from database
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const organization = await prisma.organization.findUnique({
      where: { id },
      select: {
        imageData: true,
        imageMime: true,
        imageUrl: true,
      },
    })

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    // If we have binary data stored, serve it
    if (organization.imageData && organization.imageMime) {
      // Convert Buffer to Uint8Array for NextResponse compatibility
      const imageBuffer = Buffer.isBuffer(organization.imageData)
        ? new Uint8Array(organization.imageData)
        : new Uint8Array(Buffer.from(organization.imageData))
      return new NextResponse(imageBuffer, {
        headers: {
          'Content-Type': organization.imageMime,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      })
    }

    // Fallback: redirect to external URL if set
    if (organization.imageUrl) {
      return NextResponse.redirect(organization.imageUrl)
    }

    return NextResponse.json(
      { error: 'No image found' },
      { status: 404 }
    )
  } catch (error) {
    console.error('Error fetching organization image:', error)
    return NextResponse.json(
      { error: 'Failed to fetch image' },
      { status: 500 }
    )
  }
}

