import { prisma } from '~/server/utils/prisma'

/** GET /api/worksOn/currentProjects — active projects for the current user */
export default defineEventHandler(async event => {
  try {
    const user = event.context.user
    const worksOn = await prisma.worksOn.findMany({
      where: { userID: user.id, endDate: null },
      include: { project: true },
    })
    return worksOn.map(w => w.project)
  } catch {
    throw createError({ statusCode: 500, message: 'Internal server error' })
  }
})
