import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/assets/[id]/route-map - Get asset permission topology for visualization
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        subscriptions: {
          where: {
            status: 'ACTIVE',
          },
          include: {
            subscriber: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
        },
        accessGrants: {
          where: {
            status: 'ACTIVE',
          },
          include: {
            grantee: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
        },
        grantAssets: {
          include: {
            grant: {
              include: {
                grantee: {
                  select: {
                    id: true,
                    name: true,
                    type: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!asset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      )
    }

    // Combine grants from both legacy single-asset and new multi-asset junction
    const legacyGrants = asset.accessGrants.map((g) => ({
      id: g.id,
      grantee: g.grantee,
      canPublish: g.canPublish,
      canViewData: g.canViewData,
      canManageSubscriptions: g.canManageSubscriptions,
      canApproveDelegations: g.canApproveDelegations,
    }))

    const multiAssetGrants = asset.grantAssets
      .filter((ga) => ga.grant.status === 'ACTIVE')
      .map((ga) => ({
        id: ga.grant.id,
        grantee: ga.grant.grantee,
        canPublish: ga.grant.canPublish,
        canViewData: ga.grant.canViewData,
        canManageSubscriptions: ga.grant.canManageSubscriptions,
        canApproveDelegations: ga.grant.canApproveDelegations,
      }))

    const allGrants = [...legacyGrants, ...multiAssetGrants]

    // Deduplicate grants by grantee id
    const uniqueGrants = allGrants.reduce<typeof allGrants>((acc, grant) => {
      if (!acc.find((g) => g.grantee.id === grant.grantee.id)) {
        acc.push(grant)
      }
      return acc
    }, [])

    const routeMap = {
      asset: {
        id: asset.id,
        name: asset.name,
        type: asset.type,
      },
      manager: asset.manager,
      subscribers: asset.subscriptions.map((s) => s.subscriber),
      grants: uniqueGrants,
    }

    return NextResponse.json(routeMap)
  } catch (error) {
    console.error('Error fetching asset route map:', error)
    return NextResponse.json(
      { error: 'Failed to fetch asset route map' },
      { status: 500 }
    )
  }
}
