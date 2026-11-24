import ExcelJS from 'exceljs'
import prisma from '~~/server/utils/prisma'
import { ROLES } from '~~/shared/constants/roles'

/**
 * GET /api/admin/project/:projectNum/export
 *
 * Generates a UTDesign Procurement Request XLSX for a project.
 *
 * - One worksheet per approved request (request.dateApproved is set).
 * - If the project has no approved requests, one sheet is generated with
 *   only the project/advisor info filled in.
 * - The item table starts with 10 rows and grows when a request has more
 *   items; everything below it shifts down accordingly.
 * - Column H ("Order #" / "Office Only") and the approval section
 *   (rows 25+ in the 10-item layout) are intentionally left blank.
 */

// ================================================================
// DATA
// ================================================================

// Same shape as GET /api/project/:projectNum, trimmed to what the sheet uses.
const loadProjectForUser = (userID: string) =>
  prisma.project.findFirst({
    where: {
      worksOn: { some: { userID, endDate: null } },
    },
    include: {
      worksOn: { include: { user: true } },
      requests: {
        orderBy: { dateSubmitted: 'asc' },
        include: { items: true, student: true },
      },
    },
  })

type ProjectData = NonNullable<
   Awaited<ReturnType<typeof loadProjectForUser>>
 >
type RequestData = ProjectData['requests'][number]

// ================================================================
// CONSTANTS
// ================================================================

const COLORS = {
  ORANGE: 'E87500',
  DARK_GREEN: '4F6228',
  LIGHT_GREEN: 'D8E4BC',
  WHITE: 'FFFFFF',
  BLACK: '000000',
  GRAY: '808080',
  YELLOW: 'FFFF99',
  H12: 'F5F8EE',
  LINK: '0563C1',
}

const FIRST_ITEM_ROW = 13
const TEMPLATE_ITEM_ROWS = 10

const argb = (hex: string) => ({ argb: `FF${hex}` })

const side = (style: 'thin' | 'dotted') => ({
  style,
  color: argb(COLORS.GRAY),
})

const solidBorder = {
  top: side('thin'),
  bottom: side('thin'),
  left: side('thin'),
  right: side('thin'),
}

const dottedBorder = {
  top: side('dotted'),
  bottom: side('dotted'),
  left: side('dotted'),
  right: side('dotted'),
}

// ================================================================
// STYLE HELPERS
// ================================================================

const fill = (hex: string): ExcelJS.Fill => ({
  type: 'pattern',
  pattern: 'solid',
  fgColor: argb(hex),
})

const font = (
  size: number,
  extra: Partial<ExcelJS.Font> = {},
): Partial<ExcelJS.Font> => ({
  name: 'Arial',
  size,
  color: argb(COLORS.BLACK),
  ...extra,
})

const align = (
  horizontal: ExcelJS.Alignment['horizontal'] = 'left',
  vertical: ExcelJS.Alignment['vertical'] = 'middle',
  wrapText = true,
): Partial<ExcelJS.Alignment> => ({ horizontal, vertical, wrapText })

// Row 3 / 5 / 7 / 9 — green label cells
const LABEL_STYLE: Partial<ExcelJS.Style> = {
  font: font(9, { bold: true }),
  fill: fill(COLORS.LIGHT_GREEN),
  border: {
    top: solidBorder.top,
    left: solidBorder.left,
    right: solidBorder.right,
  },
  alignment: align(),
}

// Row 4 / 6 / 8 — white input cells
const INPUT_STYLE: Partial<ExcelJS.Style> = {
  font: font(9),
  fill: fill(COLORS.WHITE),
  border: {
    left: solidBorder.left,
    right: solidBorder.right,
  },
  alignment: align(),
}

function style(
  ws: ExcelJS.Worksheet,
  addresses: string[],
  s: Partial<ExcelJS.Style>,
) {
  for (const address of addresses) {
    Object.assign(ws.getCell(address), s)
  }
}

/** ['A3', 'B3', ... 'G3'] */
function rowCells(row: number, from = 'A', to = 'G') {
  const out: string[] = []
  for (
    let c = from.charCodeAt(0);
    c <= to.charCodeAt(0);
    c++
  ) {
    out.push(`${String.fromCharCode(c)}${row}`)
  }
  return out
}

// ================================================================
// TEXT / HEIGHT HELPERS
// ================================================================

