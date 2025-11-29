import { NextRequest, NextResponse } from 'next/server'
import { getInMemoryDB } from '@/lib/in-memory-db'
import { z } from 'zod'
import { AccessGrant, DataType } from '@/types'
import { checkPermission } from '@/lib/api-guard'
import { getManageableAccessGrants, getUserOrganization } from '@/lib/permissions'

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

const accessGrantSchema = z.object({
  granteeId: z.number(),
  assetScope: z.union([z.literal('ALL'), z.array(z.number())]),
  dataTypeScope: z.union([z.literal('ALL'), z.array(dataTypeEnum)]),
  // Capabilities
  canPublish: z.boolean().default(false),
  canViewData: z.boolean().default(true),
  canManageSubscriptions: z.boolean().default(false),
  canApproveSubscriptions: z.boolean().default(false),
  canApproveDelegations: z.boolean().default(false),
  // Approval workflow (optional, mainly for LP grants)
  requiresApproval: z.boolean().optional(),
})

export async function GET(request: NextRequest) {
  try {
    // Check permission
    const permissionResult = checkPermission(request, 'access-grants', 'view')
    if (!permissionResult.allowed || !permissionResult.user) {
      return NextResponse.json(
        { error: permissionResult.error || 'Access denied' },
        { status: permissionResult.user ? 403 : 401 }
      )
    }

    const user = permissionResult.user
    const searchParams = request.nextUrl.searchParams
    const grantorId = searchParams.get('grantorId')
    const granteeId = searchParams.get('granteeId')
    const grantType = searchParams.get('type') // 'gp' for canPublish=true, 'lp' for canPublish=false
    const pendingApproval = searchParams.get('pendingApproval')

    // Get access grants the user has access to
    let grants = getManageableAccessGrants(user)

    // Apply additional filters
    if (grantorId) {
      grants = grants.filter(g => g.grantorId === parseInt(grantorId))
    }
    if (granteeId) {
      grants = grants.filter(g => g.granteeId === parseInt(granteeId))
    }
    if (grantType === 'gp') {
      grants = grants.filter(g => g.canPublish)
    } else if (grantType === 'lp') {
      grants = grants.filter(g => !g.canPublish)
    }
    if (pendingApproval === 'true') {
      grants = grants.filter(g => g.status === 'Pending Approval' && g.approvalStatus === 'Pending')
    }

    return NextResponse.json(grants)
  } catch (error) {
    console.error('Error fetching access grants:', error)
    return NextResponse.json({ error: 'Failed to fetch access grants' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check permission to create access grants
    const permissionResult = checkPermission(request, 'access-grants', 'create')
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

    const body = await request.json()
    const validated = accessGrantSchema.parse(body)

    // Validate based on org role:
    // - Asset Managers can create GP grants (canPublish=true) or LP grants (canPublish=false)
    // - Limited Partners can only create LP grants (canPublish=false)
    // - Delegates cannot create grants

    if (org.role === 'Delegate') {
      return NextResponse.json({ error: 'Delegates cannot create access grants' }, { status: 403 })
    }

    // If canPublish is true, only Asset Managers can create
    if (validated.canPublish && org.role !== 'Asset Manager' && org.role !== 'Platform Admin') {
      return NextResponse.json({ error: 'Only Asset Managers can grant publishing rights' }, { status: 403 })
    }

    // If canPublish is false, must be LP creating for themselves
    if (!validated.canPublish && org.role === 'Limited Partner') {
      // LP grants are created by the LP (grantor is the LP's org)
    } else if (!validated.canPublish && org.role !== 'Asset Manager' && org.role !== 'Platform Admin') {
      return NextResponse.json({ error: 'Invalid grant configuration' }, { status: 400 })
    }

    const db = getInMemoryDB()

    // Check asset-level approval requirements for LP grants
    let requiresApproval = validated.requiresApproval || false
    
    if (!validated.canPublish) {
      // LP grant - check if any assets require GP approval
      if (validated.assetScope === 'ALL') {
        const subscriptions = db.subscriptions.filter(
          s => s.subscriberId === org.id && s.status === 'Active'
        )
        const assetIds = subscriptions.map(s => s.assetId)
        const assetsRequiringApproval = db.assets.filter(
          a => assetIds.includes(a.id) && a.requireGPApprovalForDelegations
        )
        if (assetsRequiringApproval.length > 0) {
          requiresApproval = true
        }
      } else {
        const assetScopeArray = validated.assetScope as number[]
        const assetsRequiringApproval = db.assets.filter(
          a => assetScopeArray.includes(a.id) && a.requireGPApprovalForDelegations
        )
        if (assetsRequiringApproval.length > 0) {
          requiresApproval = true
        }
      }
    }

    const timestamp = new Date().toISOString()
    const initialStatus = requiresApproval ? 'Pending Approval' : 'Active'
    const approvalStatus = requiresApproval ? 'Pending' : null

    const grantId = `AG-${Date.now()}`
    const grant: AccessGrant = {
      id: grantId,
      grantorId: org.id,
      granteeId: validated.granteeId,
      assetScope: validated.assetScope,
      dataTypeScope: validated.dataTypeScope as 'ALL' | DataType[],
      canPublish: validated.canPublish,
      canViewData: validated.canViewData,
      canManageSubscriptions: validated.canManageSubscriptions,
      canApproveSubscriptions: validated.canApproveSubscriptions,
      canApproveDelegations: validated.canApproveDelegations,
      requiresApproval,
      approvalStatus: approvalStatus as 'Pending' | null,
      approvedById: null,
      approvedAt: null,
      status: initialStatus as 'Active' | 'Pending Approval',
      grantedAt: timestamp,
    }

    db.accessGrants.push(grant)
    return NextResponse.json(grant, { status: 201 })
  } catch (error) {
    console.error('Error creating access grant:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create access grant' }, { status: 500 })
  }
}

