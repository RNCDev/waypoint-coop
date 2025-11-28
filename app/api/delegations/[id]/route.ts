import { NextRequest, NextResponse } from 'next/server'
import { getInMemoryDB, isVercel } from '@/lib/in-memory-db'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { checkPermission } from '@/lib/api-guard'
import { getAccessibleDelegations, getUserOrganization, getDelegationsRequiringApproval } from '@/lib/permissions'

export const dynamic = 'force-dynamic'

const updateSchema = z.object({
  status: z.enum(['Active', 'Pending GP Approval', 'Rejected']).optional(),
  gpApprovalStatus: z.enum(['Pending', 'Approved', 'Rejected']).optional(),
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

    if (isVercel()) {
      const db = getInMemoryDB()
      const delegation = db.delegations.find(d => d.id === id)
      if (!delegation) {
        return NextResponse.json({ error: 'Delegation not found' }, { status: 404 })
      }
      return NextResponse.json(delegation)
    } else {
      const delegation = await prisma.delegation.findUnique({ where: { id } })
      if (!delegation) {
        return NextResponse.json({ error: 'Delegation not found' }, { status: 404 })
      }
      return NextResponse.json({
        ...delegation,
        assetScope: delegation.assetScope === 'ALL' ? 'ALL' : JSON.parse(delegation.assetScope),
        typeScope: delegation.typeScope === 'ALL' ? 'ALL' : JSON.parse(delegation.typeScope),
      })
    }
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

    // If approving/rejecting, check if user is an Asset Owner
    if (validated.gpApprovalStatus === 'Approved' || validated.gpApprovalStatus === 'Rejected') {
      if (org?.role !== 'Asset Owner' && org?.role !== 'Platform Admin') {
        return NextResponse.json({ error: 'Only Asset Owners can approve/reject delegations' }, { status: 403 })
      }
    }

    const timestamp = new Date().toISOString()

    if (isVercel()) {
      const db = getInMemoryDB()
      const delegationIndex = db.delegations.findIndex(d => d.id === id)
      if (delegationIndex === -1) {
        return NextResponse.json({ error: 'Delegation not found' }, { status: 404 })
      }

      const delegation = db.delegations[delegationIndex]

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
        if (validated.status) delegation.status = validated.status
        if (validated.gpApprovalStatus) delegation.gpApprovalStatus = validated.gpApprovalStatus
      }

      db.delegations[delegationIndex] = delegation
      return NextResponse.json(delegation)
    } else {
      const updateData: any = { ...validated }
      
      if (validated.gpApprovalStatus === 'Approved') {
        updateData.status = 'Active'
        updateData.gpApprovedAt = timestamp
        updateData.gpApprovedById = user.id
      } else if (validated.gpApprovalStatus === 'Rejected') {
        updateData.status = 'Rejected'
        updateData.gpApprovedAt = timestamp
        updateData.gpApprovedById = user.id
      }

      const delegation = await prisma.delegation.update({
        where: { id },
        data: updateData,
      })

      return NextResponse.json({
        ...delegation,
        assetScope: delegation.assetScope === 'ALL' ? 'ALL' : JSON.parse(delegation.assetScope),
        typeScope: delegation.typeScope === 'ALL' ? 'ALL' : JSON.parse(delegation.typeScope),
      })
    }
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

    if (isVercel()) {
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
    } else {
      const delegation = await prisma.delegation.findUnique({ where: { id } })
      if (!delegation) {
        return NextResponse.json({ error: 'Delegation not found' }, { status: 404 })
      }

      if (delegation.subscriberId !== org?.id && org?.role !== 'Platform Admin') {
        return NextResponse.json({ error: 'Only the subscriber can delete their delegation' }, { status: 403 })
      }

      await prisma.delegation.delete({ where: { id } })
      return NextResponse.json({ success: true })
    }
  } catch (error) {
    console.error('Error deleting delegation:', error)
    return NextResponse.json({ error: 'Failed to delete delegation' }, { status: 500 })
  }
}

