import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/organizations/[id]/image - Upload organization image
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

    // Validate file size (max 2MB for database storage)
    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 2MB.' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Update organization with image data
    const organization = await prisma.organization.update({
      where: { id },
      data: {
        imageData: buffer,
        imageMime: file.type,
      },
      select: {
        id: true,
        name: true,
        imageMime: true,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'Organization',
        entityId: organization.id,
        organizationId: organization.id,
        details: { imageUploaded: true, mimeType: file.type, size: file.size },
      },
    })

    return NextResponse.json({
      success: true,
      imageUrl: `/api/images/organization/${id}`,
    })
  } catch (error) {
    console.error('Error uploading organization image:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}

// DELETE /api/organizations/[id]/image - Remove organization image
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.organization.update({
      where: { id },
      data: {
        imageData: null,
        imageMime: null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting organization image:', error)
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    )
  }
}