// Excel does not auto-fit merged cells or rows with fixed heights,
// so estimate how many lines the text needs.
function estimateLines(text: string, charsPerLine: number) {
  if (!text) return 0
  return text
    .split('\n')
    .reduce(
      (sum, line) =>
        sum + Math.max(1, Math.ceil(line.length / charsPerLine)),
      0,
    )
}

function rowHeight(
  lines: number,
  lineHeight: number,
  min: number,
) {
  return Math.min(409, Math.max(min, lines * lineHeight + 3))
}

function buildJustification(items: RequestData['items']) {
  const entries = items
    .map((item, i) => ({
      n: i + 1,
      text: (item.justification ?? '').trim(),
    }))
    .filter(e => e.text)

  if (!entries.length) return ''

  // Same justification on every item → show it once.
  if (new Set(entries.map(e => e.text)).size === 1) {
    return entries[0]!.text
  }

  return entries.map(e => `${e.n}. ${e.text}`).join('\n')
}

function safeSheetName(requestID: unknown) {
  return `Request ${requestID}`
    .replace(/[\\/?*[\]:]/g, '-')
    .slice(0, 31)
}

// ================================================================
// SHEET BUILDER
// ================================================================

function buildSheet(
  workbook: ExcelJS.Workbook,
  name: string,
  project: ProjectData,
  request: RequestData | null,
) {
  const ws = workbook.addWorksheet(name)

  ws.views = [{ showGridLines: false }]

  const items = request?.items ?? []

  // Item table grows past the template's 10 rows when needed;
  // every row below it is positioned relative to the last item row.
  const extra = Math.max(0, items.length - TEMPLATE_ITEM_ROWS)
  const lastItemRow = FIRST_ITEM_ROW + TEMPLATE_ITEM_ROWS - 1 + extra
  const totalRow = lastItemRow + 1
  const advisorRow = totalRow + 3
  const approvalHeaderRow = advisorRow + 1
  const approvalInputRow = approvalHeaderRow + 1

  // ----------------------------------------------------------------
  // Derived data
  // ----------------------------------------------------------------

  const mentors = project.worksOn
    .filter(w => !w.endDate && w.user.role === ROLES.MENTOR)
    .map(w => w.user)

  const mentorNames = mentors.map(m => m.name).join(', ')
  const mentorEmails = mentors.map(m => m.email).join(', ')

  const justification = buildJustification(items)
  const additionalInfo = request?.additionalInfo ?? ''

  // ----------------------------------------------------------------
  // Column widths
  // ----------------------------------------------------------------

  ws.columns = [
    { key: 'A', width: 7.57 },
    { key: 'B', width: 42.57 },
    { key: 'C', width: 53.29 },
    { key: 'D', width: 10.43 },
    { key: 'E', width: 4.43 },
    { key: 'F', width: 7.43 },
    { key: 'G', width: 7.71 },
    { key: 'H', width: 16.57 },
  ]

  // ----------------------------------------------------------------
  // Row heights
  // ----------------------------------------------------------------

  const heights: Record<number, number> = {
    1: 45.75,
    2: 12.75,
    3: 12,
    4: 12,
    5: 12,
    6: 12.75,
    7: 12,
    8: 12.75,
    9: 12,
    10: rowHeight(
      Math.max(
        estimateLines(justification, 55),
        estimateLines(additionalInfo, 90),
      ),
      12,
      12.75,
    ),
    11: 22,
  }

  for (const [row, height] of Object.entries(heights)) {
    ws.getRow(Number(row)).height = height
  }

  for (let row = 12; row <= lastItemRow; row++) {
    ws.getRow(row).height = 25.5
  }

  for (let row = totalRow; row <= advisorRow; row++) {
    ws.getRow(row).height = 16.5
  }

  ws.getRow(approvalHeaderRow).height = 12
  ws.getRow(approvalInputRow).height = 15.75

  // ----------------------------------------------------------------
  // Row 1 — title
  // ----------------------------------------------------------------

  ws.mergeCells('A1:H1')

  const title = ws.getCell('A1')
  title.value = 'UTDesign Procurement Request'
  title.font = {
    name: 'Britannic Bold',
    size: 36,
    bold: true,
    color: argb(COLORS.ORANGE),
  }
  title.alignment = align('left', 'middle', false)

  // ----------------------------------------------------------------
  // Row 2 — instructions (yellow)
  // ----------------------------------------------------------------

  ws.mergeCells('A2:G2')

  const instructions = ws.getCell('A2')
  instructions.value =
    'Students: Complete all fields and submit to project advisor/mentor for approval. Faculty Advisor/Team Mentor: Forward the approved Excel file to utdesign@utdallas.edu.'
  instructions.font = font(9, { italic: true })
  instructions.fill = fill(COLORS.YELLOW)
  instructions.alignment = align()

  // ----------------------------------------------------------------
  // Rows 3–4 — project
  // ----------------------------------------------------------------

  ws.getCell('A3').value = 'Dept.'
  ws.getCell('B3').value = 'Project Number'
  ws.getCell('C3').value = 'Project Title'
  ws.mergeCells('C3:G3')
  style(ws, rowCells(3), LABEL_STYLE)

  ws.mergeCells('C4:G4')
  style(ws, rowCells(4), INPUT_STYLE)

  ws.getCell('A4').value = project.projectType
  ws.getCell('B4').value = project.projectNum
  ws.getCell('C4').value = project.projectTitle

  // ----------------------------------------------------------------
  // Rows 5–6 — student requestor
  // ----------------------------------------------------------------

  ws.getCell('A5').value = 'Student Requestor'
  ws.getCell('C5').value = "Student Requestor's UTD Email"
  ws.getCell('D5').value = 'Date Requested'
  ws.getCell('F5').value = 'Date Needed'

  ws.mergeCells('A5:B5')
  ws.mergeCells('D5:E5')
  ws.mergeCells('F5:G5')
  style(ws, rowCells(5), LABEL_STYLE)
  ws.getCell('D5').alignment = align('center')
  ws.getCell('F5').alignment = align('center')

  ws.mergeCells('A6:B6')
  ws.mergeCells('D6:E6')
  ws.mergeCells('F6:G6')
  style(ws, rowCells(6), INPUT_STYLE)
  ws.getCell('D6').alignment = align('center')
  ws.getCell('F6').alignment = align('center')

  if (request) {
    ws.getCell('A6').value = request.student?.name ?? ''
    ws.getCell('C6').value = request.student?.email ?? ''

    ws.getCell('D6').value = request.dateSubmitted
    ws.getCell('D6').numFmt = 'm/d/yyyy'

    ws.getCell('F6').value = request.dateNeeded
    ws.getCell('F6').numFmt = 'm/d/yyyy'
  }

  // ----------------------------------------------------------------
  // Rows 7–8 — faculty advisor / sponsor
  // ----------------------------------------------------------------

  ws.getCell('A7').value = 'Faculty Advisor/Team Mentor'
  ws.getCell('C7').value = "Advisor/Mentor's Email"
  ws.getCell('D7').value = 'Sponsoring Company/Lab'

  ws.mergeCells('A7:B7')
  ws.mergeCells('D7:G7')
  style(ws, rowCells(7), LABEL_STYLE)
  ws.getCell('D7').alignment = align('center')

  // A8 is only 7.57 wide, so merge A8:B8 for the mentor name(s).
  ws.mergeCells('A8:B8')
  ws.mergeCells('D8:G8')
  style(ws, rowCells(8), INPUT_STYLE)
  ws.getCell('D8').alignment = align('center')

  ws.getCell('A8').value = mentorNames
  ws.getCell('C8').value = mentorEmails
  ws.getCell('D8').value = project.sponsorCompany ?? ''

  // ----------------------------------------------------------------
  // Rows 9–10 — expense justification / additional information
  // ----------------------------------------------------------------

  ws.getCell('A9').value = 'Expense Justification'
  ws.getCell('C9').value = 'Additional Information'

  ws.mergeCells('A9:B9')
  ws.mergeCells('C9:G9')
  style(ws, rowCells(9), LABEL_STYLE)

  ws.mergeCells('A10:B10')
  ws.mergeCells('C10:G10')
  style(ws, rowCells(10), {
    font: font(9),
    fill: fill(COLORS.WHITE),
    border: {
      bottom: solidBorder.bottom,
      left: solidBorder.left,
      right: solidBorder.right,
    },
    alignment: align('left', 'top'),
  })

  ws.getCell('A10').value = justification
  ws.getCell('C10').value = additionalInfo

  // Column H next to the top section has no styling.
  for (let row = 3; row <= 10; row++) {
    ws.getCell(`H${row}`).style = {}
  }

  // ----------------------------------------------------------------
  // Row 11 — office only
  // ----------------------------------------------------------------

  ws.getCell('H11').value = 'Office Only:'

  style(ws, ['F11', 'G11', 'H11'], {
    font: font(10, { italic: true }),
    alignment: align('left', 'middle', false),
  })

  // ----------------------------------------------------------------
  // Row 12 — item table header
  // ----------------------------------------------------------------

  const headers = [
    'Item #',
    'Item Description (incl. length, color etc.)',
    'Item Link (URL)',
    'Part No.',
    'Qty.',
    'Unit Cost',
    'Total',
    'Order #',
  ]

  headers.forEach((header, index) => {
    const cell = ws.getRow(12).getCell(index + 1)

    cell.value = header
    cell.font = font(10, {
      bold: true,
      color: argb(COLORS.WHITE),
    })
    cell.fill = fill(COLORS.DARK_GREEN)
    cell.border = solidBorder
    cell.alignment = align()
  })

  // H12 has a special color.
  ws.getCell('H12').fill = fill(COLORS.H12)
  ws.getCell('H12').font = font(10, { bold: true })

  // ----------------------------------------------------------------
  // Item rows (13 → lastItemRow)
  // ----------------------------------------------------------------

  let grandTotal = 0

  for (let row = FIRST_ITEM_ROW; row <= lastItemRow; row++) {
    const index = row - FIRST_ITEM_ROW
    const item = items[index]

    ws.getCell(`A${row}`).value = index + 1

    for (let col = 1; col <= 8; col++) {
      const cell = ws.getRow(row).getCell(col)

      cell.font = font(10)
      cell.fill = fill(COLORS.WHITE)

      // Column H is dotted, everything else is solid.
      cell.border = col === 8 ? dottedBorder : solidBorder
      cell.alignment = align()
    }

    ws.getCell(`F${row}`).numFmt = '$0.00'
    ws.getCell(`G${row}`).numFmt = '$0.00'

    if (!item) continue

    const description = item.description ?? ''
    const url = (item.url ?? '').trim()
    const lineTotal =
      Math.round(item.quantity * item.unitPrice * 100) / 100

    grandTotal += lineTotal

    ws.getCell(`B${row}`).value = description

    if (url) {
      const link = ws.getCell(`C${row}`)

      if (/^https?:\/\//i.test(url)) {
        link.value = { text: url, hyperlink: url }
        link.font = font(10, {
          color: argb(COLORS.LINK),
          underline: true,
        })
      } else {
        link.value = url
      }
    }

    ws.getCell(`D${row}`).value = item.partNumber ?? ''
    ws.getCell(`E${row}`).value = item.quantity
    ws.getCell(`F${row}`).value = item.unitPrice
    ws.getCell(`G${row}`).value = {
      formula: `E${row}*F${row}`,
      result: lineTotal,
    }

    ws.getRow(row).height = rowHeight(
      Math.max(
        estimateLines(description, 44),
        estimateLines(url, 55),
      ),
      13,
      25.5,
    )
  }

  // ----------------------------------------------------------------
  // Grand total
  // ----------------------------------------------------------------

  ws.mergeCells(`A${totalRow}:D${totalRow}`)
  ws.getCell(`E${totalRow}`).value = 'Grand Total'

  style(ws, rowCells(totalRow, 'A', 'H'), {
    font: font(10, { bold: true }),
    fill: fill(COLORS.WHITE),
    alignment: align('left', 'middle', false),
  })

  const totalCell = ws.getCell(`G${totalRow}`)

  totalCell.font = font(10, { bold: true })
  totalCell.fill = fill(COLORS.WHITE)
  totalCell.border = solidBorder
  totalCell.alignment = align('center', 'middle', false)
  totalCell.numFmt = '$0.00'
  totalCell.value = {
    formula: `SUM(G${FIRST_ITEM_ROW}:G${lastItemRow})`,
    result: Math.round(grandTotal * 100) / 100,
  }

  // ----------------------------------------------------------------
  // Faculty advisor / UTDesign office (left blank on purpose)
  // ----------------------------------------------------------------

  ws.mergeCells(`A${advisorRow}:C${advisorRow}`)
  ws.getCell(`A${advisorRow}`).value =
    'Faculty Advisor/Team Mentor Only:'

  const approvalTitleStyle: Partial<ExcelJS.Style> = {
    font: font(11, { bold: true, italic: true }),
    alignment: align('left', 'middle', false),
  }

  style(ws, rowCells(advisorRow, 'A', 'D'), approvalTitleStyle)

  ws.mergeCells(`D${advisorRow}:H${advisorRow}`)
  ws.getCell(`D${advisorRow}`).value = 'UTDesign Office Only:'

  style(
    ws,
    [`F${advisorRow}`, `G${advisorRow}`, `H${advisorRow}`],
    approvalTitleStyle,
  )

  // Approval headers
  ws.mergeCells(`E${approvalHeaderRow}:F${approvalHeaderRow}`)
  ws.mergeCells(`E${approvalInputRow}:F${approvalInputRow}`)

  ws.getCell(`A${approvalHeaderRow}`).value = 'Date'
  ws.getCell(`B${approvalHeaderRow}`).value = 'Approved by'
  ws.getCell(`D${approvalHeaderRow}`).value = 'Received'
  ws.getCell(`E${approvalHeaderRow}`).value = 'Buyer'
  ws.getCell(`G${approvalHeaderRow}`).value = 'Ordered'

  style(
    ws,
    ['A', 'B', 'D', 'E', 'G'].map(c => `${c}${approvalHeaderRow}`),
    {
      font: font(10, { bold: true }),
      fill: fill(COLORS.LIGHT_GREEN),
      border: solidBorder,
      alignment: align(),
    },
  )

  ws.getCell(`E${approvalHeaderRow}`).alignment = align('center')

  // C of the header row has no styling.
  ws.getCell(`C${approvalHeaderRow}`).style = {}

  // Approval input area
  style(
    ws,
    ['A', 'B', 'C', 'D', 'F', 'G'].map(c => `${c}${approvalInputRow}`),
    {
      fill: fill(COLORS.WHITE),
      border: solidBorder,
      alignment: align(),
    },
  )

  // C keeps all borders except the top one.
  ws.getCell(`C${approvalInputRow}`).border = {
    bottom: solidBorder.bottom,
    left: solidBorder.left,
    right: solidBorder.right,
  }

  ws.getCell(`E${approvalInputRow}`).alignment = align('center')

  // ----------------------------------------------------------------
  // Page setup
  // ----------------------------------------------------------------

  ws.pageSetup = {
    orientation: 'landscape',
    paperSize: 9,
    fitToPage: true,
    fitToWidth: 1,
    // Keep one page for the standard layout; let long requests paginate.
    fitToHeight: extra > 0 ? 0 : 1,
    horizontalDpi: 300,
    verticalDpi: 300,
    margins: {
      left: 0.25,
      right: 0.25,
      top: 0.4,
      bottom: 0.4,
      header: 0.2,
      footer: 0.2,
    },
  }

  ws.printArea = `A1:H${approvalInputRow}`

  return ws
}

