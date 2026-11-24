import { ROLES } from '~~/shared/constants/roles'
import prisma from '~~/server/utils/prisma'

/** GET /api/worksOn/currentProjects?userID=... — active projects for a user */
export default defineEventHandler(async event => {
  try {
    const currentUser = event.context.user

    if (!currentUser) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized',
      })
    }

    const { userID } = getQuery(event)
    const requestedID = userID ? String(userID) : currentUser.id

    // Only admins can look up another user's assignments
    if (requestedID !== currentUser.id && event.context.role !== ROLES.ADMIN) {
      throw createError({
        statusCode: 403,
        message: 'Forbidden',
      })
    }

    const worksOn = await prisma.worksOn.findMany({
      where: {
        userID: requestedID,
        endDate: null,
      },
      include: {
        project: true,
      },
    })

    return worksOn
      .map(w => w.project)
      .filter(Boolean)
  } catch (error: any) {
    if (error?.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Internal server error',
    })
  }
})