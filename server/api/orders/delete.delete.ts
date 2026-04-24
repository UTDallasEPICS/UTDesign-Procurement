import { prisma } from '~/server/utils/prisma'

/** DELETE /api/orders/delete */
export default defineEventHandler(async event => {
  if (event.context.role !== 1) throw createError({ statusCode: 403, message: 'Admin only' })
  const { orderID } = await readBody(event)
  return prisma.order.delete({ where: { orderID: Number(orderID) } })
})
