import { prisma } from '~/server/utils/prisma'

/** GET /api/vendor — returns all APPROVED vendors */
export default defineEventHandler(async () => {
  return prisma.vendor.findMany({
    where: { vendorStatus: 'APPROVED' },
    orderBy: { vendorName: 'asc' },
  })
})
