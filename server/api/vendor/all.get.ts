import { prisma } from '~/server/utils/prisma'

/** GET /api/vendor/all — returns all vendors (admin use) */
export default defineEventHandler(async event => {
  if (event.context.role !== 1) throw createError({ statusCode: 403, message: 'Admin only' })
  return prisma.vendor.findMany({ orderBy: { vendorName: 'asc' } })
})
