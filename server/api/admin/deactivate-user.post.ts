import { ROLES } from '~~/shared/constants/roles'
import prisma from '~~/server/utils/prisma'

export default defineEventHandler(async event => {
  if (event.context.role !== ROLES.ADMIN) throw createError({ statusCode: 403, message: 'Admin only' })
  try {
    const { userID } = await readBody(event)
    await prisma.user.update({
      where: { id: Number(userID) },
      data: { active: false, deactivationDate: new Date() },
    })
    return { ok: true }
  } catch (err: unknown) {
    if ((err as { statusCode?: number }).statusCode) throw err
    throw createError({ statusCode: 500, message: 'Internal server error' })
  }
})
