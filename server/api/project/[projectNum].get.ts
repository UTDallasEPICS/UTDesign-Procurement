import prisma from '~~/server/utils/prisma'
import { ROLES } from '~~/shared/constants/roles'

/**
 * GET /api/project/:projectNum — single project with full relations.
 * Students and mentors may only view projects they are assigned to.
 */
export default defineEventHandler(async event => {
  try {
    const projectNum = getRouterParam(event, 'projectNum')!
    const project = await prisma.project.findUnique({
      where: { projectNum },
      include: {
        worksOn: { include: { user: true } },
        requests: { include: { items: { include: { vendor: true } }, process: true, orders: true, student: { select: { firstName: true, lastName: true } } } },
        reimbursements: { include: { items: { include: { vendor: true } }, process: true, student: { select: { firstName: true, lastName: true } } } },
        otherExpenses: true,
      },
    })
    if (!project) throw createError({ statusCode: 404, message: 'Project not found' })

    if (event.context.role !== ROLES.ADMIN) {
      const isMember = project.worksOn.some(w => w.userID === event.context.user.id && !w.endDate)
      if (!isMember) throw createError({ statusCode: 403, message: 'Not a member of this project' })
    }

    return project
  } catch (err: unknown) {
    if ((err as { statusCode?: number }).statusCode) throw err
    throw createError({ statusCode: 500, message: 'Internal server error' })
  }
})
