import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      emailVerified: true,
      image: true,
    },
  })

  // Return image as boolean (true = has image) to avoid exposing file paths
  const redacted = users.map((user) => ({
    ...user,
    image: user.image != null,
  }))

  return redacted
})
