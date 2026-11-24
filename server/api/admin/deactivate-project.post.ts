import { ROLES } from '~~/shared/constants/roles'
import prisma from '~~/server/utils/prisma'

export default defineEventHandler(async event => {
  if (event.context.role !== ROLES.ADMIN) {
    throw createError({ statusCode: 403, message: 'Admin only' })
  }

  try {
    const { projectID } = await readBody(event)
    const now = new Date()

    await prisma.$transaction([
      // Deactivate the project
      prisma.project.update({
        where: { projectID: Number(projectID) },
        data: {
          deactivationDate: now,
        },
      }),

      // Deactivate all students associated with the project
      prisma.user.updateMany({
        where: {
          role: ROLES.STUDENT,
          worksOn: {
            some: {
              projectID: Number(projectID),
            },
          },
        },
        data: {
          active: false,
          deactivationDate: now,
        },
      }),
    ])

    return { ok: true }
  } catch (err: unknown) {
    if ((err as { statusCode?: number }).statusCode) throw err

    throw createError({
      statusCode: 500,
      message: 'Internal server error',
    })
  }
})