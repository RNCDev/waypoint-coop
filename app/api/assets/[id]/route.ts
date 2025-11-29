import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/assets/[id] - Get a single asset
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        manager: true,
        parent: true,
        children: true,
        subscriptions: {
          include: {
            subscriber: true,
          },
        },
        accessGrants: {
          include: {
            grantor: true,
            grantee: true,
          },
        },
        dataPackets: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            publisher: true,
          },
        },
      },
    })

    if (!asset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(asset)
  } catch (error) {
    console.error('Error fetching asset:', error)
    return NextResponse.json(
      { error: 'Failed to fetch asset' },
      { status: 500 }
    )
  }
}

// PUT /api/assets/[id] - Update an asset
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, type, parentId, vintage, requireGPApprovalForDelegations } = body

    const asset = await prisma.asset.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(parentId !== undefined && { parentId }),
        ...(vintage !== undefined && { vintage }),
        ...(requireGPApprovalForDelegations !== undefined && { requireGPApprovalForDelegations }),
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'Asset',
        entityId: asset.id,
        organizationId: asset.managerId,
        details: body,
      },
    })

    return NextResponse.json(asset)
  } catch (error) {
    console.error('Error updating asset:', error)
    return NextResponse.json(
      { error: 'Failed to update asset' },
      { status: 500 }
    )
  }
}

// DELETE /api/assets/[id] - Delete an asset
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const asset = await prisma.asset.findUnique({
      where: { id },
      select: { managerId: true },
    })

    await prisma.asset.delete({
      where: { id },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entityType: 'Asset',
        entityId: id,
        organizationId: asset?.managerId,
        details: { deleted: true },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting asset:', error)
    return NextResponse.json(
      { error: 'Failed to delete asset' },
      { status: 500 }
    )
  }
}

