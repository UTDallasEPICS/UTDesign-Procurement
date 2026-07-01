import { ROLES } from '~/shared/constants/roles'
import { prisma } from '~/server/utils/prisma'

/** POST /api/worksOn — assign a user to a project (admin only) */
export default defineEventHandler(async event => {
  if (event.context.role !== ROLES.ADMIN) throw createError({ statusCode: 403, message: 'Admin only' })

  try {
    const { userID, projectNum } = await readBody(event)
    const project = await prisma.project.findUnique({ where: { projectNum } })
    if (!project) throw createError({ statusCode: 404, message: 'Project not found' })

    return prisma.worksOn.create({
      data: { userID: Number(userID), projectID: project.projectID, startDate: new Date() },
    })
  } catch (err: unknown) {
    if ((err as { statusCode?: number }).statusCode) throw err
    throw createError({ statusCode: 500, message: 'Internal server error' })
  }
})
