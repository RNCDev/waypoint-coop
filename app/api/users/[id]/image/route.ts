import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/users/[id]/image - Upload user profile picture
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 1MB for profile pictures)
    const maxSize = 1 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 1MB.' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Update user with picture data
    const user = await prisma.user.update({
      where: { id },
      data: {
        pictureData: buffer,
        pictureMime: file.type,
      },
      select: {
        id: true,
        name: true,
        organizationId: true,
        pictureMime: true,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'User',
        entityId: user.id,
        organizationId: user.organizationId,
        details: { pictureUploaded: true, mimeType: file.type, size: file.size },
      },
    })

    return NextResponse.json({
      success: true,
      pictureUrl: `/api/images/user/${id}`,
    })
  } catch (error) {
    console.error('Error uploading user picture:', error)
    return NextResponse.json(
      { error: 'Failed to upload picture' },
      { status: 500 }
    )
  }
}

// DELETE /api/users/[id]/image - Remove user profile picture
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const user = await prisma.user.update({
      where: { id },
      data: {
        pictureData: null,
        pictureMime: null,
      },
      select: {
        organizationId: true,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'User',
        entityId: id,
        organizationId: user.organizationId,
        details: { pictureDeleted: true },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user picture:', error)
    return NextResponse.json(
      { error: 'Failed to delete picture' },
      { status: 500 }
    )
  }
}

