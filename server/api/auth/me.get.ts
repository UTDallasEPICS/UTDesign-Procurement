import { auth } from '~/server/lib/auth'
import { prisma } from '~/server/utils/prisma'

/**
 * GET /api/auth/me
 * Returns the current session user with their roleID.
 * Called by the useAuth() composable to hydrate client state.
 */
export default defineEventHandler(async event => {
  const session = await auth.api.getSession({ headers: event.headers })

  if (!session?.user) return null

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { role: true },
  })

  if (!user || !user.active) return null

  return {
    user: {
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      netID: user.netID,
    },
    roleID: user.roleID,
    role: user.role.role,
  }
})
