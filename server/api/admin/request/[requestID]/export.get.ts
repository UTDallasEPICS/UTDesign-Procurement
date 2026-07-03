import * as XLSX from 'xlsx/xlsx.mjs'
import { ROLES } from '~/shared/constants/roles'
import { prisma } from '~/server/utils/prisma'

/** GET /api/admin/request/:requestID/export — downloadable XLSX of a single procurement request */
export default defineEventHandler(async event => {
  if (event.context.role !== ROLES.ADMIN) throw createError({ statusCode: 403, message: 'Admin only' })

  try {
    const requestID = Number(getRouterParam(event, 'requestID'))
    const request = await prisma.request.findUnique({
      where: { requestID },
      include: {
        project: true,
        student: true,
        process: true,
        items: { include: { vendor: true } },
        orders: true,
      },
    })
    if (!request) throw createError({ statusCode: 404, message: 'Request not found' })

    const itemsTotal = request.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0)
    const shippingTotal = request.orders.reduce((sum, o) => sum + o.shippingCost, 0)

    const header = [
      ['UTDesign Procurement — Request Export'],
      [],
      ['Request #', request.requestID],
      ['Status', request.process.status],
      ['Project', `${request.project.projectNum} — ${request.project.projectTitle}`],
      ['Sponsor', request.project.sponsorCompany],
      ['Student', `${request.student.firstName} ${request.student.lastName}`],
      ['Student Email', request.student.email],
      ['Date Submitted', request.dateSubmitted.toISOString().slice(0, 10)],
      ['Date Needed', request.dateNeeded.toISOString().slice(0, 10)],
      [],
      ['Description', 'Part Number', 'Category', 'Justification', 'Vendor', 'Qty', 'Unit Price', 'Line Total', 'URL'],
    ]

    const itemRows = request.items.map(i => [
      i.description,
      i.partNumber,
      i.category === 'Other' && i.otherCategoryDescription ? `Other (${i.otherCategoryDescription})` : i.category,
      i.justification,
      i.vendor.vendorName,
      i.quantity,
      i.unitPrice,
      i.quantity * i.unitPrice,
      i.url,
    ])

    const footer: (string | number)[][] = [
      [],
      ['', '', '', '', '', '', 'Items Total', itemsTotal],
    ]
    if (shippingTotal > 0) {
      footer.push(['', '', '', '', '', '', 'Shipping', shippingTotal])
      footer.push(['', '', '', '', '', '', 'Grand Total', itemsTotal + shippingTotal])
    }
    for (const order of request.orders) {
      footer.push(['Order', order.orderNumber, order.trackingInfo, '', '', '', 'Shipping', order.shippingCost])
    }

    const ws = XLSX.utils.aoa_to_sheet([...header, ...itemRows, ...footer])
    ws['!cols'] = [{ wch: 40 }, { wch: 16 }, { wch: 22 }, { wch: 40 }, { wch: 22 }, { wch: 6 }, { wch: 12 }, { wch: 12 }, { wch: 40 }]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, `Request ${request.requestID}`)
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer

    setHeader(event, 'Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    setHeader(event, 'Content-Disposition', `attachment; filename="request-${request.requestID}.xlsx"`)
    return buffer
  } catch (err: unknown) {
    if ((err as { statusCode?: number }).statusCode) throw err
    throw createError({ statusCode: 500, message: 'Internal server error' })
  }
})
