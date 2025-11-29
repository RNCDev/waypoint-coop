import { NextRequest, NextResponse } from 'next/server'
import { getInMemoryDB, isVercel } from '@/lib/in-memory-db'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { checkPermission } from '@/lib/api-guard'
import { getManageablePublishingRights, getUserOrganization } from '@/lib/permissions'

export const dynamic = 'force-dynamic'

const updateSchema = z.object({
  assetScope: z.union([z.literal('ALL'), z.array(z.number())]).optional(),
  canManageSubscriptions: z.boolean().optional(),
  canApproveSubscriptions: z.boolean().optional(),
  canApproveDelegations: z.boolean().optional(),
  canViewData: z.boolean().optional(),
  status: z.enum(['Active', 'Revoked']).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check permission
    const permissionResult = checkPermission(request, 'publishing-rights', 'view')
    if (!permissionResult.allowed || !permissionResult.user) {
      return NextResponse.json(
        { error: permissionResult.error || 'Access denied' },
        { status: permissionResult.user ? 403 : 401 }
      )
    }

    const user = permissionResult.user

    if (isVercel()) {
      const db = getInMemoryDB()
      const publishingRight = db.publishingRights.find(pr => pr.id === id)
      
      if (!publishingRight) {
        return NextResponse.json({ error: 'Publishing right not found' }, { status: 404 })
      }

      // Verify user can access this publishing right
      const manageable = getManageablePublishingRights(user)
      if (!manageable.some(pr => pr.id === id)) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }

      return NextResponse.json(publishingRight)
    } else {
      // Use in-memory DB for non-Vercel as well (Prisma migration not run)
      const db = getInMemoryDB()
      const publishingRight = db.publishingRights.find(pr => pr.id === id)
      
      if (!publishingRight) {
        return NextResponse.json({ error: 'Publishing right not found' }, { status: 404 })
      }

      // Verify user can access this publishing right
      const manageable = getManageablePublishingRights(user)
      if (!manageable.some(pr => pr.id === id)) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }

      return NextResponse.json(publishingRight)
    }
  } catch (error) {
    console.error('Error fetching publishing right:', error)
    return NextResponse.json({ error: 'Failed to fetch publishing right' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check permission
    const permissionResult = checkPermission(request, 'publishing-rights', 'update')
    if (!permissionResult.allowed || !permissionResult.user) {
      return NextResponse.json(
        { error: permissionResult.error || 'Access denied' },
        { status: permissionResult.user ? 403 : 401 }
      )
    }

    const user = permissionResult.user
    const org = getUserOrganization(user)
    
    // Only Asset Managers can update publishing rights
    if (org?.role !== 'Asset Manager' && org?.role !== 'Platform Admin') {
      return NextResponse.json({ error: 'Only Asset Managers can update publishing rights' }, { status: 403 })
    }

    const body = await request.json()
    const validated = updateSchema.parse(body)

    if (isVercel()) {
      const db = getInMemoryDB()
      const publishingRightIndex = db.publishingRights.findIndex(pr => pr.id === id)
      
      if (publishingRightIndex === -1) {
        return NextResponse.json({ error: 'Publishing right not found' }, { status: 404 })
      }

      // Verify user owns this publishing right
      const publishingRight = db.publishingRights[publishingRightIndex]
      if (publishingRight.assetOwnerId !== org?.id && org?.role !== 'Platform Admin') {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }

      const updated = {
        ...publishingRight,
        ...validated,
      }
      db.publishingRights[publishingRightIndex] = updated

      return NextResponse.json(updated)
    } else {
      // Use in-memory DB for non-Vercel as well (Prisma migration not run)
      const db = getInMemoryDB()
      const publishingRightIndex = db.publishingRights.findIndex(pr => pr.id === id)
      
      if (publishingRightIndex === -1) {
        return NextResponse.json({ error: 'Publishing right not found' }, { status: 404 })
      }

      const publishingRight = db.publishingRights[publishingRightIndex]
      if (publishingRight.assetOwnerId !== org?.id && org?.role !== 'Platform Admin') {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }

      const updated = {
        ...publishingRight,
        ...validated,
      }
      db.publishingRights[publishingRightIndex] = updated

      return NextResponse.json(updated)
    }
  } catch (error) {
    console.error('Error updating publishing right:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update publishing right' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check permission
    const permissionResult = checkPermission(request, 'publishing-rights', 'delete')
    if (!permissionResult.allowed || !permissionResult.user) {
      return NextResponse.json(
        { error: permissionResult.error || 'Access denied' },
        { status: permissionResult.user ? 403 : 401 }
      )
    }

    const user = permissionResult.user
    const org = getUserOrganization(user)

    // Only Asset Managers can revoke publishing rights
    if (org?.role !== 'Asset Manager' && org?.role !== 'Platform Admin') {
      return NextResponse.json({ error: 'Only Asset Managers can revoke publishing rights' }, { status: 403 })
    }

    if (isVercel()) {
      const db = getInMemoryDB()
      const publishingRightIndex = db.publishingRights.findIndex(pr => pr.id === id)
      
      if (publishingRightIndex === -1) {
        return NextResponse.json({ error: 'Publishing right not found' }, { status: 404 })
      }

      // Verify user owns this publishing right
      const publishingRight = db.publishingRights[publishingRightIndex]
      if (publishingRight.assetOwnerId !== org?.id && org?.role !== 'Platform Admin') {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }

      // Soft delete - set status to Revoked
      db.publishingRights[publishingRightIndex].status = 'Revoked'

      return NextResponse.json({ success: true })
    } else {
      // Use in-memory DB for non-Vercel as well (Prisma migration not run)
      const db = getInMemoryDB()
      const publishingRightIndex = db.publishingRights.findIndex(pr => pr.id === id)
      
      if (publishingRightIndex === -1) {
        return NextResponse.json({ error: 'Publishing right not found' }, { status: 404 })
      }

      const publishingRight = db.publishingRights[publishingRightIndex]
      if (publishingRight.assetOwnerId !== org?.id && org?.role !== 'Platform Admin') {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }

      // Soft delete - set status to Revoked
      db.publishingRights[publishingRightIndex].status = 'Revoked'

      return NextResponse.json({ success: true })
    }
  } catch (error) {
    console.error('Error deleting publishing right:', error)
    return NextResponse.json({ error: 'Failed to delete publishing right' }, { status: 500 })
  }
}

