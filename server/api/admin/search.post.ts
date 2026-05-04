import { prisma } from '~/server/utils/prisma'

/** POST /api/admin/search — search users or projects */
export default defineEventHandler(async event => {
  if (event.context.role !== 'ADMIN') throw createError({ statusCode: 403, message: 'Admin only' })

  try {
    const { type, query } = await readBody(event)

    if (type === 'user') {
      return prisma.user.findMany({
        where: {
          OR: [
            { netID: { contains: query } },
            { firstName: { contains: query } },
            { lastName: { contains: query } },
            { email: { contains: query } },
          ],
        },
      })
    }

    if (type === 'project') {
      return prisma.project.findMany({
        where: {
          OR: [
            { projectNum: { contains: query } },
            { projectTitle: { contains: query } },
          ],
        },
      })
    }

    throw createError({ statusCode: 400, message: 'Invalid type' })
  } catch (err: unknown) {
    if ((err as { statusCode?: number }).statusCode) throw err
    throw createError({ statusCode: 500, message: 'Internal server error' })
  }
})
