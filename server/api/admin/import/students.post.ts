import { ROLES } from '~/shared/constants/roles'
import { prisma } from '~/server/utils/prisma'
import { parseSheet, validateStudentRow, emailToNetID, type StudentRow } from '~/server/utils/xlsx'

interface RowResult {
  row: number
  email: string
  projectNum: string
  status: 'created' | 'skipped' | 'error'
  detail: string
}

/**
 * POST /api/admin/import/students — bulk-import students from an XLSX file (step 2 of 2).
 * Rows reference projects by projectNum, which must already exist (import projects first).
 * Expected columns: firstName, lastName, email, projectNum
 */
export default defineEventHandler(async event => {
  if (event.context.role !== ROLES.ADMIN) throw createError({ statusCode: 403, message: 'Admin only' })

  try {
    const { fileData } = await readBody(event)
    if (!fileData) throw createError({ statusCode: 400, message: 'No file provided' })

    const buffer = Buffer.from(String(fileData).replace(/^data:[^;]+;base64,/, ''), 'base64')
    const rows = parseSheet<StudentRow>(buffer)
    if (!rows.length) throw createError({ statusCode: 400, message: 'The file contains no rows' })

    const projects = await prisma.project.findMany({ select: { projectNum: true, projectID: true } })
    const knownProjectNums = new Set(projects.map(p => p.projectNum))
    const projectByNum = new Map(projects.map(p => [p.projectNum, p.projectID]))

    const results: RowResult[] = []

    for (const [i, row] of rows.entries()) {
      const rowNum = i + 2
      const email = row.email?.toString().trim().toLowerCase() ?? ''
      const projectNum = row.projectNum?.toString().trim() ?? ''

      const errors = validateStudentRow(row, rowNum, knownProjectNums)
      if (errors.length) {
        results.push({ row: rowNum, email, projectNum, status: 'error', detail: errors.map(e => `${e.field}: ${e.error}`).join('; ') })
        continue
      }

      const student = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          email,
          firstName: row.firstName.trim(),
          lastName: row.lastName.trim(),
          netID: emailToNetID(email),
          role: 'STUDENT',
          active: true,
        },
      })

      const projectID = projectByNum.get(projectNum)!
      const membership = await prisma.worksOn.findFirst({
        where: { userID: student.id, projectID, endDate: null },
      })
      if (membership) {
        results.push({ row: rowNum, email, projectNum, status: 'skipped', detail: 'Already assigned to this project' })
        continue
      }

      await prisma.worksOn.create({
        data: { userID: student.id, projectID, startDate: new Date() },
      })
      results.push({ row: rowNum, email, projectNum, status: 'created', detail: 'Student assigned to project' })
    }

    return {
      total: rows.length,
      created: results.filter(r => r.status === 'created').length,
      skipped: results.filter(r => r.status === 'skipped').length,
      errors: results.filter(r => r.status === 'error').length,
      results,
    }
  } catch (err: unknown) {
    if ((err as { statusCode?: number }).statusCode) throw err
    throw createError({ statusCode: 500, message: 'Internal server error' })
  }
})
