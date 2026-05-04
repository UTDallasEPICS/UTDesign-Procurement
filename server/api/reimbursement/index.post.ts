import { prisma } from '~/server/utils/prisma'
import { addExpenseToProject } from '~/server/utils/budget'
import { sendEmail, templateReimbursementSubmitted } from '~/server/utils/email'

/** POST /api/reimbursement — student submits a new reimbursement request */
export default defineEventHandler(async event => {
  try {
    const { projectNum, items, additionalInfo, totalExpenses } = await readBody(event)
    const user = event.context.user

    if (user.role !== 'STUDENT') throw createError({ statusCode: 403, message: 'Students only' })

    const project = await prisma.project.findUnique({ where: { projectNum } })
    if (!project) throw createError({ statusCode: 404, message: 'Project not found' })

    const result = await prisma.$transaction(async tx => {
      const process = await tx.process.create({ data: { status: 'UNDER_REVIEW' } })
      const reimbursement = await tx.reimbursement.create({
        data: {
          additionalInfo: additionalInfo ?? null,
          expense: Math.round(totalExpenses),
          projectID: project.projectID,
          studentID: user.id,
          processID: process.processID,
          items: {
            create: items.map((item: { receiptDate: string; description: string; receiptTotal: number; vendorID: number }) => ({
              receiptDate: new Date(item.receiptDate),
              description: item.description,
              receiptTotal: Number(item.receiptTotal),
              vendorID: item.vendorID,
            })),
          },
        },
      })
      return { reimbursement, process }
    })

    await addExpenseToProject(prisma, project.projectID, totalExpenses)

    const mentors = await prisma.worksOn.findMany({
      where: { projectID: project.projectID, endDate: null },
      include: { user: true },
    })
    const mentorEmails = mentors.filter(w => w.user.role === 'MENTOR').map(w => w.user.email)
    const studentName = `${user.firstName} ${user.lastName}`

    await Promise.all(
      mentorEmails.map(email =>
        sendEmail(email, `New Reimbursement Request – ${project.projectTitle}`, templateReimbursementSubmitted(project.projectTitle, studentName)).catch(() => {}),
      ),
    )

    return { reimbursementID: result.reimbursement.reimbursementID, dateSubmitted: result.reimbursement.dateSubmitted }
  } catch (err: unknown) {
    if ((err as { statusCode?: number }).statusCode) throw err
    throw createError({ statusCode: 500, message: 'Internal server error' })
  }
})
