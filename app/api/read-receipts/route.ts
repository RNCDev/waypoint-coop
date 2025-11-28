import { NextRequest, NextResponse } from 'next/server'
import { getInMemoryDB, isVercel } from '@/lib/in-memory-db'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const receiptSchema = z.object({
  envelopeId: z.number(),
  userId: z.number(),
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const envelopeId = searchParams.get('envelopeId')
    const userId = searchParams.get('userId')

    if (isVercel()) {
      const db = getInMemoryDB()
      let receipts = db.readReceipts

      if (envelopeId) {
        receipts = receipts.filter(r => r.envelopeId === parseInt(envelopeId))
      }
      if (userId) {
        receipts = receipts.filter(r => r.userId === parseInt(userId))
      }

      return NextResponse.json(receipts)
    } else {
      const where: any = {}
      if (envelopeId) where.envelopeId = parseInt(envelopeId)
      if (userId) where.userId = parseInt(userId)

      const receipts = await prisma.readReceipt.findMany({ where })
      return NextResponse.json(receipts)
    }
  } catch (error) {
    console.error('Error fetching read receipts:', error)
    return NextResponse.json({ error: 'Failed to fetch read receipts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = receiptSchema.parse(body)

    const viewedAt = new Date().toISOString()

    if (isVercel()) {
      const db = getInMemoryDB()
      // Check if receipt already exists
      const existing = db.readReceipts.find(
        r => r.envelopeId === validated.envelopeId && r.userId === validated.userId
      )
      if (existing) {
        return NextResponse.json(existing)
      }

      const receipt = {
        id: db.nextReceiptId++,
        ...validated,
        viewedAt,
      }

      db.readReceipts.push(receipt)
      return NextResponse.json(receipt, { status: 201 })
    } else {
      // Check if receipt already exists
      const existing = await prisma.readReceipt.findFirst({
        where: {
          envelopeId: validated.envelopeId,
          userId: validated.userId,
        },
      })

      if (existing) {
        return NextResponse.json(existing)
      }

      const receipt = await prisma.readReceipt.create({
        data: {
          envelopeId: validated.envelopeId,
          userId: validated.userId,
          viewedAt,
        },
      })

      return NextResponse.json(receipt, { status: 201 })
    }
  } catch (error) {
    console.error('Error creating read receipt:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create read receipt' }, { status: 500 })
  }
}

