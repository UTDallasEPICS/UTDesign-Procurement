import { prisma } from '~/server/utils/prisma'

/** POST /api/admin/delete — hard delete user or project */
export default defineEventHandler(async event => {
  if (event.context.role !== 'ADMIN') throw createError({ statusCode: 403, message: 'Admin only' })

  try {
    const { type, id } = await readBody(event)

    if (type === 'user') {
      await prisma.user.delete({ where: { id: Number(id) } })
    } else if (type === 'project') {
      await prisma.project.delete({ where: { projectID: Number(id) } })
    } else {
      throw createError({ statusCode: 400, message: 'Invalid type' })
    }

    return { ok: true }
  } catch (err: unknown) {
    if ((err as { statusCode?: number }).statusCode) throw err
    throw createError({ statusCode: 500, message: 'Internal server error' })
  }
})
