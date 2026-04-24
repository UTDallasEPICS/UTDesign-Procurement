import { prisma } from '~/server/utils/prisma'

/** POST /api/admin/search — search users or projects */
export default defineEventHandler(async event => {
  if (event.context.role !== 1) throw createError({ statusCode: 403, message: 'Admin only' })

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
      include: { role: true },
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
})
