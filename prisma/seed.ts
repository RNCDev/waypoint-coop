import { PrismaClient } from '@prisma/client'
import { mockOrganizations, mockUsers, mockAssets, mockEnvelopes, mockPayloads, mockDelegations } from '../lib/mock-data'
import { generateHash } from '../lib/crypto'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clear existing data
  await prisma.readReceipt.deleteMany()
  await prisma.payload.deleteMany()
  await prisma.envelope.deleteMany()
  await prisma.delegation.deleteMany()
  await prisma.asset.deleteMany()
  await prisma.user.deleteMany()
  await prisma.organization.deleteMany()

  // Seed Organizations
  for (const org of mockOrganizations) {
    await prisma.organization.create({
      data: {
        id: org.id,
        name: org.name,
        role: org.role,
        type: org.type,
        status: org.status,
        imageUrl: org.imageUrl,
      },
    })
  }
  console.log(`Created ${mockOrganizations.length} organizations`)

  // Seed Users
  for (const user of mockUsers) {
    await prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        orgId: user.orgId,
        role: user.role,
      },
    })
  }
  console.log(`Created ${mockUsers.length} users`)

  // Seed Assets
  for (const asset of mockAssets) {
    await prisma.asset.create({
      data: {
        id: asset.id,
        name: asset.name,
        ownerId: asset.ownerId,
        publisherId: asset.publisherId,
        type: asset.type,
      },
    })
  }
  console.log(`Created ${mockAssets.length} assets`)

  // Seed Envelopes with hashes (one envelope per LP)
  for (const env of mockEnvelopes) {
    const payload = mockPayloads.find(p => p.envelopeId === env.id)
    const hash = generateHash(env, payload?.data || {})
    
    await prisma.envelope.create({
      data: {
        id: env.id,
        publisherId: env.publisherId,
        userId: env.userId,
        assetOwnerId: env.assetOwnerId,
        assetId: env.assetId,
        recipientId: env.recipientId, // Single recipient per envelope
        timestamp: env.timestamp,
        version: env.version,
        status: env.status,
        hash,
        dataType: env.dataType || null,
        period: env.period || null,
      },
    })
  }
  console.log(`Created ${mockEnvelopes.length} envelopes`)

  // Seed Payloads
  for (const payload of mockPayloads) {
    await prisma.payload.create({
      data: {
        id: payload.id,
        envelopeId: payload.envelopeId,
        data: JSON.stringify(payload.data),
      },
    })
  }
  console.log(`Created ${mockPayloads.length} payloads`)

  // Seed Delegations
  for (const del of mockDelegations) {
    await prisma.delegation.create({
      data: {
        id: del.id,
        subscriberId: del.subscriberId,
        delegateId: del.delegateId,
        assetScope: typeof del.assetScope === 'string' ? del.assetScope : JSON.stringify(del.assetScope),
        typeScope: typeof del.typeScope === 'string' ? del.typeScope : JSON.stringify(del.typeScope),
        status: del.status,
        gpApprovalStatus: del.gpApprovalStatus || null,
      },
    })
  }
  console.log(`Created ${mockDelegations.length} delegations`)

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

