import { prisma } from '~/server/utils/prisma'
import { addExpenseToProject } from '~/server/utils/budget'
import { sendEmail, templateRequestSubmitted } from '~/server/utils/email'
import { validateEmailAndReturnNetID } from '~/server/utils/netid'

/**
 * POST /api/request
 * Student submits a new procurement request.
 */
export default defineEventHandler(async event => {
  const body = await readBody(event)
  const {
    dateNeeded,
    projectNum,
    items,            // Array of { description, url, partNumber, quantity, unitPrice, vendorID, newVendorName?, newVendorEmail?, newVendorURL? }
    additionalInfo,
    totalExpenses,
  } = body

  const user = event.context.user
  if (user.roleID !== 3) throw createError({ statusCode: 403, message: 'Students only' })

  const project = await prisma.project.findUnique({ where: { projectNum } })
  if (!project) throw createError({ statusCode: 404, message: 'Project not found' })

  // Create vendors for any new vendors in the items list
  const resolvedItems = await Promise.all(
    items.map(async (item: any) => {
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

  // Create request, items, and process in a single transaction
  const result = await prisma.$transaction(async tx => {
    const process = await tx.process.create({
      data: { status: 'UNDER_REVIEW' },
    })

    const request = await tx.request.create({
      data: {
        dateNeeded: new Date(dateNeeded),
        additionalInfo: additionalInfo ?? null,
        expense: Math.round(totalExpenses),
        projectID: project.projectID,
        studentID: user.id,
        processID: process.processID,
        items: {
          create: resolvedItems.map((item: any) => ({
            description: item.description,
            url: item.url,
            partNumber: item.partNumber,
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

  // Update project expenses
  await addExpenseToProject(prisma, project.projectID, totalExpenses)

  // Notify mentors on this project
  const mentors = await prisma.worksOn.findMany({
    where: { projectID: project.projectID, endDate: null },
    include: { user: { include: { role: true } } },
  })
  const mentorEmails = mentors
    .filter(w => w.user.roleID === 2)
    .map(w => w.user.email)

  const studentName = `${user.firstName} ${user.lastName}`
  await Promise.all(
    mentorEmails.map(email =>
      sendEmail(
        email,
        `New Procurement Request – ${project.projectTitle}`,
        templateRequestSubmitted(project.projectTitle, studentName),
      ).catch(() => {}), // Don't fail the request if email fails
    ),
  )

  return {
    requestID: result.request.requestID,
    dateSubmitted: result.request.dateSubmitted,
  }
})
