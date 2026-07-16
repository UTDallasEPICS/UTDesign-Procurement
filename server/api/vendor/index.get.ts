import prisma from '~~/server/utils/prisma'

/** GET /api/vendor — returns all APPROVED vendors */
export default defineEventHandler(async () => {
  try {
    return prisma.vendor.findMany({
      where: { vendorStatus: 'APPROVED' },
      orderBy: { vendorName: 'asc' },
    })
  } catch {
    throw createError({ statusCode: 500, message: 'Internal server error' })
  }
})
