import prisma from '~~/server/utils/prisma'
import { ROLES } from '~~/shared/constants/roles'

/**
 * GET /api/project — projects with team members and request history.
 * Admins see all projects; students and mentors see only their assigned projects.
 */
export default defineEventHandler(async event => {
  try {
    const user = event.context.user
    const role = event.context.role

    const include = {
      worksOn: { include: { user: true } },
      requests: { include: { process: true } },
      reimbursements: { include: { process: true } },
    }

    if (role === ROLES.ADMIN) {
      return await prisma.project.findMany({ orderBy: { projectNum: 'asc' }, include })
    }

    const memberships = await prisma.worksOn.findMany({
      where: { userID: user.id, endDate: null },
      select: { projectID: true },
    })
    return await prisma.project.findMany({
      where: { projectID: { in: memberships.map(m => m.projectID) } },
      orderBy: { projectNum: 'asc' },
      include,
    })
  } catch {
    throw createError({ statusCode: 500, message: 'Internal server error' })
  }
})
