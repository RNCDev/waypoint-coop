import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join } from 'path'
import { existsSync } from 'fs'

const prisma = new PrismaClient()

/**
 * Seed Images Script
 * 
 * This script uploads images for organizations and users from the seed-images directory.
 * Run this AFTER running the main seed.ts script.
 * 
 * Usage:
 *   tsx prisma/seed-images.ts
 * 
 * Directory structure:
 *   prisma/seed-images/
 *     organizations/
 *       org_waypoint.png
 *       org_ohio.jpg
 *       ...
 *     users/
 *       user_alice.jpeg
 *       user_bob.png
 *       ...
 */

interface ImageMapping {
  organizationId?: string
  userId?: string
  filename: string
  mimeType: string
}

// Map filenames to entity IDs
const ORGANIZATION_IMAGES: ImageMapping[] = [
  { organizationId: 'org_waypoint', filename: 'org_waypoint.png', mimeType: 'image/png' },
  { organizationId: 'org_kp', filename: 'org_kp.jpg', mimeType: 'image/jpeg' },
  { organizationId: 'org_ohio', filename: 'org_ohio.png', mimeType: 'image/png' },
  { organizationId: 'org_deloitte', filename: 'org_deloitte.png', mimeType: 'image/png' },
  { organizationId: 'org_genii', filename: 'org_genii.png', mimeType: 'image/png' },
]

const USER_IMAGES: ImageMapping[] = [
  { userId: 'user_alice', filename: 'user_alice.jpeg', mimeType: 'image/jpeg' },
  { userId: 'user_charlie', filename: 'user_charlie.jpeg', mimeType: 'image/jpeg' },
  { userId: 'user_bob', filename: 'user_bob.jpeg', mimeType: 'image/jpeg' },
  { userId: 'user_dana', filename: 'user_dana.webp', mimeType: 'image/webp' },
]

function detectMimeType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop()
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
  }
  return mimeTypes[ext || ''] || 'image/jpeg'
}

async function seedImages() {
  console.log('🖼️  Seeding images...')
  console.log('')

  const seedImagesDir = join(process.cwd(), 'prisma', 'seed-images')
  const orgImagesDir = join(seedImagesDir, 'organizations')
  const userImagesDir = join(seedImagesDir, 'users')

  // Check if directories exist
  if (!existsSync(orgImagesDir) && !existsSync(userImagesDir)) {
    console.log('⚠️  No seed-images directory found.')
    console.log('   Create prisma/seed-images/organizations/ and prisma/seed-images/users/')
    console.log('   Add your image files and update the mappings in seed-images.ts')
    console.log('')
    return
  }

  let orgCount = 0
  let userCount = 0
  let errorCount = 0

  // Process organization images
  if (existsSync(orgImagesDir) && ORGANIZATION_IMAGES.length > 0) {
    console.log('📁 Processing organization images...')
    for (const mapping of ORGANIZATION_IMAGES) {
      try {
        const filePath = join(orgImagesDir, mapping.filename)
        
        if (!existsSync(filePath)) {
          console.log(`   ⚠️  File not found: ${mapping.filename}`)
          errorCount++
          continue
        }

        const imageBuffer = readFileSync(filePath)
        const mimeType = mapping.mimeType || detectMimeType(mapping.filename)

        await prisma.organization.update({
          where: { id: mapping.organizationId! },
          data: {
            imageData: imageBuffer,
            imageMime: mimeType,
          },
        })

        console.log(`   ✅ Uploaded: ${mapping.filename} → ${mapping.organizationId}`)
        orgCount++
      } catch (error) {
        console.error(`   ❌ Error uploading ${mapping.filename}:`, error)
        errorCount++
      }
    }
  }

  // Process user images
  if (existsSync(userImagesDir) && USER_IMAGES.length > 0) {
    console.log('')
    console.log('👤 Processing user images...')
    for (const mapping of USER_IMAGES) {
      try {
        const filePath = join(userImagesDir, mapping.filename)
        
        if (!existsSync(filePath)) {
          console.log(`   ⚠️  File not found: ${mapping.filename}`)
          errorCount++
          continue
        }

        const imageBuffer = readFileSync(filePath)
        const mimeType = mapping.mimeType || detectMimeType(mapping.filename)

        await prisma.user.update({
          where: { id: mapping.userId! },
          data: {
            pictureData: imageBuffer,
            pictureMime: mimeType,
          },
        })

        console.log(`   ✅ Uploaded: ${mapping.filename} → ${mapping.userId}`)
        userCount++
      } catch (error) {
        console.error(`   ❌ Error uploading ${mapping.filename}:`, error)
        errorCount++
      }
    }
  }

  console.log('')
  if (orgCount === 0 && userCount === 0) {
    console.log('ℹ️  No images to upload.')
    console.log('   Add image mappings to ORGANIZATION_IMAGES and USER_IMAGES arrays in seed-images.ts')
  } else {
    console.log(`✅ Image seeding complete!`)
    console.log(`   Organizations: ${orgCount}`)
    console.log(`   Users: ${userCount}`)
    if (errorCount > 0) {
      console.log(`   Errors: ${errorCount}`)
    }
  }
  console.log('')
}

seedImages()
  .catch((e) => {
    console.error('❌ Image seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

