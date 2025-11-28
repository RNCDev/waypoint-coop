import { NextRequest, NextResponse } from 'next/server'
import { getInMemoryDB, isVercel } from '@/lib/in-memory-db'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { PublishingRight } from '@/types'
import { checkPermission } from '@/lib/api-guard'
import { getManageablePublishingRights, getUserOrganization } from '@/lib/permissions'

export const dynamic = 'force-dynamic'

const publishingRightSchema = z.object({
  publisherId: z.number(),
  assetScope: z.union([z.literal('ALL'), z.array(z.number())]),
  canManageSubscriptions: z.boolean().default(false),
})

export async function GET(request: NextRequest) {
  try {
    // Check permission
    const permissionResult = checkPermission(request, 'publishing-rights', 'view')
    if (!permissionResult.allowed || !permissionResult.user) {
      return NextResponse.json(
        { error: permissionResult.error || 'Access denied' },
        { status: permissionResult.user ? 403 : 401 }
      )
    }

    const user = permissionResult.user
    const org = getUserOrganization(user)
    const searchParams = request.nextUrl.searchParams
    const assetOwnerId = searchParams.get('assetOwnerId')
    const publisherId = searchParams.get('publisherId')

    if (isVercel()) {
      // Get publishing rights the user can view
      let publishingRights = getManageablePublishingRights(user)

      // Apply additional filters
      if (assetOwnerId) {
        publishingRights = publishingRights.filter(pr => pr.assetOwnerId === parseInt(assetOwnerId))
      }
      if (publisherId) {
        publishingRights = publishingRights.filter(pr => pr.publisherId === parseInt(publisherId))
      }

      return NextResponse.json(publishingRights)
    } else {
      // Use in-memory DB for non-Vercel as well (Prisma migration not run)
      let publishingRights = getManageablePublishingRights(user)

      if (assetOwnerId) {
        publishingRights = publishingRights.filter(pr => pr.assetOwnerId === parseInt(assetOwnerId))
      }
      if (publisherId) {
        publishingRights = publishingRights.filter(pr => pr.publisherId === parseInt(publisherId))
      }

      return NextResponse.json(publishingRights)
    }
  } catch (error) {
    console.error('Error fetching publishing rights:', error)
    return NextResponse.json({ error: 'Failed to fetch publishing rights' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check permission to create publishing rights (only Asset Owners)
    const permissionResult = checkPermission(request, 'publishing-rights', 'create')
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

    // Only Asset Owners can create publishing rights
    if (org.role !== 'Asset Owner' && org.role !== 'Platform Admin') {
      return NextResponse.json({ error: 'Only Asset Owners can grant publishing rights' }, { status: 403 })
    }

    const body = await request.json()
    const validated = publishingRightSchema.parse(body)

    const timestamp = new Date().toISOString()

    if (isVercel()) {
      const db = getInMemoryDB()
      
      // Check if publishing right already exists
      const existing = db.publishingRights.find(
        pr => pr.assetOwnerId === org.id && 
              pr.publisherId === validated.publisherId &&
              pr.status === 'Active'
      )
      
      if (existing) {
        return NextResponse.json({ error: 'Active publishing right already exists for this publisher' }, { status: 409 })
      }

      const publishingRightId = `PR-${Date.now()}`
      const publishingRight: PublishingRight = {
        id: publishingRightId,
        assetOwnerId: org.id,
        publisherId: validated.publisherId,
        assetScope: validated.assetScope,
        canManageSubscriptions: validated.canManageSubscriptions,
        grantedAt: timestamp,
        status: 'Active',
      }

      db.publishingRights.push(publishingRight)
      return NextResponse.json(publishingRight, { status: 201 })
    } else {
      // Use in-memory DB for non-Vercel as well (Prisma migration not run)
      const db = getInMemoryDB()
      
      const existing = db.publishingRights.find(
        pr => pr.assetOwnerId === org.id && 
              pr.publisherId === validated.publisherId &&
              pr.status === 'Active'
      )
      
      if (existing) {
        return NextResponse.json({ error: 'Active publishing right already exists for this publisher' }, { status: 409 })
      }

      const publishingRightId = `PR-${Date.now()}`
      const publishingRight: PublishingRight = {
        id: publishingRightId,
        assetOwnerId: org.id,
        publisherId: validated.publisherId,
        assetScope: validated.assetScope,
        canManageSubscriptions: validated.canManageSubscriptions,
        grantedAt: timestamp,
        status: 'Active',
      }

      db.publishingRights.push(publishingRight)
      return NextResponse.json(publishingRight, { status: 201 })
    }
  } catch (error) {
    console.error('Error creating publishing right:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create publishing right' }, { status: 500 })
  }
}

