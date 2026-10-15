import ExcelJS from 'exceljs'
import { ROLES } from '~~/shared/constants/roles'

/**
 * GET /api/admin/project/:projectNum/export
 *
 * Generates a blank UTDesign Procurement Request XLSX template.
 *
 * Project/request/student-specific data is intentionally
 * commented out for now.
 */
export default defineEventHandler(async (event) => {
  if (event.context.role !== ROLES.ADMIN) {
    throw createError({
      statusCode: 403,
      message: 'Admin only',
    })
  }

  try {
    const requestIDParam = getRouterParam(event, 'requestID')
    const requestID = Number(requestIDParam)

    if (
      !requestIDParam ||
      !Number.isInteger(requestID) ||
      requestID <= 0
    ) {
      throw createError({
        statusCode: 400,
        message: 'Invalid request ID',
      })
    }

    const request = await prisma.request.findUnique({
      where: { requestID },
      include: {
        process: true,
        student: true,
        project: true,
        items: {
          include: {
            vendor: true,
          },
        },
        orders: true,
      },
    })

    if (!request) {
      throw createError({
        statusCode: 404,
        message: 'Procurement request not found',
      })
    }

    // ================================================================
    // COLORS
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
    }

    // ================================================================
    // BORDERS
    // ================================================================

    const solidBorder = {
      top: {
        style: 'thin' as const,
        color: {
          argb: `FF${COLORS.GRAY}`,
        },
      },
      bottom: {
        style: 'thin' as const,
        color: {
          argb: `FF${COLORS.GRAY}`,
        },
      },
      left: {
        style: 'thin' as const,
        color: {
          argb: `FF${COLORS.GRAY}`,
        },
      },
      right: {
        style: 'thin' as const,
        color: {
          argb: `FF${COLORS.GRAY}`,
        },
      },
    }

    const dottedBorder = {
      top: {
        style: 'dotted' as const,
        color: {
          argb: `FF${COLORS.GRAY}`,
        },
      },
      bottom: {
        style: 'dotted' as const,
        color: {
          argb: `FF${COLORS.GRAY}`,
        },
      },
      left: {
        style: 'dotted' as const,
        color: {
          argb: `FF${COLORS.GRAY}`,
        },
      },
      right: {
        style: 'dotted' as const,
        color: {
          argb: `FF${COLORS.GRAY}`,
        },
      },
    }


    const workbook = new ExcelJS.Workbook()

    workbook.creator = 'UTDesign'
    workbook.lastModifiedBy = 'UTDesign'
    workbook.created = new Date()
    workbook.modified = new Date()

    const worksheet = workbook.addWorksheet(
      'Procurement Request',
    )

    worksheet.views = [
      {
        showGridLines: false,
      },
    ]

    // ================================================================
    // COLUMN WIDTHS
    // ================================================================

    worksheet.columns = [
      { key: 'A', width: 7.57 },
      { key: 'B', width: 42.57 },
      { key: 'C', width: 53.29 },
      { key: 'D', width: 10.43 },
      { key: 'E', width: 4.43 },
      { key: 'F', width: 7.43 },
      { key: 'G', width: 7.71 },
      { key: 'H', width: 16.57 },
    ]

    // ================================================================
    // ROW HEIGHTS
    // ================================================================

    worksheet.getRow(1).height = 45.75
    worksheet.getRow(2).height = 12.75
    worksheet.getRow(3).height = 12
    worksheet.getRow(4).height = 12
    worksheet.getRow(5).height = 12
    worksheet.getRow(6).height = 12.75
    worksheet.getRow(7).height = 12
    worksheet.getRow(8).height = 12.75
    worksheet.getRow(9).height = 12
    worksheet.getRow(10).height = 12.75
    worksheet.getRow(11).height = 22

    // Rows 12–22
    for (let row = 12; row <= 22; row++) {
      worksheet.getRow(row).height = 25.5
    }

    // Rows 23–26
    for (let row = 23; row <= 26; row++) {
      worksheet.getRow(row).height = 16.5
    }

    worksheet.getRow(27).height = 12
    worksheet.getRow(28).height = 15.75

    worksheet.mergeCells('A2:G2')

    const instructions = worksheet.getCell('A2')

    instructions.value =
      'Students: Complete all fields and submit to project advisor/mentor for approval. Faculty Advisor/Team Mentor: Forward the approved Excel file to utdesign@utdallas.edu.'

    instructions.font = {
      name: 'Arial',
      size: 9,
      italic: true,
      color: {
        argb: `FF${COLORS.BLACK}`,
      },
    }

    instructions.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: {
        argb: `FF${COLORS.YELLOW}`,
      },
    }

    instructions.alignment = {
      horizontal: 'left',
      vertical: 'middle',
      wrapText: true,
    }

    // ================================================================
    // TITLE
    // ================================================================

    worksheet.mergeCells('A1:H1')

    const title = worksheet.getCell('A1')

    title.value = 'UTDesign Procurement Request'

    title.font = {
      name: 'Britannic Bold',
      size: 36,
      bold: true,
      color: {
        argb: `FF${COLORS.ORANGE}`,
      },
    }

    title.alignment = {
      horizontal: 'left',
      vertical: 'middle',
    }

    // ================================================================
    // TOP INFORMATION SECTION
    // ================================================================

    // ================================================================
    // ROW 3 — PROJECT LABELS
    // ================================================================

    worksheet.getCell('A3').value = 'Dept.'
    worksheet.getCell('B3').value = 'Project Number'
    worksheet.getCell('C3').value = 'Project Title'

    worksheet.mergeCells('C3:G3')

    for (const cellAddress of [
      'A3',
      'B3',
      'C3',
      'D3',
      'E3',
      'F3',
      'G3',
    ]) {
      const cell = worksheet.getCell(cellAddress)

      cell.font = {
        name: 'Arial',
        size: 9,
        bold: true,
        color: {
          argb: `FF${COLORS.BLACK}`,
        },
      }

      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
          argb: `FF${COLORS.LIGHT_GREEN}`,
        },
      }

      cell.border = {
        top: solidBorder.top,
        left: solidBorder.left,
        right: solidBorder.right,
      }

      cell.alignment = {
        horizontal: 'left',
        vertical: 'middle',
        wrapText: true,
      }
    }

    // ================================================================
    // ROW 4 — PROJECT INPUTS
    // ================================================================

    worksheet.mergeCells('C4:G4')

    for (const cellAddress of [
      'A4',
      'B4',
      'C4',
      'D4',
      'E4',
      'F4',
      'G4',
    ]) {
      const cell = worksheet.getCell(cellAddress)

      cell.font = {
        name: 'Arial',
        size: 9,
        color: {
          argb: `FF${COLORS.BLACK}`,
        },
      }

      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
          argb: `FF${COLORS.WHITE}`,
        },
      }

      cell.border = {
      left: solidBorder.left,
      right: solidBorder.right,
      }

      cell.alignment = {
        horizontal: 'left',
        vertical: 'middle',
        wrapText: true,
      }
    }

    // ================================================================
    // FUTURE PROJECT DATA
    // ================================================================
    //
     worksheet.getCell('A4').value = request.project?.department ?? ''
     worksheet.getCell('B4').value = request.project?.projectNum ?? ''
     worksheet.getCell('C4').value = request.project?.projectTitle ?? ''

    // ================================================================
    // STUDENT REQUESTOR
    // ================================================================

    // ================================================================
    // ROW 5 — LABELS
    // ================================================================

    worksheet.getCell('A5').value = 'Student Requestor'
    worksheet.getCell('C5').value =
      "Student Requestor's UTD Email"
    worksheet.getCell('D5').value = 'Date Requested'
    worksheet.getCell('F5').value = 'Date Needed'

    worksheet.mergeCells('A5:B5')
    worksheet.mergeCells('A7:B7')
    worksheet.mergeCells('D5:E5')
    worksheet.mergeCells('F5:G5')

    for (const cellAddress of [
      'A5',
      'B5',
      'C5',
      'D5',
      'E5',
      'F5',
      'G5',
    ]) {
      const cell = worksheet.getCell(cellAddress)

      cell.font = {
        name: 'Arial',
        size: 9,
        bold: true,
        color: {
          argb: `FF${COLORS.BLACK}`,
        },
      }

      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
          argb: `FF${COLORS.LIGHT_GREEN}`,
        },
      }

      cell.border = {
        top: solidBorder.top,
        left: solidBorder.left,
        right: solidBorder.right,
      }

      cell.alignment = {
        horizontal: 'left',
        vertical: 'middle',
        wrapText: true,
      }
    }

    // D5:E5 centered
    worksheet.getCell('D5').alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true,
    }

    // F5:G5 centered
    worksheet.getCell('F5').alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true,
    }

    // ================================================================
    // ROW 6 — INPUTS
    // ================================================================

    worksheet.mergeCells('A6:B6')
    worksheet.mergeCells('D6:E6')
    worksheet.mergeCells('F6:G6')

    for (const cellAddress of [
      'A6',
      'B6',
      'C6',
      'D6',
      'E6',
      'F6',
      'G6',
    ]) {
      const cell = worksheet.getCell(cellAddress)

      cell.font = {
        name: 'Arial',
        size: 9,
        color: {
          argb: `FF${COLORS.BLACK}`,
        },
      }

      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
          argb: `FF${COLORS.WHITE}`,
        },
      }

      cell.border = {
      left: solidBorder.left,
      right: solidBorder.right,
      }

      cell.alignment = {
        horizontal: 'left',
        vertical: 'middle',
        wrapText: true,
      }
    }

    // D6:E6 centered
    worksheet.getCell('D6').alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true,
    }

    // F6:G6 centered
    worksheet.getCell('F6').alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true,
    }

    // ================================================================
    // FUTURE STUDENT DATA
    // ================================================================
    //
     worksheet.getCell('A6').value =
       `${request.student?.firstName ?? ''} ${request.student?.lastName ?? ''}`.trim()

        worksheet.getCell('C6').value = request.student?.email ?? ''

        worksheet.getCell('D6').value = request.dateSubmitted
          ? new Date(request.dateSubmitted)
          : ''

        worksheet.getCell('D6').numFmt = 'mm/dd/yyyy'

        worksheet.getCell('F6').value = request.dateNeeded
          ? new Date(request.dateNeeded)
          : ''


    // ================================================================
    // FACULTY ADVISOR / SPONSOR
    // ================================================================

    // ================================================================
    // ROW 7 — LABELS
    // ================================================================

    worksheet.getCell('A7').value =
      'Faculty Advisor/Team Mentor'

    worksheet.getCell('C7').value =
      "Advisor/Mentor's Email"

    worksheet.getCell('D7').value =
      'Sponsoring Company/Lab'

    // Only D:G should be merged on row 7.
    worksheet.mergeCells('D7:G7')

    for (const cellAddress of [
      'A7',
      'B7',
      'C7',
      'D7',
      'E7',
      'F7',
      'G7',
    ]) {
      const cell = worksheet.getCell(cellAddress)

      cell.font = {
        name: 'Arial',
        size: 9,
        bold: true,
        color: {
          argb: `FF${COLORS.BLACK}`,
        },
      }

      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
          argb: `FF${COLORS.LIGHT_GREEN}`,
        },
      }

      cell.border = {
        top: solidBorder.top,
        left: solidBorder.left,
        right: solidBorder.right,
      }

      cell.alignment = {
        horizontal: 'left',
        vertical: 'middle',
        wrapText: true,
      }
    }

    // D:G are centered.
    worksheet.getCell('D7').alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true,
    }

    // ================================================================
    // ROW 8 — INPUTS
    // ================================================================

    // Only D:G should be merged on row 8.
    worksheet.mergeCells('D8:G8')

    for (const cellAddress of [
      'A8',
      'B8',
      'C8',
      'D8',
      'E8',
      'F8',
      'G8',
    ]) {
      const cell = worksheet.getCell(cellAddress)

      cell.font = {
        name: 'Arial',
        size: 9,
        color: {
          argb: `FF${COLORS.BLACK}`,
        },
      }

      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
          argb: `FF${COLORS.WHITE}`,
        },
      }

      cell.border = {
      left: solidBorder.left,
      right: solidBorder.right,
      }

      cell.alignment = {
        horizontal: 'left',
        vertical: 'middle',
        wrapText: true,
      }
    }

    // D:G are centered.
    worksheet.getCell('D8').alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true,
    }

    // ================================================================
    // FUTURE ADVISOR / SPONSOR DATA
    // ================================================================
    //
    // worksheet.getCell('A8').value = advisor.name
    // worksheet.getCell('C8').value = advisor.email
    // worksheet.getCell('D8').value = project.sponsorCompany

    // ================================================================
    // EXPENSE JUSTIFICATION / ADDITIONAL INFORMATION
    // ================================================================

    // ================================================================
    // ROW 9 — LABELS
    // ================================================================

    worksheet.getCell('A9').value =
      'Expense Justification'

    worksheet.getCell('C9').value =
      'Additional Information'

    worksheet.mergeCells('A9:B9')
    worksheet.mergeCells('C9:G9')

    for (const cellAddress of [
      'A9',
      'B9',
      'C9',
      'D9',
      'E9',
      'F9',
      'G9',
    ]) {
      const cell = worksheet.getCell(cellAddress)

      cell.font = {
        name: 'Arial',
        size: 9,
        bold: true,
        color: {
          argb: `FF${COLORS.BLACK}`,
        },
      }

      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
          argb: `FF${COLORS.LIGHT_GREEN}`,
        },
      }

      cell.border = {
        top: solidBorder.top,
        left: solidBorder.left,
        right: solidBorder.right,
      }

      cell.alignment = {
        horizontal: 'left',
        vertical: 'middle',
        wrapText: true,
      }
    }

    // ================================================================
    // ROW 10 — INPUTS
    // ================================================================

    worksheet.mergeCells('A10:B10')
    worksheet.mergeCells('C10:G10')

    for (const cellAddress of [
      'A10',
      'B10',
      'C10',
      'D10',
      'E10',
      'F10',
      'G10',
    ]) {
      const cell = worksheet.getCell(cellAddress)

      cell.font = {
        name: 'Arial',
        size: 9,
        color: {
          argb: `FF${COLORS.BLACK}`,
        },
      }

      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
          argb: `FF${COLORS.WHITE}`,
        },
      }

   cell.border = {
        bottom: solidBorder.bottom,
        left: solidBorder.left,
        right: solidBorder.right,
      }

      cell.alignment = {
        horizontal: 'left',
        vertical: 'top',
        wrapText: true,
      }
    }

    // ================================================================
    // REMOVE ALL STYLING FROM H3:H10
    // ================================================================

    for (let row = 3; row <= 10; row++) {
      worksheet.getCell(`H${row}`).style = {}
    }

    // ================================================================
    // FUTURE JUSTIFICATION DATA
    // ================================================================
    //
    worksheet.getCell('A10').value =
      request.expenseJustification ?? ''

    worksheet.getCell('C10').value =
      request.additionalInfo ?? ''

    // ================================================================
    // OFFICE ONLY
    // ================================================================


    worksheet.getCell('H11').value =
      'Office Only:'

    for (const cellAddress of [
      'F11',
      'G11',
      'H11',
    ]) {
      const cell = worksheet.getCell(cellAddress)

      cell.font = {
        name: 'Arial',
        size: 10,
        italic: true,
        color: {
          argb: `FF${COLORS.BLACK}`,
        },
      }

      cell.alignment = {
        horizontal: 'left',
        vertical: 'middle',
      }
    }

    // ================================================================
    // PROCUREMENT TABLE HEADER
    // ================================================================

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
      const cell = worksheet
        .getRow(12)
        .getCell(index + 1)

      cell.value = header

      cell.font = {
        name: 'Arial',
        size: 10,
        bold: true,
        color: {
          argb: `FF${COLORS.WHITE}`,
        },
      }

      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
          argb: `FF${COLORS.DARK_GREEN}`,
        },
      }

      cell.border = solidBorder

      cell.alignment = {
        horizontal: 'left',
        vertical: 'middle',
        wrapText: true,
      }
    })

    // ================================================================
    // H12 SPECIAL COLOR
    // ================================================================

    worksheet.getCell('H12').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: {
        argb: `FF${COLORS.H12}`,
      },
    }

    worksheet.getCell('H12').font = {
      name: 'Arial',
      size: 10,
      bold: true,
      color: {
        argb: `FF${COLORS.BLACK}`,
      },
    }

    // ================================================================
    // PROCUREMENT ITEM ROWS
    // ================================================================

    for (let row = 13; row <= 22; row++) {
      worksheet.getCell(`A${row}`).value = row - 12

      for (let col = 1; col <= 8; col++) {
        const cell = worksheet
          .getRow(row)
          .getCell(col)

        cell.font = {
          name: 'Arial',
          size: 10,
          color: {
            argb: `FF${COLORS.BLACK}`,
          },
        }

        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: {
            argb: `FF${COLORS.WHITE}`,
          },
        }

        // H13:H22 are dotted.
        // Every other bordered cell is solid.
        cell.border =
          col === 8
            ? dottedBorder
            : solidBorder

        cell.alignment = {
          horizontal: 'left',
          vertical: 'middle',
          wrapText: true,
        }
      }

      worksheet.getCell(`F${row}`).numFmt = '$0.00'
      worksheet.getCell(`G${row}`).numFmt = '$0.00'
    }

    // ================================================================
    // FUTURE PROCUREMENT DATA
    // ================================================================
    const items = request.items ?? []

    items.slice(0, 10).forEach((item, index) => {
      const row = index + 13

      worksheet.getCell(`A${row}`).value = index + 1
      worksheet.getCell(`B${row}`).value = item.description ?? ''
      worksheet.getCell(`C${row}`).value = item.url ?? ''
      worksheet.getCell(`D${row}`).value = item.partNumber ?? ''
      worksheet.getCell(`E${row}`).value = item.quantity ?? 0
      worksheet.getCell(`F${row}`).value = item.unitPrice ?? 0

      worksheet.getCell(`G${row}`).value = {
        formula: `E${row}*F${row}`,
      }

      // Make the item URL clickable.
      if (item.url) {
        worksheet.getCell(`C${row}`).value = {
          text: item.url,
          hyperlink: item.url,
        }
        worksheet.getCell(`C${row}`).font = {
          name: 'Arial',
          size: 10,
          color: { argb: 'FF0563C1' },
          underline: true,
        }
      }
    })

    // ================================================================
    // GRAND TOTAL
    // ================================================================

    worksheet.mergeCells('A23:D23')

    worksheet.getCell('E23').value = 'Grand Total'

    for (const cellAddress of [
      'A23',
      'B23',
      'C23',
      'D23',
      'E23',
      'F23',
      'G23',
      'H23',
    ]) {
      const cell = worksheet.getCell(cellAddress)

      cell.font = {
        name: 'Arial',
        size: 10,
        bold: true,
        color: {
          argb: `FF${COLORS.BLACK}`,
        },
      }

      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
          argb: `FF${COLORS.WHITE}`,
        },
      }


      cell.alignment = {
        horizontal: 'left',
        vertical: 'middle',
      }
    }
    const cell = worksheet.getCell('G23')

    cell.font = {
      name: 'Arial',
      size: 10,
      bold: true,
      color: {
        argb: `FF${COLORS.BLACK}`,
      },
    }

    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: {
        argb: `FF${COLORS.WHITE}`,
      },
    }

    cell.border = solidBorder

    cell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
    }
    worksheet.getCell('G23').numFmt = '$0.00'    
    
    worksheet.getCell('G23').value = {
      formula: 'SUM(G13:G22)',
    }

    worksheet.getCell('G23').numFmt = '$#,##0.00'

    // ================================================================
    // FACULTY ADVISOR / TEAM MENTOR
    // ================================================================

    worksheet.mergeCells('A26:C26')

    worksheet.getCell('A26').value =
      'Faculty Advisor/Team Mentor Only:'

    for (const cellAddress of [
      'A26',
      'B26',
      'C26',
      'D26',
    ]) {
      const cell = worksheet.getCell(cellAddress)

      cell.font = {
        name: 'Arial',
        size: 11,
        bold: true,
        italic: true,
        color: {
          argb: `FF${COLORS.BLACK}`,
        },
      }

      cell.alignment = {
        horizontal: 'left',
        vertical: 'middle',
      }
    }

    // ================================================================
    // UT DESIGN OFFICE
    // ================================================================

    worksheet.mergeCells('D26:H26')

    worksheet.getCell('D26').value =
      'UTDesign Office Only:'

    for (const cellAddress of [
      'F26',
      'G26',
      'H26',
    ]) {
      const cell = worksheet.getCell(cellAddress)

      cell.font = {
        name: 'Arial',
        size: 11,
        bold: true,
        italic: true,
        color: {
          argb: `FF${COLORS.BLACK}`,
        },
      }

      cell.alignment = {
        horizontal: 'left',
        vertical: 'middle',
      }
    }

    // ================================================================
    // APPROVAL HEADERS
    // ================================================================

    worksheet.mergeCells('E27:F27')
    worksheet.mergeCells('E28:F28')

    worksheet.getCell('A27').value = 'Date'
    worksheet.getCell('B27').value = 'Approved by'
    worksheet.getCell('D27').value = 'Received'
    worksheet.getCell('E27').value = 'Buyer'
    worksheet.getCell('G27').value = 'Ordered'

    for (const cellAddress of [
      'A27',
      'B27',
      'D27',
      'E27',
      'G27',
    ]) {
      const cell = worksheet.getCell(cellAddress)

      cell.font = {
        name: 'Arial',
        size: 10,
        bold: true,
        color: {
          argb: `FF${COLORS.BLACK}`,
        },
      }

      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
          argb: `FF${COLORS.LIGHT_GREEN}`,
        },
      }

      cell.border = solidBorder

      cell.alignment = {
        horizontal: 'left',
        vertical: 'middle',
        wrapText: true,
      }
    }
      worksheet.getCell('E27').alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true,
    }
    

    // C27 should have no styling.
    worksheet.getCell('C27').style = {}

    // ================================================================
    // APPROVAL INPUT AREA
    // ================================================================

    for (const cellAddress of [
      'A28',
      'B28',
      'C28',
      'D28',
      'F28',
      'G28',
    ]) {
      const cell = worksheet.getCell(cellAddress)

      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
          argb: `FF${COLORS.WHITE}`,
        },
      }

      cell.border = solidBorder

      cell.alignment = {
        horizontal: 'left',
        vertical: 'middle',
        wrapText: true,
      }
    }

    // B28 is unmerged and keeps all four borders.
    worksheet.getCell('B28').border = solidBorder

    // C28 keeps all borders except the top border.
    worksheet.getCell('C28').border = {
      bottom: solidBorder.bottom,
      left: solidBorder.left,
      right: solidBorder.right,
    }

      worksheet.getCell('E28').alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true,
    }

    // ================================================================
    // FUTURE APPROVAL DATA
    // ================================================================
    //
    // worksheet.getCell('A28').value = approval.date
    // worksheet.getCell('B28').value = approval.approvedBy
    //
    // worksheet.getCell('F28').value = office.received
    // worksheet.getCell('G28').value = office.buyer
    // worksheet.getCell('H28').value = office.ordered

    // ================================================================
    // PAGE SETUP
    // ================================================================

    worksheet.pageSetup = {
      orientation: 'landscape',
      paperSize: 9,
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 1,
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

    worksheet.printArea = 'A1:H28'

    // ================================================================
    // WRITE XLSX
    // ================================================================

const buffer = await workbook.xlsx.writeBuffer()

    setHeader(
      event,
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )

    setHeader(
      event,
      'Content-Disposition',
      `attachment; filename="procurement-request-${requestID}.xlsx"`,
    )

    return Buffer.from(buffer)
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'statusCode' in err
    ) {
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