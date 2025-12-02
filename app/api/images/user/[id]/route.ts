import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/images/user/[id] - Get user profile picture from database
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        pictureData: true,
        pictureMime: true,
        pictureUrl: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // If we have binary data stored, serve it
    if (user.pictureData && user.pictureMime) {
      // Convert Buffer to Uint8Array for NextResponse compatibility
      const imageBuffer = Buffer.isBuffer(user.pictureData)
        ? new Uint8Array(user.pictureData)
        : new Uint8Array(Buffer.from(user.pictureData))
      return new NextResponse(imageBuffer, {
        headers: {
          'Content-Type': user.pictureMime,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      })
    }

    // Don't redirect to external URLs (especially not Dicebear cartoon placeholders)
    // Return 404 so the UI can show the initial letter fallback instead
    return NextResponse.json(
      { error: 'No image found' },
      { status: 404 }
    )
  } catch (error) {
    console.error('Error fetching user image:', error)
    return NextResponse.json(
      { error: 'Failed to fetch image' },
      { status: 500 }
    )
  }
}

