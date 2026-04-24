import { prisma } from '~/server/utils/prisma'

/** POST /api/orders — create a new order for a request (admin) */
export default defineEventHandler(async event => {
  if (event.context.role !== 1) throw createError({ statusCode: 403, message: 'Admin only' })

  const { dateOrdered, orderNumber, orderDetails, trackingInfo, shippingCost, requestID } =
    await readBody(event)

  return prisma.order.create({
    data: {
      dateOrdered: new Date(dateOrdered),
      orderNumber,
      orderDetails,
      trackingInfo,
      shippingCost: Number(shippingCost),
      requestID: Number(requestID),
      adminID: event.context.user.id,
    },
  })
})
