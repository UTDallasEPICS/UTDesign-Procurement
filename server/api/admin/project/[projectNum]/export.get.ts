import * as XLSX from 'xlsx/xlsx.mjs'
import { ROLES } from '~/shared/constants/roles'
import { prisma } from '~/server/utils/prisma'

/** GET /api/admin/project/:projectNum/export — downloadable XLSX of all orders for a project */
export default defineEventHandler(async event => {
  if (event.context.role !== ROLES.ADMIN) throw createError({ statusCode: 403, message: 'Admin only' })

  try {
    const projectNum = getRouterParam(event, 'projectNum')!
    const project = await prisma.project.findUnique({
      where: { projectNum },
      include: {
        requests: { include: { process: true, student: true } },
        reimbursements: { include: { process: true, student: true } },
      },
    })
    if (!project) throw createError({ statusCode: 404, message: 'Project not found' })

    const rows = [
      [`UTDesign Procurement — ${project.projectNum} ${project.projectTitle}`],
      [`Sponsor: ${project.sponsorCompany}`, `Budget: $${project.startingBudget}`, `Expenses: $${project.totalExpenses}`],
      [],
      ['Order ID', 'Type', 'Status', 'Date Created', 'Student', 'Total Cost'],
      ...project.requests.map(r => [
        r.requestID,
        'Request',
        r.process.status,
        r.dateSubmitted.toISOString().slice(0, 10),
        `${r.student.firstName} ${r.student.lastName}`,
        r.expense,
      ]),
      ...project.reimbursements.map(r => [
        r.reimbursementID,
        'Reimbursement',
        r.process.status,
        r.dateSubmitted.toISOString().slice(0, 10),
        `${r.student.firstName} ${r.student.lastName}`,
        r.expense,
      ]),
    ]

    const ws = XLSX.utils.aoa_to_sheet(rows)
    ws['!cols'] = [{ wch: 10 }, { wch: 15 }, { wch: 20 }, { wch: 14 }, { wch: 24 }, { wch: 12 }]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Orders')
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer

    setHeader(event, 'Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    setHeader(event, 'Content-Disposition', `attachment; filename="project-${project.projectNum}-orders.xlsx"`)
    return buffer
  } catch (err: unknown) {
    if ((err as { statusCode?: number }).statusCode) throw err
    throw createError({ statusCode: 500, message: 'Internal server error' })
  }
})
