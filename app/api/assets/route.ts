import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AssetType } from '@prisma/client'
import { getAccessibleAssets } from '@/lib/permissions'

// GET /api/assets - List all assets
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const managerId = searchParams.get('managerId')
    const orgId = searchParams.get('orgId') // For filtering by organization permissions
    const type = searchParams.get('type') as AssetType | null

    // If orgId is provided, filter by accessible assets
    let accessibleAssetIds: string[] | null = null
    if (orgId) {
      accessibleAssetIds = await getAccessibleAssets(orgId)
    }

    const assets = await prisma.asset.findMany({
      where: {
        ...(managerId && { managerId }),
        ...(type && { type }),
        ...(accessibleAssetIds && { id: { in: accessibleAssetIds } }),
      },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        parent: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        _count: {
          select: {
            children: true,
            subscriptions: true,
            envelopes: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(assets)
  } catch (error) {
    console.error('Error fetching assets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assets' },
      { status: 500 }
    )
  }
}

// POST /api/assets - Create a new asset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, managerId, parentId, vintage, requireGPApprovalForDelegations } = body

    if (!name || !type || !managerId) {
      return NextResponse.json(
        { error: 'Name, type, and managerId are required' },
        { status: 400 }
      )
    }

    const asset = await prisma.asset.create({
      data: {
        name,
        type,
        managerId,
        parentId,
        vintage,
        requireGPApprovalForDelegations: requireGPApprovalForDelegations ?? false,
      },
      include: {
        manager: true,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entityType: 'Asset',
        entityId: asset.id,
        organizationId: managerId,
        details: { name, type, vintage },
      },
    })

    return NextResponse.json(asset, { status: 201 })
  } catch (error) {
    console.error('Error creating asset:', error)
    return NextResponse.json(
      { error: 'Failed to create asset' },
      { status: 500 }
    )
  }
}

