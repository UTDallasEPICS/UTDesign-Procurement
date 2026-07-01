import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { prisma } from '~/server/utils/prisma'
import { addExpenseToProject } from '~/server/utils/budget'
import { sendEmail, templateReimbursementSubmitted } from '~/server/utils/email'
import { ITEM_CATEGORIES, OTHER_CATEGORY, JUSTIFICATION_REQUIRED_CATEGORIES } from '~/shared/constants/categories'
import { ROLES } from '~/shared/constants/roles'

const UPLOAD_DIR = join(process.cwd(), 'uploads', 'receipts')

interface ReimbursementItemInput {
  receiptDate: string
  description: string
  unitPrice: number
  quantity: number
  category: string
  otherCategoryDescription?: string
  justification?: string
  url?: string
  vendorID: number | string
  newVendorName?: string
  newVendorEmail?: string
  newVendorURL?: string
  fileName?: string
  fileData?: string // base64
}

/** POST /api/reimbursement — student submits a new reimbursement request */
export default defineEventHandler(async event => {
  try {
    const { projectNum, items, additionalInfo, totalExpenses } = await readBody(event)
    const user = event.context.user

    if (user.role !== ROLES.STUDENT) throw createError({ statusCode: 403, message: 'Students only' })

    const project = await prisma.project.findUnique({ where: { projectNum } })
    if (!project) throw createError({ statusCode: 404, message: 'Project not found' })

    if (!Array.isArray(items) || items.length === 0) {
      throw createError({ statusCode: 400, message: 'At least one receipt item is required' })
    }

    for (const item of items as ReimbursementItemInput[]) {
      if (!ITEM_CATEGORIES.includes(item.category as (typeof ITEM_CATEGORIES)[number])) {
        throw createError({ statusCode: 400, message: `Invalid category: ${item.category}` })
      }
      if (item.category === OTHER_CATEGORY && !item.otherCategoryDescription?.trim()) {
        throw createError({ statusCode: 400, message: 'A description is required when category is Other' })
      }
      const needsJustification =
        JUSTIFICATION_REQUIRED_CATEGORIES.includes(item.category as (typeof ITEM_CATEGORIES)[number]) ||
        !!item.url?.trim()
      if (needsJustification && !item.justification?.trim()) {
        throw createError({
          statusCode: 400,
          message: `A justification is required for ${item.category} items or items with a vendor quote/URL`,
        })
      }
    }

    // At least one receipt file must be attached to the submission
    if (!(items as ReimbursementItemInput[]).some(i => i.fileData && i.fileName)) {
      throw createError({ statusCode: 400, message: 'At least one receipt must be uploaded' })
    }

    // Create any new vendors inline, and persist uploaded receipt files
    await mkdir(UPLOAD_DIR, { recursive: true })
    const resolvedItems = await Promise.all(
      (items as ReimbursementItemInput[]).map(async item => {
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

        let uploadID: number | null = null
        if (item.fileData && item.fileName) {
          const safeName = item.fileName.replace(/[^\w.\-]/g, '_')
          const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`
          const filePath = join(UPLOAD_DIR, fileName)
          const base64 = item.fileData.replace(/^data:[^;]+;base64,/, '')
          await writeFile(filePath, Buffer.from(base64, 'base64'))
          const upload = await prisma.reimbursementUpload.create({
            data: { attachmentPath: filePath, attachmentName: item.fileName },
          })
          uploadID = upload.uploadID
        }

        return { ...item, vendorID: Number(vendorID), uploadID }
      }),
    )

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
            create: resolvedItems.map(item => ({
              receiptDate: new Date(item.receiptDate),
              description: item.description,
              unitPrice: Number(item.unitPrice),
              quantity: Number(item.quantity) || 1,
              category: item.category,
              otherCategoryDescription: item.otherCategoryDescription?.trim() || null,
              justification: item.justification?.trim() || null,
              url: item.url?.trim() || null,
              vendorID: item.vendorID,
              uploadID: item.uploadID,
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
    const mentorEmails = mentors.filter(w => w.user.role === ROLES.MENTOR).map(w => w.user.email)
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
