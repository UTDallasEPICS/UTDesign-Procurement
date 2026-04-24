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

  const redacted = users.map((user) => {
    return {
      ...user,
      image: user.image != null,
    }
  })

  return redacted
})