// ================================================================
// HANDLER
// ================================================================

export default defineEventHandler(async event => {
  const userID = event.context.user?.id as string | undefined

  if (!userID) {
    throw createError({ statusCode: 401, message: 'Not signed in' })
  }

  try {
    const project = await loadProjectForUser(userID)
    if (!project) {
      throw createError({
        statusCode: 404,
        message: 'Project not found',
      })
    }

    const approvedRequests = project.requests.filter(
      r => r.dateApproved,
    )

    const workbook = new ExcelJS.Workbook()

    workbook.creator = 'UTDesign'
    workbook.lastModifiedBy = 'UTDesign'
    workbook.created = new Date()
    workbook.modified = new Date()

    if (approvedRequests.length) {
      for (const request of approvedRequests) {
        buildSheet(
          workbook,
          safeSheetName(request.requestID),
          project,
          request,
        )
      }
    } else {
      buildSheet(workbook, 'Procurement Request', project, null)
    }

    const buffer = await workbook.xlsx.writeBuffer()

    const fileSafeNum = project.projectNum.replace(
      /[^a-zA-Z0-9_-]/g,
      '-',
    )

    setHeader(
      event,
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )

    setHeader(
      event,
      'Content-Disposition',
      `attachment; filename="utdesign-procurement-requests-${fileSafeNum}.xlsx"`,
    )

    return Buffer.from(buffer)
  } catch (err: unknown) {
    if ((err as { statusCode?: number }).statusCode) {
      throw err
    }

    console.error(
      'Failed to generate procurement request:',
      err,
    )

    throw createError({
      statusCode: 500,
      message: 'Internal server error',
    })
  }
})