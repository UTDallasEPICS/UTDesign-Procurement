import { prisma } from '~/server/utils/prisma'

/** POST /api/worksOn — assign a user to a project (admin) */
export default defineEventHandler(async event => {
  if (event.context.role !== 1) throw createError({ statusCode: 403, message: 'Admin only' })

  const { userID, projectNum } = await readBody(event)
  const project = await prisma.project.findUnique({ where: { projectNum } })
  if (!project) throw createError({ statusCode: 404, message: 'Project not found' })

  return prisma.worksOn.create({
    data: {
      userID: Number(userID),
      projectID: project.projectID,
      startDate: new Date(),
    },
  })
})
