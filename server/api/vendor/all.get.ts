import { prisma } from '~/server/utils/prisma'

/** GET /api/vendor/all — returns all vendors (admin only) */
export default defineEventHandler(async event => {
  if (event.context.role !== 'ADMIN') throw createError({ statusCode: 403, message: 'Admin only' })
  try {
    return prisma.vendor.findMany({ orderBy: { vendorName: 'asc' } })
  } catch {
    throw createError({ statusCode: 500, message: 'Internal server error' })
  }
})
