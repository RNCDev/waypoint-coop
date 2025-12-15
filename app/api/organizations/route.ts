import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/organizations - List all organizations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // Now a string instead of enum
    const startDate = searchParams.get('startDate')
    const countOnly = searchParams.get('countOnly') === 'true'

    const whereClause: any = {}
    if (type) whereClause.type = type
    if (startDate) {
      whereClause.createdAt = { gte: new Date(startDate) }
    }

    if (countOnly) {
      // For count queries, if whereClause is empty, count all records
      const count = await prisma.organization.count({
        where: Object.keys(whereClause).length > 0 ? whereClause : {},
      })
      return NextResponse.json({ count })
    }

    const organizations = await prisma.organization.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      include: {
        _count: {
          select: {
            users: true,
            managedAssets: true,
            subscriptions: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(organizations)
  } catch (error) {
    console.error('Error fetching organizations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch organizations' },
      { status: 500 }
    )
  }
}

// POST /api/organizations - Create a new organization
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, lei } = body

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      )
    }

    const organization = await prisma.organization.create({
      data: {
        name,
        type,
        lei,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entityType: 'Organization',
        entityId: organization.id,
        organizationId: organization.id,
        details: { name, type },
      },
    })

    return NextResponse.json(organization, { status: 201 })
  } catch (error) {
    console.error('Error creating organization:', error)
    return NextResponse.json(
      { error: 'Failed to create organization' },
      { status: 500 }
    )
  }
}

