import prisma from '~~/server/utils/prisma'

/** GET /api/worksOn/currentProjects?userID=123 */

export default defineEventHandler(async event => {
  try {
    const currentUser = event.context.user

    if (!currentUser) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized',
      })
    }

    const query = getQuery(event)
    const userID = Number(query.userID)

    if (!userID) {
      throw createError({
        statusCode: 400,
        message: 'userID is required',
      })
    }

    const worksOn = await prisma.worksOn.findMany({
      where: {
        userID,
        endDate: null,
      },
      include: {
        project: true,
      },
    })

    return worksOn.map(w => w.project)
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