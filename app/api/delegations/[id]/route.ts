import { NextRequest, NextResponse } from 'next/server'
import { getInMemoryDB, isVercel } from '@/lib/in-memory-db'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateSchema = z.object({
  status: z.enum(['Active', 'Pending GP Approval', 'Rejected']).optional(),
  gpApprovalStatus: z.enum(['Pending', 'Approved', 'Rejected']).optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const body = await request.json()
    const validated = updateSchema.parse(body)

    if (isVercel()) {
      const db = getInMemoryDB()
      const delegation = db.delegations.find(d => d.id === id)
      if (!delegation) {
        return NextResponse.json({ error: 'Delegation not found' }, { status: 404 })
      }

      if (validated.status) delegation.status = validated.status
      if (validated.gpApprovalStatus) delegation.gpApprovalStatus = validated.gpApprovalStatus

      return NextResponse.json(delegation)
    } else {
      const delegation = await prisma.delegation.update({
        where: { id },
        data: validated,
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

