import { NextRequest, NextResponse } from 'next/server'
import { getInMemoryDB, isVercel } from '@/lib/in-memory-db'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (isVercel()) {
      const db = getInMemoryDB()
      if (id) {
        const org = db.organizations.find(o => o.id === parseInt(id))
        if (!org) {
          return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
        }
        return NextResponse.json(org)
      }
      return NextResponse.json(db.organizations)
    } else {
      if (id) {
        const org = await prisma.organization.findUnique({
          where: { id: parseInt(id) },
          include: {
            users: true,
            assets: true,
          },
        })
        if (!org) {
          return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
        }
        return NextResponse.json(org)
      }

      const orgs = await prisma.organization.findMany({
        include: {
          users: true,
          assets: true,
        },
      })
      return NextResponse.json(orgs)
    }
  } catch (error) {
    console.error('Error fetching organizations:', error)
    return NextResponse.json({ error: 'Failed to fetch organizations' }, { status: 500 })
  }
}

