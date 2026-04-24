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

/**
 * POST /api/process/update
 * Role-based process status updates (approve, reject, cancel, process).
 */
export default defineEventHandler(async event => {
  const body = await readBody(event)
  const { processID, status, comment } = body

  const user = event.context.user
  const role = user.roleID

  // Load the current process with its linked request/reimbursement
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

  // ── Admin actions ──────────────────────────────────────────────────────────
  if (role === 1) {
    await prisma.process.update({
      where: { processID },
      data: {
        status,
        adminProcessed: new Date(),
        adminProcessedComments: comment ?? null,
        adminID: user.id,
      },
    })

    if (status === 'REJECTED') {
      await removeExpenseFromProject(prisma, project.projectID, linked.expense)
      await sendEmail(
        student.email,
        `Request Rejected by Admin – ${project.projectTitle}`,
        templateRequestRejected(project.projectTitle, comment),
      ).catch(() => {})
    }

    if (status === 'ORDERED' && isRequest) {
      await sendEmail(
        student.email,
        `Your Request Has Been Ordered – ${project.projectTitle}`,
        templateRequestOrdered(project.projectTitle),
      ).catch(() => {})
    }

    if (status === 'PROCESSED' && !isRequest) {
      await sendEmail(
        student.email,
        `Your Reimbursement Has Been Processed`,
        templateReimbursementProcessed(project.projectTitle),
      ).catch(() => {})
    }
  }

  // ── Mentor actions ─────────────────────────────────────────────────────────
  else if (role === 2) {
    await prisma.process.update({
      where: { processID },
      data: {
        status,
        mentorProcessed: new Date(),
        mentorProcessedComments: comment ?? null,
        mentorID: user.id,
      },
    })

    if (status === 'APPROVED') {
      if (isRequest) {
        await prisma.request.update({
          where: { requestID: process.request!.requestID },
          data: { dateApproved: new Date() },
        })
        await sendEmail(
          student.email,
          `Your Request Was Approved – ${project.projectTitle}`,
          templateRequestApproved(project.projectTitle, comment),
        ).catch(() => {})
      } else {
        await sendEmail(
          student.email,
          `Your Reimbursement Was Approved`,
          templateReimbursementApproved(project.projectTitle),
        ).catch(() => {})
      }
    }

    if (status === 'REJECTED') {
      await removeExpenseFromProject(prisma, project.projectID, linked.expense)
      if (isRequest) {
        await sendEmail(
          student.email,
          `Your Request Was Rejected – ${project.projectTitle}`,
          templateRequestRejected(project.projectTitle, comment),
        ).catch(() => {})
      } else {
        await sendEmail(
          student.email,
          `Your Reimbursement Was Rejected`,
          templateReimbursementRejected(project.projectTitle, comment),
        ).catch(() => {})
      }
    }
  }

  // ── Student actions (cancel / resubmit) ────────────────────────────────────
  else if (role === 3) {
    if (!['CANCELLED', 'UNDER_REVIEW'].includes(status)) {
      throw createError({ statusCode: 403, message: 'Students can only cancel or resubmit' })
    }
    await prisma.process.update({
      where: { processID },
      data: { status },
    })
  }

  return { ok: true }
})
