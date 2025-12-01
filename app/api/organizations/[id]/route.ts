import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/organizations/[id] - Get a single organization
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        users: true,
        managedAssets: true,
        subscriptions: {
          include: {
            asset: true,
          },
        },
        grantsGiven: {
          include: {
            grantee: true,
            asset: true,
          },
        },
        grantsReceived: {
          include: {
            grantor: true,
            asset: true,
          },
        },
      },
    })

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(organization)
  } catch (error) {
    console.error('Error fetching organization:', error)
    return NextResponse.json(
      { error: 'Failed to fetch organization' },
      { status: 500 }
    )
  }
}

// PUT /api/organizations/[id] - Update an organization
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, type, lei, narrative, imageUrl } = body

    const organization = await prisma.organization.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(lei !== undefined && { lei }),
        ...(narrative !== undefined && { narrative }),
        ...(imageUrl !== undefined && { imageUrl }),
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'Organization',
        entityId: organization.id,
        organizationId: organization.id,
        details: { name, type, lei, narrative, imageUrl },
      },
    })

    return NextResponse.json(organization)
  } catch (error) {
    console.error('Error updating organization:', error)
    return NextResponse.json(
      { error: 'Failed to update organization' },
      { status: 500 }
    )
  }
}

// DELETE /api/organizations/[id] - Delete an organization
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.organization.delete({
      where: { id },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entityType: 'Organization',
        entityId: id,
        details: { deleted: true },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting organization:', error)
    return NextResponse.json(
      { error: 'Failed to delete organization' },
      { status: 500 }
    )
  }
}

