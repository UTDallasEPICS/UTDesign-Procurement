import { prisma } from '~/server/utils/prisma'

/** POST /api/vendor/updateStatus — admin changes vendor status */
export default defineEventHandler(async event => {
  if (event.context.role !== 1) throw createError({ statusCode: 403, message: 'Admin only' })

  const { vendorID, status } = await readBody(event)
  if (!['APPROVED', 'PENDING', 'DENIED'].includes(status)) {
    throw createError({ statusCode: 400, message: 'Invalid status' })
  }

  return prisma.vendor.update({
    where: { vendorID: Number(vendorID) },
    data: { vendorStatus: status },
  })
})
