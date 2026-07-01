import { prisma } from '~/server/utils/prisma'
import { sendEmailToAdmins, templateTrackingRequested } from '~/server/utils/email'
import { ROLES } from '~/shared/constants/roles'

/** POST /api/request/tracking-request — student asks admins for tracking info on an ordered request */
export default defineEventHandler(async event => {
  try {
    const user = event.context.user
    if (user.role !== ROLES.STUDENT) throw createError({ statusCode: 403, message: 'Students only' })

    const { requestID } = await readBody(event)

    const request = await prisma.request.findUnique({
      where: { requestID: Number(requestID) },
      include: { process: true, project: true },
    })
    if (!request) throw createError({ statusCode: 404, message: 'Request not found' })
    if (request.studentID !== user.id) throw createError({ statusCode: 403, message: 'Not your request' })
    if (request.process.status !== 'ORDERED') {
      throw createError({ statusCode: 400, message: 'Tracking info can only be requested for ordered requests' })
    }

    await prisma.request.update({
      where: { requestID: request.requestID },
      data: { trackingRequested: true, trackingRequestedAt: new Date() },
    })

    const studentName = `${user.firstName} ${user.lastName}`
    await sendEmailToAdmins(
      prisma,
      `Tracking Info Requested – ${request.project.projectTitle}`,
      templateTrackingRequested(request.project.projectTitle, studentName, request.requestID),
    ).catch(() => {})

    return { ok: true }
  } catch (err: unknown) {
    if ((err as { statusCode?: number }).statusCode) throw err
    throw createError({ statusCode: 500, message: 'Internal server error' })
  }
})
