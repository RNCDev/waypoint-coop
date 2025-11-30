import { NextRequest, NextResponse } from 'next/server'
import { getDelegatableAssets } from '@/lib/permissions'

// GET /api/assets/delegatable?orgId=xxx - Get assets an org can delegate
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orgId = searchParams.get('orgId')

    if (!orgId) {
      return NextResponse.json(
        { error: 'orgId is required' },
        { status: 400 }
      )
    }

    const assets = await getDelegatableAssets(orgId)

    return NextResponse.json(assets)
  } catch (error) {
    console.error('Error fetching delegatable assets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch delegatable assets' },
      { status: 500 }
    )
  }
}

