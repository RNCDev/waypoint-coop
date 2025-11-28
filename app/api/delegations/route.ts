import { NextRequest, NextResponse } from 'next/server'
import { getInMemoryDB, isVercel } from '@/lib/in-memory-db'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { DataType } from '@/types'

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
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const subscriberId = searchParams.get('subscriberId')
    const delegateId = searchParams.get('delegateId')

    if (isVercel()) {
      const db = getInMemoryDB()
      let delegations = db.delegations

      if (subscriberId) {
        delegations = delegations.filter(d => d.subscriberId === parseInt(subscriberId))
      }
      if (delegateId) {
        delegations = delegations.filter(d => d.delegateId === parseInt(delegateId))
      }

      return NextResponse.json(delegations)
    } else {
      const where: any = {}
      if (subscriberId) where.subscriberId = parseInt(subscriberId)
      if (delegateId) where.delegateId = parseInt(delegateId)

      const delegations = await prisma.delegation.findMany({ where })

      return NextResponse.json(delegations.map(d => ({
        ...d,
        assetScope: d.assetScope === 'ALL' ? 'ALL' : JSON.parse(d.assetScope),
        typeScope: d.typeScope === 'ALL' ? 'ALL' : JSON.parse(d.typeScope),
      })))
    }
  } catch (error) {
    console.error('Error fetching delegations:', error)
    return NextResponse.json({ error: 'Failed to fetch delegations' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = delegationSchema.parse(body)

    if (isVercel()) {
      const db = getInMemoryDB()
      const delegationId = `D-${Date.now()}`
      const delegation = {
        id: delegationId,
        subscriberId: validated.subscriberId,
        delegateId: validated.delegateId,
        assetScope: validated.assetScope,
        typeScope: validated.typeScope as 'ALL' | DataType[],
        status: 'Pending GP Approval' as const,
        gpApprovalStatus: 'Pending' as const,
      }

      db.delegations.push(delegation)
      return NextResponse.json(delegation, { status: 201 })
    } else {
      const delegation = await prisma.delegation.create({
        data: {
          subscriberId: validated.subscriberId,
          delegateId: validated.delegateId,
          assetScope: typeof validated.assetScope === 'string' ? validated.assetScope : JSON.stringify(validated.assetScope),
          typeScope: typeof validated.typeScope === 'string' ? validated.typeScope : JSON.stringify(validated.typeScope),
          status: 'Pending GP Approval',
          gpApprovalStatus: 'Pending',
        },
      })

      return NextResponse.json({
        ...delegation,
        assetScope: delegation.assetScope === 'ALL' ? 'ALL' : JSON.parse(delegation.assetScope),
        typeScope: delegation.typeScope === 'ALL' ? 'ALL' : JSON.parse(delegation.typeScope),
      }, { status: 201 })
    }
  } catch (error) {
    console.error('Error creating delegation:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create delegation' }, { status: 500 })
  }
}

