import { prisma } from '~/server/utils/prisma'
import { removeExpenseFromProject } from '~/server/utils/budget'
import {
  sendEmail,
  templateRequestApproved,
  templateRequestRejected,
  templateRequestOrdered,
  templateReimbursementApproved,
  templateReimbursementRejected,
  templateReimbursementProcessed,
} from '~/server/utils/email'

/** POST /api/process/update — role-based status updates (approve, reject, cancel, process) */
export default defineEventHandler(async event => {
  try {
    const { processID, status, comment } = await readBody(event)
    const user = event.context.user
    const role = user.role

    const process = await prisma.process.findUnique({
      where: { processID },
      include: {
        request: { include: { project: true, student: true } },
        reimbursement: { include: { project: true, student: true } },
      },
    })
    if (!process) throw createError({ statusCode: 404, message: 'Process not found' })

    const isRequest = !!process.request
    const linked = process.request ?? process.reimbursement
    if (!linked) throw createError({ statusCode: 400, message: 'No linked request or reimbursement' })

    const project = linked.project
    const student = linked.student

    if (role === 'ADMIN') {
      await prisma.process.update({
        where: { processID },
        data: { status, adminProcessed: new Date(), adminProcessedComments: comment ?? null, adminID: user.id },
      })

      if (status === 'REJECTED') {
        await removeExpenseFromProject(prisma, project.projectID, linked.expense)
        await sendEmail(student.email, `Request Rejected by Admin – ${project.projectTitle}`, templateRequestRejected(project.projectTitle, comment)).catch(() => {})
      }
      if (status === 'ORDERED' && isRequest) {
        await sendEmail(student.email, `Your Request Has Been Ordered – ${project.projectTitle}`, templateRequestOrdered(project.projectTitle)).catch(() => {})
      }
      if (status === 'PROCESSED' && !isRequest) {
        await sendEmail(student.email, `Your Reimbursement Has Been Processed`, templateReimbursementProcessed(project.projectTitle)).catch(() => {})
      }
    } else if (role === 'MENTOR') {
      await prisma.process.update({
        where: { processID },
        data: { status, mentorProcessed: new Date(), mentorProcessedComments: comment ?? null, mentorID: user.id },
      })

      if (status === 'APPROVED') {
        if (isRequest) {
          await prisma.request.update({ where: { requestID: process.request!.requestID }, data: { dateApproved: new Date() } })
          await sendEmail(student.email, `Your Request Was Approved – ${project.projectTitle}`, templateRequestApproved(project.projectTitle, comment)).catch(() => {})
        } else {
          await sendEmail(student.email, `Your Reimbursement Was Approved`, templateReimbursementApproved(project.projectTitle)).catch(() => {})
        }
      }
      if (status === 'REJECTED') {
        await removeExpenseFromProject(prisma, project.projectID, linked.expense)
        if (isRequest) {
          await sendEmail(student.email, `Your Request Was Rejected – ${project.projectTitle}`, templateRequestRejected(project.projectTitle, comment)).catch(() => {})
        } else {
          await sendEmail(student.email, `Your Reimbursement Was Rejected`, templateReimbursementRejected(project.projectTitle, comment)).catch(() => {})
        }
      }
    } else if (role === 'STUDENT') {
      if (!['CANCELLED', 'UNDER_REVIEW'].includes(status)) {
        throw createError({ statusCode: 403, message: 'Students can only cancel or resubmit' })
      }
      await prisma.process.update({ where: { processID }, data: { status } })
    }

    return { ok: true }
  } catch (err: unknown) {
    if ((err as { statusCode?: number }).statusCode) throw err
    throw createError({ statusCode: 500, message: 'Internal server error' })
  }
})
