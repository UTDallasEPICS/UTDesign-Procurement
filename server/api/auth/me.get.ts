import { auth } from '~/server/lib/auth'
import { prisma } from '~/server/utils/prisma'

/** GET /api/auth/me — returns session user with their role enum value */
export default defineEventHandler(async event => {
  const session = await auth.api.getSession({ headers: event.headers })

  if (!session?.user) return null

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user || !user.active) return null

  return {
    user: {
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      netID: user.netID,
    },
    role: user.role,
  }
})
