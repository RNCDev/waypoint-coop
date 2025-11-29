import { NextRequest, NextResponse } from 'next/server'
import { getInMemoryDB, isVercel } from '@/lib/in-memory-db'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { checkPermission } from '@/lib/api-guard'
import { getUserOrganization } from '@/lib/permissions'

export const dynamic = 'force-dynamic'

const assetSchema = z.object({
  name: z.string().min(1),
  ownerId: z.number(),
  defaultPublisherId: z.number(),
  type: z.enum(['Fund', 'Co-Investment', 'SPV']),
  requireGPApprovalForDelegations: z.boolean().default(false),
})

export async function GET(request: NextRequest) {
  try {
    // Check permission
    const permissionResult = checkPermission(request, 'assets', 'view')
    if (!permissionResult.allowed || !permissionResult.user) {
      return NextResponse.json(
        { error: permissionResult.error || 'Access denied' },
        { status: permissionResult.user ? 403 : 401 }
      )
    }

    const user = permissionResult.user
    const { getAccessibleAssets } = await import('@/lib/permissions')
    const accessibleAssets = getAccessibleAssets(user)

    return NextResponse.json(accessibleAssets)
  } catch (error) {
    console.error('Error fetching assets:', error)
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check permission to create assets (only Asset Managers)
    const permissionResult = checkPermission(request, 'assets', 'create')
    if (!permissionResult.allowed || !permissionResult.user) {
      return NextResponse.json(
        { error: permissionResult.error || 'Access denied' },
        { status: permissionResult.user ? 403 : 401 }
      )
    }

    const user = permissionResult.user
    const org = getUserOrganization(user)
    
    if (!org) {
      return NextResponse.json({ error: 'User organization not found' }, { status: 400 })
    }

    // Only Asset Managers can create assets
    if (org.role !== 'Asset Manager' && org.role !== 'Platform Admin') {
      return NextResponse.json(
        { error: 'Only Asset Managers can create assets' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validated = assetSchema.parse(body)

    // Verify the ownerId matches the user's organization (unless Platform Admin)
    if (org.role !== 'Platform Admin' && validated.ownerId !== org.id) {
      return NextResponse.json(
        { error: 'You can only create assets for your own organization' },
        { status: 403 }
      )
    }

    // Verify defaultPublisherId is a valid organization
    if (isVercel()) {
      const db = getInMemoryDB()
      const publisher = db.organizations.find(o => o.id === validated.defaultPublisherId)
      if (!publisher) {
        return NextResponse.json(
          { error: `Default publisher organization ${validated.defaultPublisherId} not found` },
          { status: 400 }
        )
      }
    } else {
      const publisher = await prisma.organization.findUnique({
        where: { id: validated.defaultPublisherId },
      })
      if (!publisher) {
        return NextResponse.json(
          { error: `Default publisher organization ${validated.defaultPublisherId} not found` },
          { status: 400 }
        )
      }
    }

    if (isVercel()) {
      const db = getInMemoryDB()
      const assetId = Math.max(...db.assets.map(a => a.id), 0) + 1
      
      const asset = {
        id: assetId,
        name: validated.name,
        ownerId: validated.ownerId,
        defaultPublisherId: validated.defaultPublisherId,
        type: validated.type,
        requireGPApprovalForDelegations: validated.requireGPApprovalForDelegations,
      }

      db.assets.push(asset)
      return NextResponse.json(asset, { status: 201 })
    } else {
      const asset = await prisma.asset.create({
        data: {
          name: validated.name,
          ownerId: validated.ownerId,
          defaultPublisherId: validated.defaultPublisherId,
          type: validated.type,
          requireGPApprovalForDelegations: validated.requireGPApprovalForDelegations,
        },
      })

      return NextResponse.json(asset, { status: 201 })
    }
  } catch (error) {
    console.error('Error creating asset:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create asset' }, { status: 500 })
  }
}

