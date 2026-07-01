import { ROLES } from '~/shared/constants/roles'
import { prisma } from '~/server/utils/prisma'

/** POST /api/vendor/updateStatus — admin changes vendor approval status */
export default defineEventHandler(async event => {
  if (event.context.role !== ROLES.ADMIN) throw createError({ statusCode: 403, message: 'Admin only' })

  try {
    const { vendorID, status } = await readBody(event)
    if (!['APPROVED', 'PENDING', 'DENIED'].includes(status)) {
      throw createError({ statusCode: 400, message: 'Invalid status' })
    }
    return prisma.vendor.update({
      where: { vendorID: Number(vendorID) },
      data: { vendorStatus: status },
    })
  } catch (err: unknown) {
    if ((err as { statusCode?: number }).statusCode) throw err
    throw createError({ statusCode: 500, message: 'Internal server error' })
  }
})
