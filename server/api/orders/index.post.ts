import { auth } from '../../utils/auth'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const body = await readBody(event)
  const { productName, productUrl, productImage, productPrice, notes } = body

  if (!productName || !productUrl) {
    throw createError({ statusCode: 400, message: 'productName and productUrl are required' })
  }

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      productName,
      productUrl,
      productImage: productImage || null,
      productPrice: productPrice || null,
      notes: notes || null,
    },
  })

  return order
})
