import { prisma } from '~/server/utils/prisma'

/** POST /api/orders — create a new order for a request (admin only) */
export default defineEventHandler(async event => {
  if (event.context.role !== 'ADMIN') throw createError({ statusCode: 403, message: 'Admin only' })

  try {
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
  } catch (err: unknown) {
    if ((err as { statusCode?: number }).statusCode) throw err
    throw createError({ statusCode: 500, message: 'Internal server error' })
  }
})
