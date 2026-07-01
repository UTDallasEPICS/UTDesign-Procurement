import { ROLES } from '~/shared/constants/roles'
import { prisma } from '~/server/utils/prisma'

/** GET /api/user — all users (admin only) */
export default defineEventHandler(async event => {
  if (event.context.role !== ROLES.ADMIN) throw createError({ statusCode: 403, message: 'Admin only' })
  try {
    return prisma.user.findMany({ orderBy: { lastName: 'asc' } })
  } catch {
    throw createError({ statusCode: 500, message: 'Internal server error' })
  }
})
