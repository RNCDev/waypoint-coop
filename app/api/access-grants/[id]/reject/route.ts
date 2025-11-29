import { NextRequest, NextResponse } from 'next/server'
import { getInMemoryDB } from '@/lib/in-memory-db'
import { checkPermission } from '@/lib/api-guard'
import { canApproveAccessGrant, getUserOrganization } from '@/lib/permissions'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const permissionResult = checkPermission(request, 'access-grants', 'approve')
    if (!permissionResult.allowed || !permissionResult.user) {
      return NextResponse.json(
        { error: permissionResult.error || 'Access denied' },
        { status: permissionResult.user ? 403 : 401 }
      )
    }

    const user = permissionResult.user
    const org = getUserOrganization(user)
    
    if (!org) {
      return NextResponse.json({ error: 'User organization not found' }, { status: 400 })
    }

    const db = getInMemoryDB()
    const grant = db.accessGrants.find(g => g.id === id)

    if (!grant) {
      return NextResponse.json({ error: 'Access grant not found' }, { status: 404 })
    }

    // Check if grant requires approval
    if (!grant.requiresApproval) {
      return NextResponse.json({ error: 'This grant does not require approval' }, { status: 400 })
    }

    // Check if grant is pending approval
    if (grant.status !== 'Pending Approval' || grant.approvalStatus !== 'Pending') {
      return NextResponse.json({ error: 'This grant is not pending approval' }, { status: 400 })
    }

    // Check if user can approve/reject this grant
    if (!canApproveAccessGrant(user, grant)) {
      return NextResponse.json({ error: 'You do not have permission to reject this grant' }, { status: 403 })
    }

    // Reject the grant
    const timestamp = new Date().toISOString()
    grant.status = 'Revoked'
    grant.approvalStatus = 'Rejected'
    grant.approvedById = user.id
    grant.approvedAt = timestamp

    return NextResponse.json({ 
      message: 'Access grant rejected', 
      grant 
    })
  } catch (error) {
    console.error('Error rejecting access grant:', error)
    return NextResponse.json({ error: 'Failed to reject access grant' }, { status: 500 })
  }
}

