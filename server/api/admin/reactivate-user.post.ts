import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async event => {
  if (event.context.role !== 1) throw createError({ statusCode: 403, message: 'Admin only' })
  const { userID } = await readBody(event)
  await prisma.user.update({
    where: { id: Number(userID) },
    data: { active: true, deactivationDate: null },
  })
  return { ok: true }
})
