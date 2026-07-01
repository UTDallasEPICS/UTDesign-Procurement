import { ROLES } from '~/shared/constants/roles'
import { prisma } from '~/server/utils/prisma'
import { parseSheet, validateProjectRow, emailToNetID, type ProjectRow } from '~/server/utils/xlsx'

interface ProjectImportRow extends ProjectRow {
  mentorFirstName?: string
  mentorLastName?: string
  mentorName?: string
  mentorEmail?: string
}

interface RowResult {
  row: number
  projectNum: string
  status: 'created' | 'skipped' | 'error'
  detail: string
}

/**
 * POST /api/admin/import/projects — bulk-import projects from an XLSX file (step 1 of 2).
 * Expected columns: projectNum, projectTitle, projectType, startingBudget, sponsorCompany,
 * costCenter?, additionalInfo?, mentorName?/mentorFirstName?+mentorLastName?, mentorEmail?
 */
export default defineEventHandler(async event => {
  if (event.context.role !== ROLES.ADMIN) throw createError({ statusCode: 403, message: 'Admin only' })

  try {
    const { fileData } = await readBody(event)
    if (!fileData) throw createError({ statusCode: 400, message: 'No file provided' })

    const buffer = Buffer.from(String(fileData).replace(/^data:[^;]+;base64,/, ''), 'base64')
    const rows = parseSheet<ProjectImportRow>(buffer)
    if (!rows.length) throw createError({ statusCode: 400, message: 'The file contains no rows' })

    const results: RowResult[] = []

    for (const [i, row] of rows.entries()) {
      const rowNum = i + 2 // 1-based + header row
      const projectNum = row.projectNum?.toString().trim() ?? ''

      const errors = validateProjectRow(row, rowNum)
      if (errors.length) {
        results.push({ row: rowNum, projectNum, status: 'error', detail: errors.map(e => `${e.field}: ${e.error}`).join('; ') })
        continue
      }

      const existing = await prisma.project.findUnique({ where: { projectNum } })
      if (existing) {
        results.push({ row: rowNum, projectNum, status: 'skipped', detail: 'Project already exists' })
        continue
      }

      const project = await prisma.project.create({
        data: {
          projectNum,
          projectTitle: row.projectTitle.trim(),
          projectType: row.projectType.trim(),
          startingBudget: Math.round(Number(row.startingBudget)),
          sponsorCompany: row.sponsorCompany.trim(),
          costCenter: row.costCenter?.toString().trim() || null,
          additionalInfo: row.additionalInfo?.toString().trim() || null,
        },
      })

      let detail = 'Created'
      const mentorEmail = row.mentorEmail?.toString().trim().toLowerCase()
      if (mentorEmail) {
        const [first, ...rest] = (row.mentorName?.toString().trim() || `${row.mentorFirstName ?? ''} ${row.mentorLastName ?? ''}`.trim() || 'Mentor').split(/\s+/)
        const mentor = await prisma.user.upsert({
          where: { email: mentorEmail },
          update: {},
          create: {
            email: mentorEmail,
            firstName: first,
            lastName: rest.join(' ') || '—',
            netID: mentorEmail.endsWith('@utdallas.edu') ? emailToNetID(mentorEmail) : null,
            role: 'MENTOR',
            active: true,
          },
        })
        const membership = await prisma.worksOn.findFirst({
          where: { userID: mentor.id, projectID: project.projectID, endDate: null },
        })
        if (!membership) {
          await prisma.worksOn.create({
            data: { userID: mentor.id, projectID: project.projectID, startDate: new Date() },
          })
        }
        detail = 'Created (mentor linked)'
      }

      results.push({ row: rowNum, projectNum, status: 'created', detail })
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
