import { NextRequest, NextResponse } from 'next/server'
import { getInMemoryDB } from '@/lib/in-memory-db'
import { z } from 'zod'
import { DataType } from '@/types'
import { getCurrentUser, checkPermission } from '@/lib/api-guard'
import { getAccessibleDelegations, getUserOrganization } from '@/lib/permissions'

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

const delegationSchema = z.object({
  subscriberId: z.number(),
  delegateId: z.number(),
  assetScope: z.union([z.literal('ALL'), z.array(z.number())]),
  typeScope: z.union([z.literal('ALL'), z.array(dataTypeEnum)]),
  gpApprovalRequired: z.boolean().optional().default(false),
  canManageSubscriptions: z.boolean().optional().default(false), // Can accept/request subscriptions on behalf of subscriber
})

export async function GET(request: NextRequest) {
  try {
    // Check permission
    const permissionResult = checkPermission(request, 'delegations', 'view')
    if (!permissionResult.allowed || !permissionResult.user) {
      return NextResponse.json(
        { error: permissionResult.error || 'Access denied' },
        { status: permissionResult.user ? 403 : 401 }
      )
    }

    const user = permissionResult.user
    const searchParams = request.nextUrl.searchParams
    const subscriberId = searchParams.get('subscriberId')
    const delegateId = searchParams.get('delegateId')
    const pendingApproval = searchParams.get('pendingApproval')

    // Use in-memory DB for consistency (works on Vercel and local dev)
    // Prisma can be used if database is properly seeded, but in-memory is simpler
      const db = getInMemoryDB()
      
      // Get delegations the user has access to
      let delegations = getAccessibleDelegations(user)

      // Apply additional filters
      if (subscriberId) {
        delegations = delegations.filter(d => d.subscriberId === parseInt(subscriberId))
      }
      if (delegateId) {
        delegations = delegations.filter(d => d.delegateId === parseInt(delegateId))
      }
      if (pendingApproval === 'true') {
        delegations = delegations.filter(d => d.status === 'Pending GP Approval' && d.gpApprovalStatus === 'Pending')
      }

      return NextResponse.json(delegations)
  } catch (error) {
    console.error('Error fetching delegations:', error)
    return NextResponse.json({ error: 'Failed to fetch delegations' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check permission to create delegations
    const permissionResult = checkPermission(request, 'delegations', 'create')
    if (!permissionResult.allowed || !permissionResult.user) {
      return NextResponse.json(
        { error: permissionResult.error || 'Access denied' },
        { status: permissionResult.user ? 403 : 401 }
      )
    }

    const user = permissionResult.user
    const org = getUserOrganization(user)
    
    const body = await request.json()
    const validated = delegationSchema.parse(body)

    // Verify the user's org is the subscriber creating the delegation
    if (org && org.id !== validated.subscriberId) {
      return NextResponse.json(
        { error: 'You can only create delegations for your own organization' },
        { status: 403 }
      )
    }

    // Check asset-level approval requirements
    // If any asset in scope requires GP approval, force gpApprovalRequired = true
    let requiresApproval = validated.gpApprovalRequired || false
    
    const db = getInMemoryDB()
    if (validated.assetScope === 'ALL') {
      // For "ALL" scope, check if subscriber has any subscriptions to assets that require approval
      const subscriptions = db.subscriptions.filter(
        s => s.subscriberId === validated.subscriberId && s.status === 'Active'
      )
      const assetIds = subscriptions.map(s => s.assetId)
      const assetsRequiringApproval = db.assets.filter(
        a => assetIds.includes(a.id) && a.requireGPApprovalForDelegations
      )
      if (assetsRequiringApproval.length > 0) {
        requiresApproval = true
      }
    } else {
      // Check each asset in scope (assetScope is an array of numbers)
      const assetScopeArray = validated.assetScope as number[]
      const assetsRequiringApproval = db.assets.filter(
        a => assetScopeArray.includes(a.id) && a.requireGPApprovalForDelegations
      )
      if (assetsRequiringApproval.length > 0) {
        requiresApproval = true
      }
    }

    const timestamp = new Date().toISOString()
    const initialStatus = requiresApproval ? 'Pending GP Approval' : 'Active'
    const gpApprovalStatus = requiresApproval ? 'Pending' : undefined

    const delegationId = `D-${Date.now()}`
    const delegation = {
      id: delegationId,
      subscriberId: validated.subscriberId,
      delegateId: validated.delegateId,
      assetScope: validated.assetScope,
      typeScope: validated.typeScope as 'ALL' | DataType[],
      status: initialStatus as 'Active' | 'Pending GP Approval',
      gpApprovalRequired: requiresApproval,
      gpApprovalStatus: gpApprovalStatus as 'Pending' | undefined,
      canManageSubscriptions: validated.canManageSubscriptions,
      createdAt: timestamp,
    }

    db.delegations.push(delegation)
    return NextResponse.json(delegation, { status: 201 })
  } catch (error) {
    console.error('Error creating delegation:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create delegation' }, { status: 500 })
  }
}

