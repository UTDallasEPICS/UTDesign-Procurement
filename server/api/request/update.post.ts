import { ROLES } from '~/shared/constants/roles'
import { prisma } from '~/server/utils/prisma'
import { recalcProjectExpenses } from '~/server/utils/budget'

/** POST /api/request/update — admin edits request items, orders, and process status */
export default defineEventHandler(async event => {
  if (event.context.role !== ROLES.ADMIN) throw createError({ statusCode: 403, message: 'Admin only' })

  try {
    const { requestID, projectID, items, orders, processID, status } = await readBody(event)
    const user = event.context.user

    await prisma.$transaction(async tx => {
      if (items?.length) {
        await Promise.all(
          items.map((item: { itemID: number; description: string; justification?: string; url: string; partNumber: string; quantity: number; unitPrice: number; category?: string; otherCategoryDescription?: string | null; vendorID: number }) =>
            tx.requestItem.update({
              where: { itemID: item.itemID },
              data: {
                description: item.description,
                ...(item.justification ? { justification: item.justification } : {}),
                url: item.url,
                partNumber: item.partNumber,
                quantity: Number(item.quantity),
                unitPrice: Number(item.unitPrice),
                ...(item.category ? { category: item.category, otherCategoryDescription: item.otherCategoryDescription ?? null } : {}),
                vendorID: item.vendorID,
              },
            }),
          ),
        )
      }

      if (orders?.length) {
        await Promise.all(
          orders.map((order: { orderID?: number; dateOrdered: string; orderNumber: string; orderDetails: string; trackingInfo: string; shippingCost: number }) =>
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

      if (processID && status) {
        await tx.process.update({
          where: { processID },
          data: { status, adminProcessed: new Date(), adminID: user.id },
        })
      }
    })

    await recalcProjectExpenses(prisma, projectID)
    return { ok: true }
  } catch (err: unknown) {
    if ((err as { statusCode?: number }).statusCode) throw err
    throw createError({ statusCode: 500, message: 'Internal server error' })
  }
})
