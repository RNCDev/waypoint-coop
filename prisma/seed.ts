import { PrismaClient, GrantStatus, SubscriptionStatus, AccessLevel, DataArtifact, UserRole } from '@prisma/client'
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
  await prisma.dataPacket.deleteMany()
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
      type: 'PLATFORM_ADMIN',
      lei: 'WAYPOINT000000000001',
      narrative: 'Building the open infrastructure for private markets. Our cooperative model ensures that the benefits of network effects flow back to the participants who create them.',
      imageUrl: '/waypoint-logo-blue.svg',
    },
  })

  // GPs / Asset Managers
  const kleinerPerkins = await prisma.organization.create({
    data: {
      id: 'org_kp',
      name: 'Kleiner Perkins',
      type: 'GP',
      lei: 'KP00000000000000001',
      narrative: 'For over 50 years, Kleiner Perkins has partnered with some of the most ingenious founders in technology and life sciences. We invest at the earliest stages and help build iconic companies.',
    },
  })

  const costanoaVentures = await prisma.organization.create({
    data: {
      id: 'org_costanoa',
      name: 'Costanoa Ventures',
      type: 'GP',
      lei: 'COSTANOA0000000001',
      narrative: 'Early-stage venture capital focused on B2B enterprise software. We back founders who are building the next generation of enterprise infrastructure.',
    },
  })

  const franklinPark = await prisma.organization.create({
    data: {
      id: 'org_fp',
      name: 'Franklin Park',
      type: 'GP', // Also acts as LP in some funds
      lei: 'FP00000000000000001',
      narrative: 'Private equity investment manager providing innovative fund solutions to institutional investors worldwide.',
    },
  })

  // LPs / Investors
  const ohioPension = await prisma.organization.create({
    data: {
      id: 'org_ohio',
      name: 'State of Ohio Pension',
      type: 'LP',
      lei: 'OHIO00000000000001',
      narrative: 'Serving over 1.5 million members, we are committed to securing retirement benefits for Ohio public employees through prudent investment management.',
      imageUrl: '/opers-bg.jpg',
    },
  })

  const calpers = await prisma.organization.create({
    data: {
      id: 'org_calpers',
      name: 'CalPERS',
      type: 'LP',
      lei: 'CALPERS000000000001',
      narrative: 'The largest public pension fund in the United States, managing retirement and health benefits for California public employees.',
    },
  })

  const harvardEndowment = await prisma.organization.create({
    data: {
      id: 'org_harvard',
      name: 'Harvard Management Company',
      type: 'LP',
      lei: 'HARVARD000000000001',
      narrative: 'Managing the Harvard University endowment with a long-term investment strategy to support the university mission in perpetuity.',
    },
  })

  // Fund Admin
  const geniiAdmin = await prisma.organization.create({
    data: {
      id: 'org_genii',
      name: 'Genii Admin Services',
      type: 'FUND_ADMIN',
      lei: 'GENII0000000000001',
      narrative: 'Comprehensive fund administration services for private equity and venture capital funds. Trusted by leading GPs worldwide.',
    },
  })

  // Auditor
  const deloitte = await prisma.organization.create({
    data: {
      id: 'org_deloitte',
      name: 'Deloitte',
      type: 'AUDITOR',
      lei: 'DELOITTE00000000001',
      narrative: 'Global professional services firm providing audit, consulting, tax, and advisory services to leading organizations.',
    },
  })

  // Consultant
  const mercer = await prisma.organization.create({
    data: {
      id: 'org_mercer',
      name: 'Mercer',
      type: 'CONSULTANT',
      lei: 'MERCER0000000000001',
      narrative: 'Leading investment consulting firm helping institutional investors achieve their long-term investment goals.',
    },
  })

  // Tax Advisor
  const pwc = await prisma.organization.create({
    data: {
      id: 'org_pwc',
      name: 'PwC',
      type: 'TAX_ADVISOR',
      lei: 'PWC0000000000000001',
      narrative: 'Providing tax advisory and compliance services to private equity funds and their investors globally.',
    },
  })

  // Additional LPs for temporal scenarios
  const michiganPension = await prisma.organization.create({
    data: {
      id: 'org_michigan',
      name: 'Michigan State Pension',
      type: 'LP',
      lei: 'MICHIGAN000000000001',
      narrative: 'Managing retirement assets for Michigan public employees with a focus on long-term value creation.',
    },
  })

  const yaleEndowment = await prisma.organization.create({
    data: {
      id: 'org_yale',
      name: 'Yale Endowment',
      type: 'LP',
      lei: 'YALE00000000000001',
      narrative: 'Yale University endowment known for pioneering the endowment model of investing.',
    },
  })

  // New organization type example - Crypto Fund (demonstrates extensibility)
  const cryptoFund = await prisma.organization.create({
    data: {
      id: 'org_crypto',
      name: 'Blockchain Ventures',
      type: 'CRYPTO_FUND',
      lei: 'CRYPTO0000000000001',
      narrative: 'Digital asset investment fund specializing in blockchain infrastructure and DeFi protocols.',
    },
  })

  // Additional consultants for grant chains
  const cambridgeAssociates = await prisma.organization.create({
    data: {
      id: 'org_cambridge',
      name: 'Cambridge Associates',
      type: 'CONSULTANT',
      lei: 'CAMBRIDGE000000001',
      narrative: 'Investment consulting and outsourced CIO services for institutional investors.',
    },
  })

  // New fund admin for publisher transfer scenario
  const ssAdmin = await prisma.organization.create({
    data: {
      id: 'org_ss',
      name: 'SS&C Admin',
      type: 'FUND_ADMIN',
      lei: 'SSC0000000000000001',
      narrative: 'Leading provider of fund administration and accounting services for alternative investment managers.',
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
      narrative: 'Platform Operations Lead at Waypoint. Passionate about building infrastructure that makes private markets more accessible and transparent.',
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
      narrative: 'Partner at Kleiner Perkins focused on enterprise software and fintech investments. Previously led product at Stripe.',
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
      narrative: 'Senior Fund Administrator managing reporting and investor communications for top-tier VC funds.',
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
      narrative: 'Private Markets Investment Officer overseeing venture capital and private equity allocations for Ohio public employees.',
    },
  })

  // Auditor user (Delegate)
  const danaDelegate = await prisma.user.create({
    data: {
      id: 'user_dana',
      name: 'Dana Delegate',
      email: 'dana@deloitte.com',
      organizationId: deloitte.id,
      role: UserRole.ADMIN,
      narrative: 'Senior Auditor specializing in private equity fund audits and SEC compliance reviews.',
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
      narrative: 'General Partner at Costanoa Ventures with a focus on data infrastructure and developer tools.',
    },
  })

  await prisma.user.create({
    data: {
      id: 'user_calpers',
      name: 'Mike CalPERS',
      email: 'mike@calpers.ca.gov',
      organizationId: calpers.id,
      role: UserRole.ADMIN,
      narrative: 'Managing Investment Director leading CalPERS private equity portfolio strategy.',
    },
  })

  await prisma.user.create({
    data: {
      id: 'user_michigan',
      name: 'Sarah Michigan',
      email: 'sarah@michigan.gov',
      organizationId: michiganPension.id,
      role: UserRole.ADMIN,
      narrative: 'Chief Investment Officer at Michigan State Pension overseeing alternative investments.',
    },
  })

  await prisma.user.create({
    data: {
      id: 'user_yale',
      name: 'David Yale',
      email: 'david@yale.edu',
      organizationId: yaleEndowment.id,
      role: UserRole.ADMIN,
      narrative: 'Senior Investment Director managing venture capital and private equity allocations.',
    },
  })

  await prisma.user.create({
    data: {
      id: 'user_cambridge',
      name: 'Emily Cambridge',
      email: 'emily@cambridgeassociates.com',
      organizationId: cambridgeAssociates.id,
      role: UserRole.ADMIN,
      narrative: 'Senior Consultant advising institutional investors on private market strategies.',
    },
  })

  await prisma.user.create({
    data: {
      id: 'user_ss',
      name: 'Robert SS&C',
      email: 'robert@ssctech.com',
      organizationId: ssAdmin.id,
      role: UserRole.ADMIN,
      narrative: 'Fund Administrator managing reporting for multiple venture capital funds.',
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
      type: 'FIRM',
      managerId: kleinerPerkins.id,
    },
  })

  const kpFund21 = await prisma.asset.create({
    data: {
      id: 'asset_kp21',
      name: 'KP Fund XXI',
      type: 'FUND',
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
      type: 'FUND',
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
      type: 'FIRM',
      managerId: costanoaVentures.id,
    },
  })

  const costanoaFund6 = await prisma.asset.create({
    data: {
      id: 'asset_costanoa6',
      name: 'Costanoa Fund VI',
      type: 'FUND',
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
      type: 'FIRM',
      managerId: franklinPark.id,
    },
  })

  const fpVentureXV = await prisma.asset.create({
    data: {
      id: 'asset_fp15',
      name: 'FP Venture XV',
      type: 'FUND',
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
      type: 'SPV',
      managerId: kleinerPerkins.id,
      parentId: kpFund21.id,
    },
  })

  // ==========================================================================
  // SUBSCRIPTIONS
  // ==========================================================================
  console.log('Creating subscriptions...')

  // Current active subscriptions
  // Ohio Pension subscriptions
  await prisma.subscription.create({
    data: {
      assetId: kpFund21.id,
      subscriberId: ohioPension.id,
      status: SubscriptionStatus.ACTIVE,
      accessLevel: AccessLevel.FULL,
      commitment: 50000000, // $50M
      validFrom: new Date('2023-01-15'),
    },
  })

  await prisma.subscription.create({
    data: {
      assetId: costanoaFund6.id,
      subscriberId: ohioPension.id,
      status: SubscriptionStatus.ACTIVE,
      accessLevel: AccessLevel.FULL,
      commitment: 25000000, // $25M
      validFrom: new Date('2022-06-01'),
    },
  })

  // TEMPORAL SCENARIO 1: CalPERS transferred part of KP Fund XXI to Michigan Pension
  // Historical subscription: CalPERS held position from 2023-01 to 2024-07 (3 months ago)
  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
  
  await prisma.subscription.create({
    data: {
      assetId: kpFund21.id,
      subscriberId: calpers.id,
      status: SubscriptionStatus.CLOSED,
      accessLevel: AccessLevel.FULL,
      commitment: 100000000, // $100M
      validFrom: new Date('2023-01-15'),
      validTo: threeMonthsAgo, // Transferred 3 months ago
    },
  })

  // New subscription: Michigan Pension took over position from CalPERS
  await prisma.subscription.create({
    data: {
      assetId: kpFund21.id,
      subscriberId: michiganPension.id,
      status: SubscriptionStatus.ACTIVE,
      accessLevel: AccessLevel.FULL,
      commitment: 100000000, // $100M (same amount transferred)
      validFrom: threeMonthsAgo, // Started when CalPERS ended
    },
  })

  // CalPERS still has active subscription in KP Fund XX (didn't transfer this one)
  await prisma.subscription.create({
    data: {
      assetId: kpFund20.id,
      subscriberId: calpers.id,
      status: SubscriptionStatus.ACTIVE,
      accessLevel: AccessLevel.FULL,
      commitment: 75000000, // $75M
      validFrom: new Date('2021-08-01'),
    },
  })

  // TEMPORAL SCENARIO 2: Ohio Pension historical position in KP Fund XX (2020-2023)
  await prisma.subscription.create({
    data: {
      assetId: kpFund20.id,
      subscriberId: ohioPension.id,
      status: SubscriptionStatus.CLOSED,
      accessLevel: AccessLevel.FULL,
      commitment: 60000000, // $60M
      validFrom: new Date('2020-03-15'),
      validTo: new Date('2023-12-31'), // Position closed end of 2023
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
      validFrom: new Date('2022-06-01'),
    },
  })

  // Yale new subscription
  await prisma.subscription.create({
    data: {
      assetId: fpVentureXV.id,
      subscriberId: yaleEndowment.id,
      status: SubscriptionStatus.ACTIVE,
      accessLevel: AccessLevel.FULL,
      commitment: 35000000, // $35M
      validFrom: new Date('2024-01-10'),
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
      validFrom: new Date('2022-09-01'),
    },
  })

  // Pending subscription (demonstrates temporal state)
  await prisma.subscription.create({
    data: {
      assetId: kpFund21.id,
      subscriberId: cryptoFund.id,
      status: SubscriptionStatus.PENDING,
      accessLevel: AccessLevel.FULL,
      commitment: 20000000, // $20M
      validFrom: new Date(), // Will start when approved
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

  // PUBLISHER TRANSFER SCENARIO: KP Fund XX switched from Genii to SS&C
  // Old admin's grant expired
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
  
  await prisma.accessGrant.create({
    data: {
      id: 'grant_kp_genii_20_expired',
      grantorId: kleinerPerkins.id,
      granteeId: geniiAdmin.id,
      assetId: kpFund20.id,
      status: GrantStatus.EXPIRED,
      canPublish: true,
      canViewData: true,
      canManageSubscriptions: true,
      canApproveDelegations: false,
      approvedBy: bobGP.id,
      approvedAt: new Date('2021-08-01'),
      expiresAt: oneYearAgo, // Expired 1 year ago
    },
  })

  // New admin's grant is active
  await prisma.accessGrant.create({
    data: {
      id: 'grant_kp_ss_20',
      grantorId: kleinerPerkins.id,
      granteeId: ssAdmin.id,
      assetId: kpFund20.id,
      status: GrantStatus.ACTIVE,
      canPublish: true,
      canViewData: true,
      canManageSubscriptions: true,
      canApproveDelegations: false,
      approvedBy: bobGP.id,
      approvedAt: oneYearAgo, // Started when old admin ended
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

  // CHAIN OF TRUST SCENARIO 1: CalPERS old grant (chain broken - subscription ended)
  // This grant is still ACTIVE but will fail permission checks due to broken chain
  await prisma.accessGrant.create({
    data: {
      id: 'grant_calpers_cambridge_broken',
      grantorId: calpers.id,
      granteeId: cambridgeAssociates.id,
      assetId: kpFund21.id,
      status: GrantStatus.ACTIVE, // Status remains ACTIVE for audit trail
      canPublish: false,
      canViewData: true,
      canManageSubscriptions: false,
      canApproveDelegations: false,
      approvedBy: bobGP.id, // GP approved this LP delegation
      approvedAt: new Date('2023-02-01'),
      validFrom: new Date('2023-02-01'),
    },
  })

  // CHAIN OF TRUST SCENARIO 2: Michigan Pension new grant (valid chain)
  await prisma.accessGrant.create({
    data: {
      id: 'grant_michigan_cambridge',
      grantorId: michiganPension.id,
      granteeId: cambridgeAssociates.id,
      assetId: kpFund21.id,
      status: GrantStatus.ACTIVE,
      canPublish: false,
      canViewData: true,
      canManageSubscriptions: false,
      canApproveDelegations: false,
      approvedBy: bobGP.id,
      approvedAt: threeMonthsAgo,
      validFrom: threeMonthsAgo, // Started when they got subscription
    },
  })

  // LP -> Consultant delegation (Ohio grants to Mercer) - Valid chain
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
      approvedAt: new Date('2023-03-01'),
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

  // Costanoa -> Genii delegation
  await prisma.accessGrant.create({
    data: {
      id: 'grant_costanoa_genii',
      grantorId: costanoaVentures.id,
      granteeId: geniiAdmin.id,
      assetId: costanoaFund6.id,
      status: GrantStatus.ACTIVE,
      canPublish: true,
      canViewData: true,
      canManageSubscriptions: true,
      canApproveDelegations: false,
      approvedBy: 'user_costanoa',
      approvedAt: new Date('2022-06-01'),
    },
  })

  // ==========================================================================
  // DATA PACKETS
  // ==========================================================================
  console.log('Creating data packets...')

  // Capital Call - KP Fund XXI (published by Genii)
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
  const dataPacket1 = await prisma.dataPacket.create({
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

  // Distribution - KP Fund XX (published by NEW admin SS&C)
  const distributionPayload = {
    fundName: 'KP Fund XX',
    distributionNumber: 5,
    distributionDate: '2024-09-30',
    totalDistribution: 75000000,
    type: 'Partial Exit',
    portfolioCompany: 'FinTech Solutions',
    notes: 'Proceeds from secondary sale',
  }
  await prisma.dataPacket.create({
    data: {
      id: 'env_dist_001',
      type: DataArtifact.DISTRIBUTION,
      payload: distributionPayload,
      hash: generateHash(distributionPayload),
      version: 1,
      publisherId: ssAdmin.id, // NEW PUBLISHER for KP Fund XX
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
  await prisma.dataPacket.create({
    data: {
      id: 'env_fin_001',
      type: DataArtifact.FINANCIAL_STATEMENT,
      payload: financialPayload,
      hash: generateHash(financialPayload),
      version: 1,
      publisherId: geniiAdmin.id, // Genii also handles Costanoa
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
  await prisma.dataPacket.create({
    data: {
      id: 'env_cc_001_v2',
      type: DataArtifact.CAPITAL_CALL,
      payload: correctedCapitalCallPayload,
      hash: generateHash(correctedCapitalCallPayload),
      version: 2,
      parentId: dataPacket1.id,
      publisherId: geniiAdmin.id,
      assetId: kpFund21.id,
      createdAt: new Date('2024-10-16T11:00:00Z'),
    },
  })

  // Tax Document - K-1 (published by PwC)
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
  await prisma.dataPacket.create({
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

  // Additional Capital Call - Costanoa Fund VI
  const capitalCallPayload2 = {
    fundName: 'Costanoa Fund VI',
    callNumber: 7,
    callDate: '2024-11-01',
    dueDate: '2024-11-20',
    totalCallAmount: 18500000,
    purpose: 'Follow-on investment in DataCo',
    wireInstructions: {
      bank: 'JPMorgan Chase',
      accountNumber: '****9876',
      routingNumber: '****4321',
    },
  }
  await prisma.dataPacket.create({
    data: {
      id: 'env_cc_002',
      type: DataArtifact.CAPITAL_CALL,
      payload: capitalCallPayload2,
      hash: generateHash(capitalCallPayload2),
      version: 1,
      publisherId: geniiAdmin.id,
      assetId: costanoaFund6.id,
      createdAt: new Date('2024-11-01T09:00:00Z'),
    },
  })

  // Distribution - Costanoa Fund VI
  const distributionPayload2 = {
    fundName: 'Costanoa Fund VI',
    distributionNumber: 3,
    distributionDate: '2024-08-15',
    totalDistribution: 12000000,
    type: 'IPO Proceeds',
    portfolioCompany: 'CloudTech Systems',
    notes: 'Partial liquidation following IPO',
  }
  await prisma.dataPacket.create({
    data: {
      id: 'env_dist_002',
      type: DataArtifact.DISTRIBUTION,
      payload: distributionPayload2,
      hash: generateHash(distributionPayload2),
      version: 1,
      publisherId: geniiAdmin.id,
      assetId: costanoaFund6.id,
      createdAt: new Date('2024-08-15T15:00:00Z'),
    },
  })

  // Financial Statement - KP Fund XX (published by SS&C, new admin)
  const financialPayload2 = {
    fundName: 'KP Fund XX',
    period: 'Q3 2024',
    nav: 520000000,
    contributions: 400000000,
    distributions: 180000000,
    unfundedCommitment: 50000000,
    irr: 0.245,
    tvpi: 1.75,
    dpi: 0.45,
  }
  const dataPacket2 = await prisma.dataPacket.create({
    data: {
      id: 'env_fin_002',
      type: DataArtifact.FINANCIAL_STATEMENT,
      payload: financialPayload2,
      hash: generateHash(financialPayload2),
      version: 1,
      publisherId: ssAdmin.id, // NEW PUBLISHER demonstrating admin change
      assetId: kpFund20.id,
      createdAt: new Date('2024-10-25T10:00:00Z'),
    },
  })

  // Corrected Financial Statement - KP Fund XX (correction by SS&C)
  const correctedFinancialPayload = {
    fundName: 'KP Fund XX',
    period: 'Q3 2024',
    nav: 518000000, // Corrected NAV
    contributions: 400000000,
    distributions: 180000000,
    unfundedCommitment: 50000000,
    irr: 0.243, // Corrected IRR
    tvpi: 1.74,
    dpi: 0.45,
    correctionNote: 'NAV adjustment for portfolio company valuation update',
  }
  await prisma.dataPacket.create({
    data: {
      id: 'env_fin_002_v2',
      type: DataArtifact.FINANCIAL_STATEMENT,
      payload: correctedFinancialPayload,
      hash: generateHash(correctedFinancialPayload),
      version: 2,
      parentId: dataPacket2.id,
      publisherId: ssAdmin.id,
      assetId: kpFund20.id,
      createdAt: new Date('2024-10-26T14:00:00Z'),
    },
  })

  // Legal Document - Side Letter
  const legalPayload = {
    fundName: 'FP Venture XV',
    documentType: 'Side Letter',
    party: 'Yale Endowment',
    effectiveDate: '2024-01-10',
    provisions: [
      'Most Favored Nation clause',
      'Co-investment rights up to $50M',
      'Quarterly reporting requirements',
    ],
  }
  await prisma.dataPacket.create({
    data: {
      id: 'env_legal_001',
      type: DataArtifact.LEGAL_DOCUMENT,
      payload: legalPayload,
      hash: generateHash(legalPayload),
      version: 1,
      publisherId: franklinPark.id, // GP publishes directly
      assetId: fpVentureXV.id,
      createdAt: new Date('2024-01-15T11:00:00Z'),
    },
  })

  // ==========================================================================
  // READ RECEIPTS
  // ==========================================================================
  console.log('Creating read receipts...')

  await prisma.readReceipt.create({
    data: {
      dataPacketId: 'env_cc_001_v2',
      userId: charlieLP.id,
      readAt: new Date('2024-10-16T12:30:00Z'),
    },
  })

  await prisma.readReceipt.create({
    data: {
      dataPacketId: 'env_dist_001',
      userId: charlieLP.id,
      readAt: new Date('2024-10-01T09:15:00Z'),
    },
  })

  await prisma.readReceipt.create({
    data: {
      dataPacketId: 'env_fin_002_v2',
      userId: 'user_calpers',
      readAt: new Date('2024-10-27T08:00:00Z'),
    },
  })

  await prisma.readReceipt.create({
    data: {
      dataPacketId: 'env_cc_002',
      userId: 'user_michigan',
      readAt: new Date('2024-11-01T10:30:00Z'),
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
      entityType: 'DataPacket',
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
      entityType: 'DataPacket',
      entityId: 'env_cc_001_v2',
      actorId: geniiPublisher.id,
      organizationId: geniiAdmin.id,
      details: {
        originalDataPacketId: 'env_cc_001',
        reason: 'Due date extension',
      },
      createdAt: new Date('2024-10-16T11:00:00Z'),
    },
  })

  await prisma.auditLog.create({
    data: {
      action: 'VIEW',
      entityType: 'DataPacket',
      entityId: 'env_cc_001_v2',
      actorId: charlieLP.id,
      organizationId: ohioPension.id,
      details: {
        action: 'Read receipt recorded',
      },
      createdAt: new Date('2024-10-16T12:30:00Z'),
    },
  })

  // LP Transfer audit logs
  await prisma.auditLog.create({
    data: {
      action: 'TRANSFER',
      entityType: 'Subscription',
      entityId: 'sub_calpers_kp21',
      actorId: 'user_calpers',
      organizationId: calpers.id,
      details: {
        asset: 'KP Fund XXI',
        transferTo: 'Michigan State Pension',
        validTo: threeMonthsAgo,
      },
      createdAt: threeMonthsAgo,
    },
  })

  await prisma.auditLog.create({
    data: {
      action: 'CREATE',
      entityType: 'Subscription',
      entityId: 'sub_michigan_kp21',
      actorId: 'user_michigan',
      organizationId: michiganPension.id,
      details: {
        asset: 'KP Fund XXI',
        transferFrom: 'CalPERS',
        commitment: 100000000,
      },
      createdAt: threeMonthsAgo,
    },
  })

  // Publisher change audit logs
  await prisma.auditLog.create({
    data: {
      action: 'EXPIRE',
      entityType: 'AccessGrant',
      entityId: 'grant_kp_genii_20_expired',
      actorId: bobGP.id,
      organizationId: kleinerPerkins.id,
      details: {
        asset: 'KP Fund XX',
        oldPublisher: 'Genii Admin Services',
        reason: 'Administrative transition to SS&C',
      },
      createdAt: oneYearAgo,
    },
  })

  await prisma.auditLog.create({
    data: {
      action: 'CREATE',
      entityType: 'AccessGrant',
      entityId: 'grant_kp_ss_20',
      actorId: bobGP.id,
      organizationId: kleinerPerkins.id,
      details: {
        asset: 'KP Fund XX',
        newPublisher: 'SS&C Admin',
        capabilities: ['canPublish', 'canViewData', 'canManageSubscriptions'],
      },
      createdAt: oneYearAgo,
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
  console.log('  - Sarah Michigan (Limited Partner: Michigan State Pension - NEW)')
  console.log('  - Robert SS&C (Delegate: SS&C Admin - NEW PUBLISHER)')
  console.log('')
  console.log('🔗 Temporal Chain of Trust Scenarios:')
  console.log('  ✅ CalPERS -> Michigan Pension transfer (3 months ago)')
  console.log('  ❌ CalPERS consultant (Cambridge) - BROKEN CHAIN')
  console.log('  ✅ Michigan consultant (Cambridge) - VALID CHAIN')
  console.log('  📝 Publisher change: Genii -> SS&C for KP Fund XX')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

