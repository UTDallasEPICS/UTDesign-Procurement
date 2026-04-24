import { prisma } from '~/server/utils/prisma'

/**
 * POST /api/reimbursement/get
 * Returns reimbursements filtered by user role.
 */
export default defineEventHandler(async event => {
  const user = event.context.user
  const role = user.roleID

  const include = {
    items: { include: { vendor: true, upload: true } },
    process: true,
    project: true,
    student: { select: { firstName: true, lastName: true, email: true, netID: true } },
  }

  if (role === 1) {
    const reimbursements = await prisma.reimbursement.findMany({
      where: { process: { status: 'APPROVED' } },
      include,
      orderBy: { dateSubmitted: 'desc' },
    })
    return { userRole: role, reimbursements }
  }

  if (role === 2) {
    const worksOn = await prisma.worksOn.findMany({
      where: { userID: user.id, endDate: null },
      select: { projectID: true },
    })
    const projectIDs = worksOn.map(w => w.projectID)

    const reimbursements = await prisma.reimbursement.findMany({
      where: {
        projectID: { in: projectIDs },
        process: { status: 'UNDER_REVIEW' },
      },
      include,
      orderBy: { dateSubmitted: 'desc' },
    })
    return { userRole: role, reimbursements }
  }

  // Student
  const reimbursements = await prisma.reimbursement.findMany({
    where: { studentID: user.id },
    include,
    orderBy: { dateSubmitted: 'desc' },
  })
  return { userRole: role, reimbursements }
})
