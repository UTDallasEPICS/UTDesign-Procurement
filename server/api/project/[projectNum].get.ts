import { prisma } from '~/server/utils/prisma'

/** GET /api/project/:projectNum — single project with full relations */
export default defineEventHandler(async event => {
  try {
    const projectNum = getRouterParam(event, 'projectNum')!
    const project = await prisma.project.findUnique({
      where: { projectNum },
      include: {
        worksOn: { include: { user: true } },
        requests: { include: { items: true, process: true, orders: true } },
        reimbursements: { include: { items: true, process: true } },
        otherExpenses: true,
      },
    })
    if (!project) throw createError({ statusCode: 404, message: 'Project not found' })
    return project
  } catch (err: unknown) {
    if ((err as { statusCode?: number }).statusCode) throw err
    throw createError({ statusCode: 500, message: 'Internal server error' })
  }
})
