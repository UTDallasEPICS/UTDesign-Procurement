import { prisma } from '~/server/utils/prisma'

/**
 * POST /api/request/get
 * Returns requests filtered by the current user's role.
 * - ADMIN: all APPROVED or ORDERED requests
 * - MENTOR: UNDER_REVIEW requests for their projects
 * - STUDENT: all their own requests
 */
export default defineEventHandler(async event => {
  try {
    const user = event.context.user
    const role = user.role

    const requestInclude = {
      items: { include: { vendor: true } },
      process: true,
      otherExpenses: true,
      orders: true,
      project: true,
      student: { select: { firstName: true, lastName: true, email: true, netID: true } },
    }

    if (role === 'ADMIN') {
      const requests = await prisma.request.findMany({
        where: { process: { status: { in: ['APPROVED', 'ORDERED'] } } },
        include: requestInclude,
        orderBy: { dateSubmitted: 'desc' },
      })
      return { userRole: role, requests }
    }

    if (role === 'MENTOR') {
      const worksOn = await prisma.worksOn.findMany({
        where: { userID: user.id, endDate: null },
        select: { projectID: true },
      })
      const projectIDs = worksOn.map(w => w.projectID)

      const requests = await prisma.request.findMany({
        where: { projectID: { in: projectIDs }, process: { status: 'UNDER_REVIEW' } },
        include: requestInclude,
        orderBy: { dateSubmitted: 'desc' },
      })
      return { userRole: role, requests }
    }

    // STUDENT
    const requests = await prisma.request.findMany({
      where: { studentID: user.id },
      include: requestInclude,
      orderBy: { dateSubmitted: 'desc' },
    })
    return { userRole: role, requests }
  } catch (err: unknown) {
    if ((err as { statusCode?: number }).statusCode) throw err
    throw createError({ statusCode: 500, message: 'Internal server error' })
  }
})
