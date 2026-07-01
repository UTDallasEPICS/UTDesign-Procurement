import { ROLES } from '~/shared/constants/roles'
import { prisma } from '~/server/utils/prisma'

/** DELETE /api/orders/delete */
export default defineEventHandler(async event => {
  if (event.context.role !== ROLES.ADMIN) throw createError({ statusCode: 403, message: 'Admin only' })
  try {
    const { orderID } = await readBody(event)
    return prisma.order.delete({ where: { orderID: Number(orderID) } })
  } catch (err: unknown) {
    if ((err as { statusCode?: number }).statusCode) throw err
    throw createError({ statusCode: 500, message: 'Internal server error' })
  }
})
