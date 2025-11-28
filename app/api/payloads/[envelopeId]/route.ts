import { NextRequest, NextResponse } from 'next/server'
import { getInMemoryDB } from '@/lib/in-memory-db'
import { hasActiveSubscriptionSync, getAccessibleAssets, getUserOrganization, filterEnvelopesByAccess } from '@/lib/permissions'
import { getCurrentUser } from '@/lib/api-guard'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ envelopeId: string }> }
) {
  try {
    const { envelopeId: envelopeIdParam } = await params
    const envelopeId = parseInt(envelopeIdParam)
    const searchParams = request.nextUrl.searchParams
    const orgId = searchParams.get('orgId')

    if (!orgId) {
      return NextResponse.json({ error: 'orgId parameter is required' }, { status: 400 })
    }

    const orgIdNum = parseInt(orgId)
    
    // Get current user for read receipt creation
    const user = getCurrentUser(request)

    // Fetch envelope to verify authorization
    const db = getInMemoryDB()
    const envelope = db.envelopes.find(e => e.id === envelopeId)

    if (!envelope) {
      return NextResponse.json({ error: 'Envelope not found' }, { status: 404 })
    }

    // Get user's organization to check role
    const org = user ? getUserOrganization(user) : null

    // Verify authorization: must be publisher, recipient, or delegate with access
    const isPublisher = envelope.publisherId === orgIdNum
    const isRecipient = envelope.recipientId === orgIdNum
    const isDelegate = org?.role === 'Delegate'

    // Check if delegate has access via delegation
    // Use the same filtering logic as filterEnvelopesByAccess to ensure consistency
    let delegateHasAccess = false
    if (isDelegate && org && user) {
      // Use filterEnvelopesByAccess to check if this envelope would be visible to the delegate
      const filteredEnvelopes = filterEnvelopesByAccess(user, [envelope as any])
      delegateHasAccess = filteredEnvelopes.length > 0
    }

    if (!isPublisher && !isRecipient && !delegateHasAccess) {
      return NextResponse.json({ error: 'Unauthorized: Organization not authorized to view this envelope' }, { status: 403 })
    }

    // If requester is the publisher, verify they have view access (canViewData = true)
    if (isPublisher && !isRecipient && !delegateHasAccess && user) {
      const accessibleAssets = getAccessibleAssets(user)
      const canViewAsset = accessibleAssets.some(a => a.id === envelope.assetId)
      
      if (!canViewAsset) {
        return NextResponse.json(
          { error: 'Unauthorized: Publisher does not have view access to this asset (canViewData = false)' },
          { status: 403 }
        )
      }
    }

    // If requester is the recipient, verify they have an active subscription to the asset
    if (isRecipient && !isPublisher && !delegateHasAccess) {
      const recipientHasSubscription = hasActiveSubscriptionSync(
        envelope.assetId,
        orgIdNum
      )
      
      if (!recipientHasSubscription) {
        return NextResponse.json(
          { error: 'Unauthorized: Recipient does not have an active subscription to this asset' },
          { status: 403 }
        )
      }
    }

    // Fetch the payload - no filtering needed since each envelope is already scoped to one LP
    const payload = db.payloads.find(p => p.envelopeId === envelopeId)
    if (!payload) {
      return NextResponse.json({ error: 'Payload not found' }, { status: 404 })
    }
    const payloadData = payload.data

    // Auto-create read receipt if user is the recipient (not publisher) or delegate
    // This tracks that the LP or delegate has viewed the data
    if ((isRecipient || delegateHasAccess) && !isPublisher && user) {
      const viewedAt = new Date().toISOString()
      
      // Check if receipt already exists
      const existingReceipt = db.readReceipts.find(
        r => r.envelopeId === envelopeId && r.userId === user.id
      )
      
      if (!existingReceipt) {
        const receipt = {
          id: db.nextReceiptId++,
          envelopeId,
          userId: user.id,
          viewedAt,
        }
        db.readReceipts.push(receipt)
      }
    }

    return NextResponse.json({
      id: envelopeId,
      envelopeId,
      data: payloadData, // Already scoped to single LP, no filtering needed
    })
  } catch (error) {
    console.error('Error fetching payload:', error)
    return NextResponse.json({ error: 'Failed to fetch payload' }, { status: 500 })
  }
}
