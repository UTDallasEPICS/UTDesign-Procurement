import { ROLES } from '~/shared/constants/roles'
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async event => {
  if (event.context.role !== ROLES.ADMIN) throw createError({ statusCode: 403, message: 'Admin only' })
  try {
    const { projectID } = await readBody(event)
    await prisma.project.update({
      where: { projectID: Number(projectID) },
      data: { deactivationDate: null },
    })
    return { ok: true }
  } catch (err: unknown) {
    if ((err as { statusCode?: number }).statusCode) throw err
    throw createError({ statusCode: 500, message: 'Internal server error' })
  }
})
