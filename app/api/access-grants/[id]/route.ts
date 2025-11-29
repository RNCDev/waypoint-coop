import { NextRequest, NextResponse } from 'next/server'
import { getInMemoryDB } from '@/lib/in-memory-db'
import { z } from 'zod'
import { checkPermission } from '@/lib/api-guard'
import { getManageableAccessGrants, getUserOrganization, isPlatformAdmin } from '@/lib/permissions'

export const dynamic = 'force-dynamic'

const dataTypeEnum = z.enum([
  'CAPITAL_CALL',
  'DISTRIBUTION',
  'NAV_UPDATE',
  'QUARTERLY_REPORT',
  'K-1_TAX_FORM',
  'SOI_UPDATE',
  'LEGAL_NOTICE',
])

const updateSchema = z.object({
  assetScope: z.union([z.literal('ALL'), z.array(z.number())]).optional(),
  dataTypeScope: z.union([z.literal('ALL'), z.array(dataTypeEnum)]).optional(),
  canViewData: z.boolean().optional(),
  canManageSubscriptions: z.boolean().optional(),
  canApproveSubscriptions: z.boolean().optional(),
  canApproveDelegations: z.boolean().optional(),
  status: z.enum(['Active', 'Revoked']).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const permissionResult = checkPermission(request, 'access-grants', 'view')
    if (!permissionResult.allowed || !permissionResult.user) {
      return NextResponse.json(
        { error: permissionResult.error || 'Access denied' },
        { status: permissionResult.user ? 403 : 401 }
      )
    }

    const user = permissionResult.user
    const grants = getManageableAccessGrants(user)
    const grant = grants.find(g => g.id === id)

    if (!grant) {
      return NextResponse.json({ error: 'Access grant not found' }, { status: 404 })
    }

    return NextResponse.json(grant)
  } catch (error) {
    console.error('Error fetching access grant:', error)
    return NextResponse.json({ error: 'Failed to fetch access grant' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const permissionResult = checkPermission(request, 'access-grants', 'update')
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

    const db = getInMemoryDB()
    const grant = db.accessGrants.find(g => g.id === id)

    if (!grant) {
      return NextResponse.json({ error: 'Access grant not found' }, { status: 404 })
    }

    // Only the grantor or Platform Admin can update a grant
    if (grant.grantorId !== org.id && !isPlatformAdmin(org)) {
      return NextResponse.json({ error: 'Only the grantor can update this access grant' }, { status: 403 })
    }

    const body = await request.json()
    const validated = updateSchema.parse(body)

    // Apply updates
    if (validated.assetScope !== undefined) grant.assetScope = validated.assetScope
    if (validated.dataTypeScope !== undefined) grant.dataTypeScope = validated.dataTypeScope
    if (validated.canViewData !== undefined) grant.canViewData = validated.canViewData
    if (validated.canManageSubscriptions !== undefined) grant.canManageSubscriptions = validated.canManageSubscriptions
    if (validated.canApproveSubscriptions !== undefined) grant.canApproveSubscriptions = validated.canApproveSubscriptions
    if (validated.canApproveDelegations !== undefined) grant.canApproveDelegations = validated.canApproveDelegations
    if (validated.status !== undefined) grant.status = validated.status

    return NextResponse.json(grant)
  } catch (error) {
    console.error('Error updating access grant:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update access grant' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const permissionResult = checkPermission(request, 'access-grants', 'delete')
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

    const db = getInMemoryDB()
    const grantIndex = db.accessGrants.findIndex(g => g.id === id)

    if (grantIndex === -1) {
      return NextResponse.json({ error: 'Access grant not found' }, { status: 404 })
    }

    const grant = db.accessGrants[grantIndex]

    // Only the grantor or Platform Admin can delete (revoke) a grant
    if (grant.grantorId !== org.id && !isPlatformAdmin(org)) {
      return NextResponse.json({ error: 'Only the grantor can revoke this access grant' }, { status: 403 })
    }

    // Revoke the grant instead of hard delete
    grant.status = 'Revoked'

    return NextResponse.json({ message: 'Access grant revoked successfully', grant })
  } catch (error) {
    console.error('Error revoking access grant:', error)
    return NextResponse.json({ error: 'Failed to revoke access grant' }, { status: 500 })
  }
}

