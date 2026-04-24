import { prisma } from '~/server/utils/prisma'

/** POST /api/admin/delete — hard delete user or project */
export default defineEventHandler(async event => {
  if (event.context.role !== 1) throw createError({ statusCode: 403, message: 'Admin only' })

  const { type, id } = await readBody(event)

  if (type === 'user') {
    await prisma.user.delete({ where: { id: Number(id) } })
  } else if (type === 'project') {
    await prisma.project.delete({ where: { projectID: Number(id) } })
  } else {
    throw createError({ statusCode: 400, message: 'Invalid type' })
  }

  return { ok: true }
})
