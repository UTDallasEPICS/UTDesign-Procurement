import { prisma } from '~/server/utils/prisma'

/**
 * POST /api/request/get
 * Returns requests filtered by user role.
 * - Admin: all requests with status APPROVED or ORDERED
 * - Mentor: UNDER_REVIEW requests for their projects
 * - Student: all their own requests
 */
export default defineEventHandler(async event => {
  const user = event.context.user
  const role = user.roleID // 1=Admin, 2=Mentor, 3=Student

  const requestInclude = {
    items: { include: { vendor: true } },
    process: true,
    otherExpenses: true,
    orders: true,
    project: true,
    student: { select: { firstName: true, lastName: true, email: true, netID: true } },
  }

  if (role === 1) {
    // Admin: approved and ordered requests across all projects
    const requests = await prisma.request.findMany({
      where: {
        process: { status: { in: ['APPROVED', 'ORDERED'] } },
      },
      include: requestInclude,
      orderBy: { dateSubmitted: 'desc' },
    })
    return { userRole: role, requests }
  }

  if (role === 2) {
    // Mentor: UNDER_REVIEW requests on their projects
    const worksOn = await prisma.worksOn.findMany({
      where: { userID: user.id, endDate: null },
      select: { projectID: true },
    })
    const projectIDs = worksOn.map(w => w.projectID)

    const requests = await prisma.request.findMany({
      where: {
        projectID: { in: projectIDs },
        process: { status: 'UNDER_REVIEW' },
      },
      include: requestInclude,
      orderBy: { dateSubmitted: 'desc' },
    })
    return { userRole: role, requests }
  }

  // Student: all their own requests
  const requests = await prisma.request.findMany({
    where: { studentID: user.id },
    include: requestInclude,
    orderBy: { dateSubmitted: 'desc' },
  })
  return { userRole: role, requests }
})
