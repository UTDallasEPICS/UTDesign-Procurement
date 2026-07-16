import { Prisma } from '@prisma/client'
import prisma from '~~/server/utils/prisma'
import { addExpenseToProject, getRemainingBudget, recalcProjectExpenses } from '~~/server/utils/budget'
import { sendEmail, templateRequestSubmitted } from '~~/server/utils/email'
import { ITEM_CATEGORIES, OTHER_CATEGORY } from '~~/shared/constants/categories'
import { ROLES } from '~~/shared/constants/roles'

const MAX_WORDS = 50

type RequestItemInput = {
  description: string
  justification: string
  url: string
  partNumber: string
  quantity: number
  unitPrice: number
  category: (typeof ITEM_CATEGORIES)[number]
  otherCategoryDescription?: string
  vendorID: number | null
  newVendorName?: string
  newVendorEmail?: string
  newVendorURL?: string
}

type RequestBody = {
  dateNeeded: string
  projectNum: string
  items: RequestItemInput[]
  additionalInfo?: string
  totalExpenses: number
  resubmitRequestID?: number
}

function wordCount(s: string): number {
  return s.trim() ? s.trim().split(/\s+/).filter(Boolean).length : 0
}

/** POST /api/request — student submits a new procurement request, or resubmits an edited one */
export default defineEventHandler(async event => {
  try {
    const { dateNeeded, projectNum, items, additionalInfo, totalExpenses, resubmitRequestID } =
      await readBody<RequestBody>(event)

    const user = event.context.user
    if (user.role !== ROLES.STUDENT) throw createError({ statusCode: 403, message: 'Students only' })

    const project = await prisma.project.findUnique({ where: { projectNum } })
    if (!project) throw createError({ statusCode: 404, message: 'Project not found' })

    // Resubmission: verify the request belongs to this student and is editable
    let existingRequest: Awaited<ReturnType<typeof prisma.request.findUnique<{ where: { requestID: number }; include: { process: true } }>>> = null
    if (resubmitRequestID) {
      existingRequest = await prisma.request.findUnique({
        where: { requestID: Number(resubmitRequestID) },
        include: { process: true },
      })
      if (!existingRequest) throw createError({ statusCode: 404, message: 'Request not found' })
      if (existingRequest.studentID !== user.id) throw createError({ statusCode: 403, message: 'Not your request' })
      if (!['REJECTED', 'CHANGES_REQUESTED'].includes(existingRequest.process.status)) {
        throw createError({ statusCode: 400, message: 'Only rejected or changes-requested orders can be resubmitted' })
      }
    }

    if (!Array.isArray(items) || items.length === 0) {
      throw createError({ statusCode: 400, message: 'At least one item is required' })
    }

    for (const item of items) {
      if (!item.category || !ITEM_CATEGORIES.includes(item.category as (typeof ITEM_CATEGORIES)[number])) {
        throw createError({ statusCode: 400, message: `Invalid category: ${item.category}` })
      }
      if (item.category === OTHER_CATEGORY && !item.otherCategoryDescription?.trim()) {
        throw createError({ statusCode: 400, message: 'A description is required when category is Other' })
      }
      if (!item.justification?.trim()) {
        throw createError({ statusCode: 400, message: 'A justification is required for every item' })
      }
      if (wordCount(item.justification) > MAX_WORDS) {
        throw createError({ statusCode: 400, message: `Justification must be ${MAX_WORDS} words or fewer` })
      }
      if (wordCount(item.description ?? '') > MAX_WORDS) {
        throw createError({ statusCode: 400, message: `Description must be ${MAX_WORDS} words or fewer` })
      }
    }

    const orderTotal = items.reduce(
      (sum: number, i: { quantity: number; unitPrice: number }) => sum + Number(i.quantity) * Number(i.unitPrice),
      0,
    )
    // On resubmit of a changes-requested order, its previous expense is still counted — credit it back
    const priorCounted =
      existingRequest && existingRequest.process.status === 'CHANGES_REQUESTED' ? existingRequest.expense : 0
    const remaining = getRemainingBudget(project.startingBudget, project.totalExpenses) + priorCounted
    if (orderTotal > remaining) {
      throw createError({
        statusCode: 400,
        message: `Order total ($${orderTotal.toFixed(2)}) exceeds the project's available balance ($${remaining.toFixed(2)})`,
      })
    }

    // Create any new vendors inline
    const resolvedItems = await Promise.all(
      items.map(async (item: RequestItemInput) => {
        let vendorID = item.vendorID
        const shouldCreateVendor = item.vendorID == null || (item.vendorID as unknown) === '__new__'
        if (shouldCreateVendor) {
          const vendorName = item.newVendorName?.trim()
          if (!vendorName) {
            throw createError({ statusCode: 400, message: 'A vendor name is required when adding a new vendor' })
          }
          const newVendor = await prisma.vendor.create({
            data: {
              vendorName,
              vendorEmail: item.newVendorEmail ?? null,
              vendorURL: item.newVendorURL ?? 'https://default.com',
              vendorStatus: 'PENDING',
            },
          })
          vendorID = newVendor.vendorID
        } else if (vendorID == null) {
          throw createError({ statusCode: 400, message: 'A vendor is required for each item' })
        }
        return { ...item, vendorID }
      }),
    )

    const itemCreates: Prisma.RequestItemUncheckedCreateWithoutRequestInput[] = resolvedItems.map((item) => ({
      description: item.description as string,
      justification: item.justification as string,
      url: item.url as string,
      partNumber: item.partNumber as string,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      category: item.category,
      otherCategoryDescription: (item.otherCategoryDescription as string | undefined)?.trim() || null,
      vendorID: item.vendorID as number,
    }))

    const result = await prisma.$transaction(async tx => {
      if (existingRequest) {
        // Replace items, update fields, and send back for review
        await tx.requestItem.deleteMany({ where: { requestID: existingRequest.requestID } })
        const request = await tx.request.update({
          where: { requestID: existingRequest.requestID },
          data: {
            dateNeeded: new Date(dateNeeded),
            additionalInfo: additionalInfo ?? null,
            expense: Math.round(totalExpenses),
            items: { create: itemCreates },
          },
        })
        await tx.process.update({
          where: { processID: existingRequest.processID },
          data: { status: 'UNDER_REVIEW' },
        })
        return { request }
      }

      const process = await tx.process.create({ data: { status: 'UNDER_REVIEW' } })
      const request = await tx.request.create({
        data: {
          dateNeeded: new Date(dateNeeded),
          additionalInfo: additionalInfo ?? null,
          expense: Math.round(totalExpenses),
          projectID: project.projectID,
          studentID: user.id,
          processID: process.processID,
          items: { create: itemCreates },
        },
      })
      return { request }
    })

    if (existingRequest) {
      // Recompute from scratch: handles both rejected (expense was removed) and
      // changes-requested (old expense still counted) resubmissions correctly
      await recalcProjectExpenses(prisma, project.projectID)
    } else {
      await addExpenseToProject(prisma, project.projectID, totalExpenses)
    }

    const mentors = await prisma.worksOn.findMany({
      where: { projectID: project.projectID, endDate: null },
      include: { user: true },
    })
    const mentorEmails = mentors.filter(w => w.user.role === ROLES.MENTOR).map(w => w.user.email)
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
