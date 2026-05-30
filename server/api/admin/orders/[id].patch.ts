import { auth } from '../../../utils/auth'
import { isAdmin } from '../../../utils/roles'
import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session || !isAdmin(session.user.email)) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { status } = body

  if (!['approved', 'rejected'].includes(status)) {
    throw createError({ statusCode: 400, message: 'status must be "approved" or "rejected"' })
  }

  const order = await prisma.order.update({
    where: { id },
    data: { status },
  })

  return order
})
