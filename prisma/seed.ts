import { prisma } from '../server/utils/prisma'

async function main() {
  console.log('Start seeding...')

  const user1 = await prisma.user.upsert({
    where: { email: 'email@example.com' },
    update: {},
    create: {
      name: 'Test User',
      email: 'email@example.com',
    },
  })

  console.log({ user1 })
  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
