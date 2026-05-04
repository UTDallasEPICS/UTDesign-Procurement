import { prisma } from '~/server/utils/prisma'

/** GET /api/project — all projects with team members and request history */
export default defineEventHandler(async () => {
  try {
    return prisma.project.findMany({
      orderBy: { projectNum: 'asc' },
      include: {
        worksOn: { include: { user: true } },
        requests: { include: { process: true } },
        reimbursements: { include: { process: true } },
      },
    })
  } catch {
    throw createError({ statusCode: 500, message: 'Internal server error' })
  }
})
