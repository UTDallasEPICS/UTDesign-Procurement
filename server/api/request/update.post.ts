import { prisma } from '~/server/utils/prisma'
import { recalcProjectExpenses } from '~/server/utils/budget'

/**
 * POST /api/request/update
 * Admin updates request items, orders, other expenses, and process status.
 */
export default defineEventHandler(async event => {
  const user = event.context.user
  if (user.roleID !== 1) throw createError({ statusCode: 403, message: 'Admin only' })

  const body = await readBody(event)
  const { requestID, projectID, items, orders, processID, status, otherExpenses } = body

  await prisma.$transaction(async tx => {
    // Update each item
    if (items?.length) {
      await Promise.all(
        items.map((item: any) =>
          tx.requestItem.update({
            where: { itemID: item.itemID },
            data: {
              description: item.description,
              url: item.url,
              partNumber: item.partNumber,
              quantity: Number(item.quantity),
              unitPrice: Number(item.unitPrice),
              vendorID: item.vendorID,
            },
          }),
        ),
      )
    }

    // Update each order
    if (orders?.length) {
      await Promise.all(
        orders.map((order: any) =>
          order.orderID
            ? tx.order.update({
                where: { orderID: order.orderID },
                data: {
                  dateOrdered: new Date(order.dateOrdered),
                  orderNumber: order.orderNumber,
                  orderDetails: order.orderDetails,
                  trackingInfo: order.trackingInfo,
                  shippingCost: Number(order.shippingCost),
                },
              })
            : tx.order.create({
                data: {
                  dateOrdered: new Date(order.dateOrdered),
                  orderNumber: order.orderNumber,
                  orderDetails: order.orderDetails,
                  trackingInfo: order.trackingInfo,
                  shippingCost: Number(order.shippingCost),
                  requestID,
                  adminID: user.id,
                },
              }),
        ),
      )
    }

    // Update process status
    if (processID && status) {
      await tx.process.update({
        where: { processID },
        data: {
          status,
          adminProcessed: new Date(),
          adminID: user.id,
        },
      })
    }
  })

  // Recalculate project expenses after edits
  await recalcProjectExpenses(prisma, projectID)

  return { ok: true }
})
