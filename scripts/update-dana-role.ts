import { PrismaClient, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const updated = await prisma.user.update({
    where: { id: 'user_dana' },
    data: { role: UserRole.ADMIN },
  })
  
  console.log('✓ Updated Dana Delegate role to ADMIN')
  console.log('User:', updated.name, '- Role:', updated.role)
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

