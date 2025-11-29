import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { OrgType } from '@prisma/client'

// GET /api/organizations - List all organizations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as OrgType | null

    const organizations = await prisma.organization.findMany({
      where: type ? { type } : undefined,
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

