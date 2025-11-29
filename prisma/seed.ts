import { PrismaClient, OrgType, AssetType, GrantStatus, SubscriptionStatus, AccessLevel, DataArtifact, UserRole } from '@prisma/client'
import { createHash } from 'crypto'

const prisma = new PrismaClient()

// Helper to generate SHA-256 hash
function generateHash(data: object): string {
  return createHash('sha256').update(JSON.stringify(data)).digest('hex')
}

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.readReceipt.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.envelope.deleteMany()
  await prisma.accessGrant.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.user.deleteMany()
  await prisma.asset.deleteMany()
  await prisma.organization.deleteMany()

  // ==========================================================================
  // ORGANIZATIONS
  // ==========================================================================
  console.log('Creating organizations...')

  // Platform Admin
  const waypointCoop = await prisma.organization.create({
    data: {
      id: 'org_waypoint',
      name: 'Waypoint Cooperative',
      type: OrgType.PLATFORM_ADMIN,
      lei: 'WAYPOINT000000000001',
    },
  })

  // GPs / Asset Managers
  const kleinerPerkins = await prisma.organization.create({
    data: {
      id: 'org_kp',
      name: 'Kleiner Perkins',
      type: OrgType.GP,
      lei: 'KP00000000000000001',
    },
  })

  const costanoaVentures = await prisma.organization.create({
    data: {
      id: 'org_costanoa',
      name: 'Costanoa Ventures',
      type: OrgType.GP,
      lei: 'COSTANOA0000000001',
    },
  })

  const franklinPark = await prisma.organization.create({
    data: {
      id: 'org_fp',
      name: 'Franklin Park',
      type: OrgType.GP, // Also acts as LP in some funds
      lei: 'FP00000000000000001',
    },
  })

  // LPs / Investors
  const ohioPension = await prisma.organization.create({
    data: {
      id: 'org_ohio',
      name: 'State of Ohio Pension',
      type: OrgType.LP,
      lei: 'OHIO00000000000001',
    },
  })

  const calpers = await prisma.organization.create({
    data: {
      id: 'org_calpers',
      name: 'CalPERS',
      type: OrgType.LP,
      lei: 'CALPERS000000000001',
    },
  })

  const harvardEndowment = await prisma.organization.create({
    data: {
      id: 'org_harvard',
      name: 'Harvard Management Company',
      type: OrgType.LP,
      lei: 'HARVARD000000000001',
    },
  })

  // Fund Admin
  const geniiAdmin = await prisma.organization.create({
    data: {
      id: 'org_genii',
      name: 'Genii Admin Services',
      type: OrgType.FUND_ADMIN,
      lei: 'GENII0000000000001',
    },
  })

  // Auditor
  const deloitte = await prisma.organization.create({
    data: {
      id: 'org_deloitte',
      name: 'Deloitte',
      type: OrgType.AUDITOR,
      lei: 'DELOITTE00000000001',
    },
  })

  // Consultant
  const mercer = await prisma.organization.create({
    data: {
      id: 'org_mercer',
      name: 'Mercer',
      type: OrgType.CONSULTANT,
      lei: 'MERCER0000000000001',
    },
  })

  // Tax Advisor
  const pwc = await prisma.organization.create({
    data: {
      id: 'org_pwc',
      name: 'PwC',
      type: OrgType.TAX_ADVISOR,
      lei: 'PWC0000000000000001',
    },
  })

  // ==========================================================================
  // USERS
  // ==========================================================================
  console.log('Creating users...')

  // Platform Admin user
  const aliceAdmin = await prisma.user.create({
    data: {
      id: 'user_alice',
      name: 'Alice Admin',
      email: 'alice@waypoint.coop',
      organizationId: waypointCoop.id,
      role: UserRole.ADMIN,
    },
  })

  // GP user
  const bobGP = await prisma.user.create({
    data: {
      id: 'user_bob',
      name: 'Bob GP',
      email: 'bob@kleinerperkins.com',
      organizationId: kleinerPerkins.id,
      role: UserRole.ADMIN,
    },
  })

  // Fund Admin user
  const geniiPublisher = await prisma.user.create({
    data: {
      id: 'user_genii',
      name: 'Genii Publisher',
      email: 'publisher@genii.com',
      organizationId: geniiAdmin.id,
      role: UserRole.ADMIN,
    },
  })

  // LP user
  const charlieLP = await prisma.user.create({
    data: {
      id: 'user_charlie',
      name: 'Charlie LP',
      email: 'charlie@ohiopension.gov',
      organizationId: ohioPension.id,
      role: UserRole.ADMIN,
    },
  })

  // Auditor user (Delegate)
  const danaDelegate = await prisma.user.create({
    data: {
      id: 'user_dana',
      name: 'Dana Delegate',
      email: 'dana@deloitte.com',
      organizationId: deloitte.id,
      role: UserRole.MEMBER,
    },
  })

  // Additional users for demo
  await prisma.user.create({
    data: {
      id: 'user_costanoa',
      name: 'Sarah Costanoa',
      email: 'sarah@costanoa.com',
      organizationId: costanoaVentures.id,
      role: UserRole.ADMIN,
    },
  })

  await prisma.user.create({
    data: {
      id: 'user_calpers',
      name: 'Mike CalPERS',
      email: 'mike@calpers.ca.gov',
      organizationId: calpers.id,
      role: UserRole.ADMIN,
    },
  })

  // ==========================================================================
  // ASSETS
  // ==========================================================================
  console.log('Creating assets...')

  // Kleiner Perkins Funds
  const kpFirmAsset = await prisma.asset.create({
    data: {
      id: 'asset_kp_firm',
      name: 'Kleiner Perkins',
      type: AssetType.FIRM,
      managerId: kleinerPerkins.id,
    },
  })

  const kpFund21 = await prisma.asset.create({
    data: {
      id: 'asset_kp21',
      name: 'KP Fund XXI',
      type: AssetType.FUND,
      managerId: kleinerPerkins.id,
      parentId: kpFirmAsset.id,
      vintage: 2023,
      requireGPApprovalForDelegations: true,
    },
  })

  const kpFund20 = await prisma.asset.create({
    data: {
      id: 'asset_kp20',
      name: 'KP Fund XX',
      type: AssetType.FUND,
      managerId: kleinerPerkins.id,
      parentId: kpFirmAsset.id,
      vintage: 2021,
      requireGPApprovalForDelegations: true,
    },
  })

  // Costanoa Funds
  const costanoaFirmAsset = await prisma.asset.create({
    data: {
      id: 'asset_costanoa_firm',
      name: 'Costanoa Ventures',
      type: AssetType.FIRM,
      managerId: costanoaVentures.id,
    },
  })

  const costanoaFund6 = await prisma.asset.create({
    data: {
      id: 'asset_costanoa6',
      name: 'Costanoa Fund VI',
      type: AssetType.FUND,
      managerId: costanoaVentures.id,
      parentId: costanoaFirmAsset.id,
      vintage: 2022,
    },
  })

  // Franklin Park Fund (they are both GP and LP)
  const fpFirmAsset = await prisma.asset.create({
    data: {
      id: 'asset_fp_firm',
      name: 'Franklin Park',
      type: AssetType.FIRM,
      managerId: franklinPark.id,
    },
  })

  const fpVentureXV = await prisma.asset.create({
    data: {
      id: 'asset_fp15',
      name: 'FP Venture XV',
      type: AssetType.FUND,
      managerId: franklinPark.id,
      parentId: fpFirmAsset.id,
      vintage: 2024,
    },
  })

  // SPV under KP Fund XXI
  const kpSPV1 = await prisma.asset.create({
    data: {
      id: 'asset_kp_spv1',
      name: 'KP XXI - Co-Invest SPV I',
      type: AssetType.SPV,
      managerId: kleinerPerkins.id,
      parentId: kpFund21.id,
    },
  })

  // ==========================================================================
  // SUBSCRIPTIONS
  // ==========================================================================
  console.log('Creating subscriptions...')

  // Ohio Pension subscriptions
  await prisma.subscription.create({
    data: {
      assetId: kpFund21.id,
      subscriberId: ohioPension.id,
      status: SubscriptionStatus.ACTIVE,
      accessLevel: AccessLevel.FULL,
      commitment: 50000000, // $50M
    },
  })

  await prisma.subscription.create({
    data: {
      assetId: costanoaFund6.id,
      subscriberId: ohioPension.id,
      status: SubscriptionStatus.ACTIVE,
      accessLevel: AccessLevel.FULL,
      commitment: 25000000, // $25M
    },
  })

  // CalPERS subscriptions
  await prisma.subscription.create({
    data: {
      assetId: kpFund21.id,
      subscriberId: calpers.id,
      status: SubscriptionStatus.ACTIVE,
      accessLevel: AccessLevel.FULL,
      commitment: 100000000, // $100M
    },
  })

  await prisma.subscription.create({
    data: {
      assetId: kpFund20.id,
      subscriberId: calpers.id,
      status: SubscriptionStatus.ACTIVE,
      accessLevel: AccessLevel.FULL,
      commitment: 75000000, // $75M
    },
  })

  // Harvard subscriptions
  await prisma.subscription.create({
    data: {
      assetId: costanoaFund6.id,
      subscriberId: harvardEndowment.id,
      status: SubscriptionStatus.ACTIVE,
      accessLevel: AccessLevel.FULL,
      commitment: 40000000, // $40M
    },
  })

  // Franklin Park as LP in Costanoa
  await prisma.subscription.create({
    data: {
      assetId: costanoaFund6.id,
      subscriberId: franklinPark.id,
      status: SubscriptionStatus.ACTIVE,
      accessLevel: AccessLevel.FULL,
      commitment: 15000000, // $15M
    },
  })

  // ==========================================================================
  // ACCESS GRANTS
  // ==========================================================================
  console.log('Creating access grants...')

  // GP -> Fund Admin delegation (KP grants to Genii)
  await prisma.accessGrant.create({
    data: {
      id: 'grant_kp_genii',
      grantorId: kleinerPerkins.id,
      granteeId: geniiAdmin.id,
      assetId: kpFund21.id,
      status: GrantStatus.ACTIVE,
      canPublish: true,
      canViewData: true,
      canManageSubscriptions: true,
      canApproveDelegations: false,
      approvedBy: bobGP.id,
      approvedAt: new Date(),
    },
  })

  await prisma.accessGrant.create({
    data: {
      id: 'grant_kp_genii_20',
      grantorId: kleinerPerkins.id,
      granteeId: geniiAdmin.id,
      assetId: kpFund20.id,
      status: GrantStatus.ACTIVE,
      canPublish: true,
      canViewData: true,
      canManageSubscriptions: true,
      canApproveDelegations: false,
      approvedBy: bobGP.id,
      approvedAt: new Date(),
    },
  })

  // GP -> Auditor delegation
  await prisma.accessGrant.create({
    data: {
      id: 'grant_kp_deloitte',
      grantorId: kleinerPerkins.id,
      granteeId: deloitte.id,
      assetId: kpFund21.id,
      status: GrantStatus.ACTIVE,
      canPublish: false,
      canViewData: true,
      canManageSubscriptions: false,
      canApproveDelegations: false,
      approvedBy: bobGP.id,
      approvedAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    },
  })

  // LP -> Consultant delegation (Ohio grants to Mercer)
  await prisma.accessGrant.create({
    data: {
      id: 'grant_ohio_mercer',
      grantorId: ohioPension.id,
      granteeId: mercer.id,
      assetId: kpFund21.id,
      status: GrantStatus.ACTIVE,
      canPublish: false,
      canViewData: true,
      canManageSubscriptions: false,
      canApproveDelegations: false,
      approvedBy: charlieLP.id,
      approvedAt: new Date(),
    },
  })

  // LP -> Auditor delegation (requires GP approval - PENDING)
  await prisma.accessGrant.create({
    data: {
      id: 'grant_ohio_deloitte_pending',
      grantorId: ohioPension.id,
      granteeId: deloitte.id,
      assetId: kpFund21.id,
      status: GrantStatus.PENDING_APPROVAL,
      canPublish: false,
      canViewData: true,
      canManageSubscriptions: false,
      canApproveDelegations: false,
    },
  })

  // GP -> Tax Advisor
  await prisma.accessGrant.create({
    data: {
      id: 'grant_kp_pwc',
      grantorId: kleinerPerkins.id,
      granteeId: pwc.id,
      assetId: kpFund21.id,
      status: GrantStatus.ACTIVE,
      canPublish: true, // Can publish K-1s
      canViewData: true,
      canManageSubscriptions: false,
      canApproveDelegations: false,
      approvedBy: bobGP.id,
      approvedAt: new Date(),
    },
  })

  // ==========================================================================
  // ENVELOPES (Sample Data Packets)
  // ==========================================================================
  console.log('Creating envelopes...')

  // Capital Call - KP Fund XXI
  const capitalCallPayload1 = {
    fundName: 'KP Fund XXI',
    callNumber: 3,
    callDate: '2024-10-15',
    dueDate: '2024-10-30',
    totalCallAmount: 25000000,
    purpose: 'Series B investment in TechCo Inc.',
    wireInstructions: {
      bank: 'Silicon Valley Bank',
      accountNumber: '****1234',
      routingNumber: '****5678',
    },
  }
  const envelope1 = await prisma.envelope.create({
    data: {
      id: 'env_cc_001',
      type: DataArtifact.CAPITAL_CALL,
      payload: capitalCallPayload1,
      hash: generateHash(capitalCallPayload1),
      version: 1,
      publisherId: geniiAdmin.id,
      assetId: kpFund21.id,
      createdAt: new Date('2024-10-15T10:00:00Z'),
    },
  })

  // Distribution - KP Fund XX
  const distributionPayload = {
    fundName: 'KP Fund XX',
    distributionNumber: 5,
    distributionDate: '2024-09-30',
    totalDistribution: 75000000,
    type: 'Partial Exit',
    portfolioCompany: 'FinTech Solutions',
    notes: 'Proceeds from secondary sale',
  }
  await prisma.envelope.create({
    data: {
      id: 'env_dist_001',
      type: DataArtifact.DISTRIBUTION,
      payload: distributionPayload,
      hash: generateHash(distributionPayload),
      version: 1,
      publisherId: geniiAdmin.id,
      assetId: kpFund20.id,
      createdAt: new Date('2024-09-30T14:00:00Z'),
    },
  })

  // Financial Statement - Costanoa Fund VI
  const financialPayload = {
    fundName: 'Costanoa Fund VI',
    period: 'Q3 2024',
    nav: 285000000,
    contributions: 150000000,
    distributions: 25000000,
    unfundedCommitment: 100000000,
    irr: 0.182,
    tvpi: 1.35,
    dpi: 0.17,
  }
  await prisma.envelope.create({
    data: {
      id: 'env_fin_001',
      type: DataArtifact.FINANCIAL_STATEMENT,
      payload: financialPayload,
      hash: generateHash(financialPayload),
      version: 1,
      publisherId: costanoaVentures.id,
      assetId: costanoaFund6.id,
      createdAt: new Date('2024-10-20T09:00:00Z'),
    },
  })

  // Capital Call with Correction (v2)
  const correctedCapitalCallPayload = {
    fundName: 'KP Fund XXI',
    callNumber: 3,
    callDate: '2024-10-15',
    dueDate: '2024-11-01', // Corrected due date
    totalCallAmount: 25000000,
    purpose: 'Series B investment in TechCo Inc.',
    wireInstructions: {
      bank: 'Silicon Valley Bank',
      accountNumber: '****1234',
      routingNumber: '****5678',
    },
    correctionNote: 'Due date extended by 2 days per LP request',
  }
  await prisma.envelope.create({
    data: {
      id: 'env_cc_001_v2',
      type: DataArtifact.CAPITAL_CALL,
      payload: correctedCapitalCallPayload,
      hash: generateHash(correctedCapitalCallPayload),
      version: 2,
      parentId: envelope1.id,
      publisherId: geniiAdmin.id,
      assetId: kpFund21.id,
      createdAt: new Date('2024-10-16T11:00:00Z'),
    },
  })

  // Tax Document - K-1
  const taxPayload = {
    fundName: 'KP Fund XXI',
    taxYear: 2023,
    documentType: 'Schedule K-1',
    partnerName: 'State of Ohio Pension',
    ordinaryIncome: 1250000,
    capitalGains: 3500000,
    dividends: 125000,
    stateAllocations: {
      CA: 0.45,
      DE: 0.35,
      NY: 0.20,
    },
  }
  await prisma.envelope.create({
    data: {
      id: 'env_tax_001',
      type: DataArtifact.TAX_DOCUMENT,
      payload: taxPayload,
      hash: generateHash(taxPayload),
      version: 1,
      publisherId: pwc.id,
      assetId: kpFund21.id,
      createdAt: new Date('2024-03-15T16:00:00Z'),
    },
  })

  // ==========================================================================
  // READ RECEIPTS
  // ==========================================================================
  console.log('Creating read receipts...')

  await prisma.readReceipt.create({
    data: {
      envelopeId: 'env_cc_001_v2',
      userId: charlieLP.id,
      readAt: new Date('2024-10-16T12:30:00Z'),
    },
  })

  await prisma.readReceipt.create({
    data: {
      envelopeId: 'env_dist_001',
      userId: charlieLP.id,
      readAt: new Date('2024-10-01T09:15:00Z'),
    },
  })

  // ==========================================================================
  // AUDIT LOGS
  // ==========================================================================
  console.log('Creating audit logs...')

  await prisma.auditLog.create({
    data: {
      action: 'CREATE',
      entityType: 'AccessGrant',
      entityId: 'grant_kp_genii',
      actorId: bobGP.id,
      organizationId: kleinerPerkins.id,
      details: {
        grantee: 'Genii Admin Services',
        capabilities: ['canPublish', 'canViewData', 'canManageSubscriptions'],
      },
      createdAt: new Date('2024-01-15T10:00:00Z'),
    },
  })

  await prisma.auditLog.create({
    data: {
      action: 'PUBLISH',
      entityType: 'Envelope',
      entityId: 'env_cc_001',
      actorId: geniiPublisher.id,
      organizationId: geniiAdmin.id,
      details: {
        type: 'CAPITAL_CALL',
        asset: 'KP Fund XXI',
        amount: 25000000,
      },
      createdAt: new Date('2024-10-15T10:00:00Z'),
    },
  })

  await prisma.auditLog.create({
    data: {
      action: 'CORRECT',
      entityType: 'Envelope',
      entityId: 'env_cc_001_v2',
      actorId: geniiPublisher.id,
      organizationId: geniiAdmin.id,
      details: {
        originalEnvelopeId: 'env_cc_001',
        reason: 'Due date extension',
      },
      createdAt: new Date('2024-10-16T11:00:00Z'),
    },
  })

  await prisma.auditLog.create({
    data: {
      action: 'VIEW',
      entityType: 'Envelope',
      entityId: 'env_cc_001_v2',
      actorId: charlieLP.id,
      organizationId: ohioPension.id,
      details: {
        action: 'Read receipt recorded',
      },
      createdAt: new Date('2024-10-16T12:30:00Z'),
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log('')
  console.log('📋 Demo Personas:')
  console.log('  - Alice Admin (Platform Admin: Waypoint Coop)')
  console.log('  - Bob GP (Asset Manager: Kleiner Perkins)')
  console.log('  - Genii Publisher (Delegate: Genii Admin Services)')
  console.log('  - Charlie LP (Limited Partner: State of Ohio Pension)')
  console.log('  - Dana Delegate (Auditor: Deloitte)')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

