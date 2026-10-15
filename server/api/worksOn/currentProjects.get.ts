import prisma from '~~/server/utils/prisma'

export default defineEventHandler(async event => {
  try {
    const currentUser = event.context.user

    if (!currentUser) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized',
      })
    }

    // Use the signed-in user's ID directly from context
    const userID = Number(currentUser.id) // Or currentUser.userID depending on your schema

    const worksOn = await prisma.worksOn.findMany({
      where: {
        userID,
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