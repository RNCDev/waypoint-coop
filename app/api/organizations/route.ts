import { NextRequest, NextResponse } from 'next/server'
import { getInMemoryDB, isVercel } from '@/lib/in-memory-db'
import { prisma } from '@/lib/prisma'
import { withPermission } from '@/lib/iam/middleware'

export const dynamic = 'force-dynamic'

export const GET = withPermission('organizations:read')(async (request, auth, user, org) => {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (isVercel()) {
      const db = getInMemoryDB()
      if (id) {
        const targetOrg = db.organizations.find(o => o.id === parseInt(id))
        if (!targetOrg) {
          return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
        }
        return NextResponse.json(targetOrg)
      }
      return NextResponse.json(db.organizations)
    } else {
      if (id) {
        const targetOrg = await prisma.organization.findUnique({
          where: { id: parseInt(id) },
          include: {
            users: true,
            assets: true,
          },
        })
        if (!targetOrg) {
          return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
        }
        return NextResponse.json(targetOrg)
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
})

