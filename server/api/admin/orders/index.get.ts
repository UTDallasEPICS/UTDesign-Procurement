import { auth } from '../../../utils/auth'
import { isAdmin } from '../../../utils/roles'
import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session || !isAdmin(session.user.email)) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      items: true,
      user: { select: { name: true, email: true } },
    },
  })

  return orders
})
