import { auth } from '../../utils/auth'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const body = await readBody(event)
  const { items, notes } = body

  if (!Array.isArray(items) || items.length === 0) {
    throw createError({ statusCode: 400, message: 'items array is required and must not be empty' })
  }

  for (const item of items) {
    if (!item.productName || !item.productUrl) {
      throw createError({ statusCode: 400, message: 'Each item requires productName and productUrl' })
    }
    if (item.quantity < 1) {
      throw createError({ statusCode: 400, message: 'Quantity must be at least 1' })
    }
  }

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      notes: notes || null,
      items: {
        create: items.map((item: any) => ({
          productName: item.productName,
          productUrl: item.productUrl,
          productImage: item.productImage || null,
          productPrice: item.productPrice || null,
          quantity: item.quantity ?? 1,
        })),
      },
    },
    include: { items: true },
  })

  return order
})
