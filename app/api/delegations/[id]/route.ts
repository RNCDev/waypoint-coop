import { NextRequest, NextResponse } from 'next/server'
import { getInMemoryDB } from '@/lib/in-memory-db'
import { z } from 'zod'
import { DataType } from '@/types'
import { checkPermission } from '@/lib/api-guard'
import { getUserOrganization } from '@/lib/permissions'

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
  status: z.enum(['Active', 'Pending GP Approval', 'Rejected']).optional(),
  gpApprovalStatus: z.enum(['Pending', 'Approved', 'Rejected']).optional(),
  assetScope: z.union([z.literal('ALL'), z.array(z.number())]).optional(),
  typeScope: z.union([z.literal('ALL'), z.array(dataTypeEnum)]).optional(),
  canManageSubscriptions: z.boolean().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check permission
    const permissionResult = checkPermission(request, 'delegations', 'view', { delegationId: id })
    if (!permissionResult.allowed || !permissionResult.user) {
      return NextResponse.json(
        { error: permissionResult.error || 'Access denied' },
        { status: permissionResult.user ? 403 : 401 }
      )
    }

    // Use in-memory DB for consistency
    const db = getInMemoryDB()
    const delegation = db.delegations.find(d => d.id === id)
    if (!delegation) {
      return NextResponse.json({ error: 'Delegation not found' }, { status: 404 })
    }
    return NextResponse.json(delegation)
  } catch (error) {
    console.error('Error fetching delegation:', error)
    return NextResponse.json({ error: 'Failed to fetch delegation' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check permission
    const permissionResult = checkPermission(request, 'delegations', 'update', { delegationId: id })
    if (!permissionResult.allowed || !permissionResult.user) {
      return NextResponse.json(
        { error: permissionResult.error || 'Access denied' },
        { status: permissionResult.user ? 403 : 401 }
      )
    }

    const user = permissionResult.user
    const org = getUserOrganization(user)
    const body = await request.json()
    const validated = updateSchema.parse(body)

    // Fetch delegation first
      const db = getInMemoryDB()
      const delegationIndex = db.delegations.findIndex(d => d.id === id)
      if (delegationIndex === -1) {
        return NextResponse.json({ error: 'Delegation not found' }, { status: 404 })
      }
    const delegation = db.delegations[delegationIndex]

    // If approving/rejecting, check if user can approve delegations
    if (validated.gpApprovalStatus === 'Approved' || validated.gpApprovalStatus === 'Rejected') {
      // Check if user can approve this delegation
      const { canApproveDelegation } = await import('@/lib/permissions')
      const canApprove = canApproveDelegation(user, delegation as any)
      
      if (!canApprove) {
        return NextResponse.json(
          { error: 'You do not have permission to approve/reject this delegation' },
          { status: 403 }
        )
      }
    }

    const timestamp = new Date().toISOString()

      // Update status based on approval
      if (validated.gpApprovalStatus === 'Approved') {
        delegation.status = 'Active'
        delegation.gpApprovalStatus = 'Approved'
        delegation.gpApprovedAt = timestamp
        delegation.gpApprovedById = user.id
      } else if (validated.gpApprovalStatus === 'Rejected') {
        delegation.status = 'Rejected'
        delegation.gpApprovalStatus = 'Rejected'
        delegation.gpApprovedAt = timestamp
        delegation.gpApprovedById = user.id
      } else {
      // Update other fields
        if (validated.status) delegation.status = validated.status
        if (validated.gpApprovalStatus) delegation.gpApprovalStatus = validated.gpApprovalStatus
      if (validated.assetScope !== undefined) delegation.assetScope = validated.assetScope
      if (validated.typeScope !== undefined) delegation.typeScope = validated.typeScope as 'ALL' | DataType[]
      if (validated.canManageSubscriptions !== undefined) delegation.canManageSubscriptions = validated.canManageSubscriptions
      }

      db.delegations[delegationIndex] = delegation
      return NextResponse.json(delegation)
  } catch (error) {
    console.error('Error updating delegation:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update delegation' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check permission
    const permissionResult = checkPermission(request, 'delegations', 'delete', { delegationId: id })
    if (!permissionResult.allowed || !permissionResult.user) {
      return NextResponse.json(
        { error: permissionResult.error || 'Access denied' },
        { status: permissionResult.user ? 403 : 401 }
      )
    }

    const user = permissionResult.user
    const org = getUserOrganization(user)

      const db = getInMemoryDB()
      const delegationIndex = db.delegations.findIndex(d => d.id === id)
      if (delegationIndex === -1) {
        return NextResponse.json({ error: 'Delegation not found' }, { status: 404 })
      }

      const delegation = db.delegations[delegationIndex]
      
      // Only the subscriber who created it can delete
      if (delegation.subscriberId !== org?.id && org?.role !== 'Platform Admin') {
        return NextResponse.json({ error: 'Only the subscriber can delete their delegation' }, { status: 403 })
      }

      db.delegations.splice(delegationIndex, 1)
      return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting delegation:', error)
    return NextResponse.json({ error: 'Failed to delete delegation' }, { status: 500 })
  }
}

