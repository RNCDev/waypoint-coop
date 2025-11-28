import { NextRequest, NextResponse } from 'next/server'
import { getInMemoryDB, isVercel } from '@/lib/in-memory-db'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { withAuth, logAuditEvent } from '@/lib/iam/middleware'
import { authorize, canManageDelegation } from '@/lib/iam/authorization'

export const dynamic = 'force-dynamic'

const updateSchema = z.object({
  status: z.enum(['Active', 'Pending GP Approval', 'Rejected']).optional(),
  gpApprovalStatus: z.enum(['Pending', 'Approved', 'Rejected']).optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(async (req, auth, user, org) => {
    try {
      const id = params.id
      const body = await request.json()
      const validated = updateSchema.parse(body)

      let delegation
      
      if (isVercel()) {
        const db = getInMemoryDB()
        delegation = db.delegations.find(d => d.id === id)
        if (!delegation) {
          return NextResponse.json({ error: 'Delegation not found' }, { status: 404 })
        }
      } else {
        delegation = await prisma.delegation.findUnique({
          where: { id },
        })
        if (!delegation) {
          return NextResponse.json({ error: 'Delegation not found' }, { status: 404 })
        }
        delegation = {
          ...delegation,
          assetScope: delegation.assetScope === 'ALL' ? 'ALL' : JSON.parse(delegation.assetScope),
          typeScope: delegation.typeScope === 'ALL' ? 'ALL' : JSON.parse(delegation.typeScope),
        }
      }

      if (!canManageDelegation(auth, org, delegation)) {
        await logAuditEvent(auth, 'UPDATE_DELEGATION', 'delegations', undefined, 'failure', request, {
          reason: 'Insufficient permissions',
        })
        return NextResponse.json(
          { error: 'Cannot manage this delegation' },
          { status: 403 }
        )
      }

      if (isVercel()) {
        const db = getInMemoryDB()
        const delegationToUpdate = db.delegations.find(d => d.id === id)!
        if (validated.status) delegationToUpdate.status = validated.status
        if (validated.gpApprovalStatus) delegationToUpdate.gpApprovalStatus = validated.gpApprovalStatus

        await logAuditEvent(auth, 'UPDATE_DELEGATION', 'delegations', undefined, 'success', request, validated)
        return NextResponse.json(delegationToUpdate)
      } else {
        const updated = await prisma.delegation.update({
          where: { id },
          data: validated,
        })

        await logAuditEvent(auth, 'UPDATE_DELEGATION', 'delegations', undefined, 'success', request, validated)

        return NextResponse.json({
          ...updated,
          assetScope: updated.assetScope === 'ALL' ? 'ALL' : JSON.parse(updated.assetScope),
          typeScope: updated.typeScope === 'ALL' ? 'ALL' : JSON.parse(updated.typeScope),
        })
      }
    } catch (error) {
      console.error('Error updating delegation:', error)
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
      }
      return NextResponse.json({ error: 'Failed to update delegation' }, { status: 500 })
    }
  })(request)
}

