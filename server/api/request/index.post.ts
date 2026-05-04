import { prisma } from '~/server/utils/prisma'
import { addExpenseToProject } from '~/server/utils/budget'
import { sendEmail, templateRequestSubmitted } from '~/server/utils/email'

/** POST /api/request — student submits a new procurement request */
export default defineEventHandler(async event => {
  try {
    const { dateNeeded, projectNum, items, additionalInfo, totalExpenses } = await readBody(event)

    const user = event.context.user
    if (user.role !== 'STUDENT') throw createError({ statusCode: 403, message: 'Students only' })

    const project = await prisma.project.findUnique({ where: { projectNum } })
    if (!project) throw createError({ statusCode: 404, message: 'Project not found' })

    // Create any new vendors inline
    const resolvedItems = await Promise.all(
      items.map(async (item: { vendorID: number; newVendorName?: string; newVendorEmail?: string; newVendorURL?: string; [key: string]: unknown }) => {
        let vendorID = item.vendorID
        if (item.newVendorName) {
          const newVendor = await prisma.vendor.create({
            data: {
              vendorName: item.newVendorName,
              vendorEmail: item.newVendorEmail ?? null,
              vendorURL: item.newVendorURL ?? 'https://default.com',
              vendorStatus: 'PENDING',
            },
          })
          vendorID = newVendor.vendorID
        }
        return { ...item, vendorID }
      }),
    )

    const result = await prisma.$transaction(async tx => {
      const process = await tx.process.create({ data: { status: 'UNDER_REVIEW' } })
      const request = await tx.request.create({
        data: {
          dateNeeded: new Date(dateNeeded),
          additionalInfo: additionalInfo ?? null,
          expense: Math.round(totalExpenses),
          projectID: project.projectID,
          studentID: user.id,
          processID: process.processID,
          items: {
            create: resolvedItems.map((item) => ({
              description: item.description as string,
              url: item.url as string,
              partNumber: item.partNumber as string,
              quantity: Number(item.quantity),
              unitPrice: Number(item.unitPrice),
              vendorID: item.vendorID,
              status: 'UNDER_REVIEW',
            })),
          },
        },
      })
      return { request, process }
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
        sendEmail(email, `New Procurement Request – ${project.projectTitle}`, templateRequestSubmitted(project.projectTitle, studentName)).catch(() => {}),
      ),
    )

    return { requestID: result.request.requestID, dateSubmitted: result.request.dateSubmitted }
  } catch (err: unknown) {
    if ((err as { statusCode?: number }).statusCode) throw err
    throw createError({ statusCode: 500, message: 'Internal server error' })
  }
})
