import { prisma } from '~/server/utils/prisma'

/** GET /api/project — returns all projects */
export default defineEventHandler(async () => {
  return prisma.project.findMany({ orderBy: { projectNum: 'asc' } })
})
