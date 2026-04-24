import { prisma } from '~/server/utils/prisma'

/** GET /api/project/:projectNum */
export default defineEventHandler(async event => {
  const projectNum = getRouterParam(event, 'projectNum')!
  const project = await prisma.project.findUnique({
    where: { projectNum },
    include: {
      worksOn: { include: { user: { include: { role: true } } } },
      requests: { include: { items: true, process: true, orders: true } },
      reimbursements: { include: { items: true, process: true } },
      otherExpenses: true,
    },
  })
  if (!project) throw createError({ statusCode: 404, message: 'Project not found' })
  return project
})
