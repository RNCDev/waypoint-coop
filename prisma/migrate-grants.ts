import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Migration script to convert legacy single-asset grants to multi-asset grants
 * using the new AccessGrantAsset junction table.
 * 
 * This script:
 * 1. Finds all grants with non-null assetId (legacy format)
 * 2. Creates AccessGrantAsset entries for each
 * 3. Reports on migration status
 */
async function main() {
  console.log('🔄 Starting grant migration...')

  // Find all grants with legacy assetId
  const legacyGrants = await prisma.accessGrant.findMany({
    where: {
      assetId: { not: null },
    },
    select: {
      id: true,
      assetId: true,
      grantAssets: {
        select: { id: true },
      },
    },
  })

  console.log(`Found ${legacyGrants.length} grants with legacy assetId`)

  let migrated = 0
  let skipped = 0

  for (const grant of legacyGrants) {
    // Skip if already has grantAssets entries
    if (grant.grantAssets.length > 0) {
      console.log(`  Skipping grant ${grant.id} - already has grantAssets`)
      skipped++
      continue
    }

    // Create AccessGrantAsset entry
    try {
      await prisma.accessGrantAsset.create({
        data: {
          grantId: grant.id,
          assetId: grant.assetId!,
        },
      })
      migrated++
      console.log(`  ✓ Migrated grant ${grant.id} -> asset ${grant.assetId}`)
    } catch (error) {
      console.error(`  ✗ Failed to migrate grant ${grant.id}:`, error)
    }
  }

  console.log('')
  console.log('📊 Migration Summary:')
  console.log(`  Total legacy grants: ${legacyGrants.length}`)
  console.log(`  Migrated: ${migrated}`)
  console.log(`  Skipped (already migrated): ${skipped}`)
  console.log('')
  console.log('✅ Migration complete!')
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

