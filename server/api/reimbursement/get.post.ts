import { ROLES } from '~/shared/constants/roles'
import { prisma } from '~/server/utils/prisma'

/**
 * POST /api/reimbursement/get
 * Returns reimbursements filtered by the current user's role.
 * - ADMIN: all APPROVED reimbursements
 * - MENTOR: UNDER_REVIEW reimbursements for their projects
 * - STUDENT: all their own reimbursements
 */
export default defineEventHandler(async event => {
  try {
    const user = event.context.user
    const role = user.role

    const include = {
      items: { include: { vendor: true, upload: true } },
      process: true,
      project: true,
      student: { select: { firstName: true, lastName: true, email: true, netID: true } },
    }

    if (role === ROLES.ADMIN) {
      const reimbursements = await prisma.reimbursement.findMany({
        where: { process: { status: 'APPROVED' } },
        include,
        orderBy: { dateSubmitted: 'desc' },
      })
      return { userRole: role, reimbursements }
    }

    if (role === ROLES.MENTOR) {
      const worksOn = await prisma.worksOn.findMany({
        where: { userID: user.id, endDate: null },
        select: { projectID: true },
      })
      const projectIDs = worksOn.map(w => w.projectID)

      const reimbursements = await prisma.reimbursement.findMany({
        where: { projectID: { in: projectIDs }, process: { status: 'UNDER_REVIEW' } },
        include,
        orderBy: { dateSubmitted: 'desc' },
      })
      return { userRole: role, reimbursements }
    }

    // STUDENT
    const reimbursements = await prisma.reimbursement.findMany({
      where: { studentID: user.id },
      include,
      orderBy: { dateSubmitted: 'desc' },
    })
    return { userRole: role, reimbursements }
  } catch (err: unknown) {
    if ((err as { statusCode?: number }).statusCode) throw err
    throw createError({ statusCode: 500, message: 'Internal server error' })
  }
})
