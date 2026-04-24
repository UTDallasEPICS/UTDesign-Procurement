import { prisma } from '~/server/utils/prisma'

/** POST /api/worksOn/deactivate — end a user's assignment to a project */
export default defineEventHandler(async event => {
  if (event.context.role !== 1) throw createError({ statusCode: 403, message: 'Admin only' })

  const { userID, projectID } = await readBody(event)

  // Find the active WorksOn record
  const active = await prisma.worksOn.findFirst({
    where: { userID: Number(userID), projectID: Number(projectID), endDate: null },
  })
  if (!active) throw createError({ statusCode: 404, message: 'Active assignment not found' })

  return prisma.worksOn.update({
    where: {
      userID_projectID_startDate: {
        userID: active.userID,
        projectID: active.projectID,
        startDate: active.startDate,
      },
    },
    data: { endDate: new Date() },
  })
})
