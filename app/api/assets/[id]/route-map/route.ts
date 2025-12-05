import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/assets/[id]/route-map - Get asset permission topology for visualization
// Query params:
//   - viewerOrgId: The organization viewing the route map (for privacy filtering)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const viewerOrgId = searchParams.get('viewerOrgId')

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
            grantor: {
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
                grantor: {
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
      grantor: g.grantor,
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
        grantor: ga.grant.grantor,
        canPublish: ga.grant.canPublish,
        canViewData: ga.grant.canViewData,
        canManageSubscriptions: ga.grant.canManageSubscriptions,
        canApproveDelegations: ga.grant.canApproveDelegations,
      }))

    const allGrants = [...legacyGrants, ...multiAssetGrants]

    // Deduplicate grants by grantee id, merging capabilities with OR logic
    // If a grantee has multiple grants, combine their capabilities
    // Preserve the first grantor found (primary delegator)
    const uniqueGrants = allGrants.reduce<typeof allGrants>((acc, grant) => {
      const existing = acc.find((g) => g.grantee.id === grant.grantee.id)
      if (existing) {
        // Merge capabilities - if any grant provides a capability, the grantee has it
        existing.canPublish = existing.canPublish || grant.canPublish
        existing.canViewData = existing.canViewData || grant.canViewData
        existing.canManageSubscriptions = existing.canManageSubscriptions || grant.canManageSubscriptions
        existing.canApproveDelegations = existing.canApproveDelegations || grant.canApproveDelegations
        // Keep the first grantor found (don't overwrite)
      } else {
        // First grant for this grantee - add it (with a copy to avoid mutation issues)
        acc.push({ ...grant })
      }
      return acc
    }, [])

    // Determine viewer's role for privacy filtering
    const isManager = viewerOrgId === asset.manager.id
    const isSubscriber = asset.subscriptions.some((s) => s.subscriber.id === viewerOrgId)
    const isGrantee = uniqueGrants.some((g) => g.grantee.id === viewerOrgId)

    // Privacy-aware filtering:
    // - Managers (GPs) see the full topology
    // - Subscribers (LPs) should NOT see other subscribers or their delegates (sensitivity)
    // - Grantees (delegates) should NOT see subscribers or other grantees
    let filteredSubscribers = asset.subscriptions.map((s) => s.subscriber)
    let filteredGrants = uniqueGrants

    if (!isManager) {
      // Non-managers have restricted views for privacy
      if (isSubscriber) {
        // Subscribers only see themselves, not other subscribers
        filteredSubscribers = filteredSubscribers.filter((s) => s.id === viewerOrgId)
        // Subscribers don't see grants (other delegates)
        filteredGrants = []
      } else if (isGrantee) {
        // Grantees don't see subscribers (privacy)
        filteredSubscribers = []
        // Grantees only see themselves, not other grantees
        filteredGrants = filteredGrants.filter((g) => g.grantee.id === viewerOrgId)
      } else {
        // Unknown viewer - show minimal information
        filteredSubscribers = []
        filteredGrants = []
      }
    }

    const routeMap = {
      asset: {
        id: asset.id,
        name: asset.name,
        type: asset.type,
      },
      manager: asset.manager,
      subscribers: filteredSubscribers,
      grants: filteredGrants,
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
