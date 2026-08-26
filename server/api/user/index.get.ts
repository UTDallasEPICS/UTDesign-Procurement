import { ROLES } from '~~/shared/constants/roles'
import prisma from '~~/server/utils/prisma'

/** GET /api/user — all users (admin only) */
export default defineEventHandler(async event => {
  if (event.context.role !== ROLES.ADMIN) {
    throw createError({
      statusCode: 403,
      message: 'Admin only',
    })
  }

  try {
    return await prisma.user.findMany({
      orderBy: {
        lastName: 'asc',
      },
      include: {
        worksOn: {
          where: {
            endDate: null,
          },
          include: {
            project: {
              select: {
                projectID: true,
                projectNum: true,
                projectTitle: true,
              },
            },
          },
        },
      },
    })
  } catch (error) {

    throw createError({
      statusCode: 500,
      message: 'Internal server error',
    })
  }
})