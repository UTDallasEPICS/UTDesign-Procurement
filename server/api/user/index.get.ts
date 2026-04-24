import { prisma } from '~/server/utils/prisma'

/** GET /api/user — all users (admin only) */
export default defineEventHandler(async event => {
  if (event.context.role !== 1) throw createError({ statusCode: 403, message: 'Admin only' })
  return prisma.user.findMany({
    include: { role: true },
    orderBy: { lastName: 'asc' },
  })
})
