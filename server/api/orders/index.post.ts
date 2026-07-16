import prisma from '~~/server/utils/prisma'
import { calcRequestExpense, recalcProjectExpenses } from '~~/server/utils/budget'
import { ROLES } from '~~/shared/constants/roles'

/** POST /api/orders — create a new order for a request (admin only). Shipping cost counts toward the project budget. */
export default defineEventHandler(async event => {
  if (event.context.role !== ROLES.ADMIN) throw createError({ statusCode: 403, message: 'Admin only' })

  try {
    const { dateOrdered, orderNumber, orderDetails, trackingInfo, shippingCost, requestID } =
      await readBody(event)

    const request = await prisma.request.findUnique({ where: { requestID: Number(requestID) } })
    if (!request) throw createError({ statusCode: 404, message: 'Request not found' })

    const order = await prisma.order.create({
      data: {
        dateOrdered: new Date(dateOrdered),
        orderNumber,
        orderDetails: orderDetails ?? '',
        trackingInfo: trackingInfo ?? '',
        shippingCost: Number(shippingCost) || 0,
        requestID: Number(requestID),
        adminID: event.context.user.id,
      },
    })

    // Sync the request's stored expense and the project's totals to include shipping
    const expense = await calcRequestExpense(prisma, request.requestID)
    await prisma.request.update({
      where: { requestID: request.requestID },
      data: { expense: Math.round(expense) },
    })
    await recalcProjectExpenses(prisma, request.projectID)

    return order
  } catch (err: unknown) {
    if ((err as { statusCode?: number }).statusCode) throw err
    throw createError({ statusCode: 500, message: 'Internal server error' })
  }
})
