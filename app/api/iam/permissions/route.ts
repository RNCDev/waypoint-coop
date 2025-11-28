import { NextRequest, NextResponse } from 'next/server'
import { ROLE_PERMISSIONS, getRolePermissions } from '@/lib/iam/permissions'
import { UserRole } from '@/types'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const role = searchParams.get('role') as UserRole | null

    if (role) {
      const permissions = getRolePermissions(role)
      const roleConfig = ROLE_PERMISSIONS[role]
      
      if (!roleConfig) {
        return NextResponse.json(
          { error: 'Invalid role' },
          { status: 400 }
        )
      }

      return NextResponse.json({
        role: roleConfig.role,
        description: roleConfig.description,
        permissions,
      })
    }

    return NextResponse.json(ROLE_PERMISSIONS)
  } catch (error) {
    console.error('Error fetching permissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch permissions' },
      { status: 500 }
    )
  }
}
