import { prisma } from '~/server/utils/prisma'
import {
  parseSheet,
  validateMentorRow,
  validateProjectRow,
  validateStudentRow,
  generateErrorReport,
  emailToNetID,
  type MentorRow,
  type ProjectRow,
  type StudentRow,
  type ErrorRow,
} from '~/server/utils/xlsx'
import { sendEmailToAdmins, templateDbUploadError } from '~/server/utils/email'
import { writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

/**
 * Track 1: POST /api/db-upload
 * Accepts multipart XLSX uploads: mentorFile, projectFile, studentFile
 * Processes in order: Mentors → Projects → Students
 */
export default defineEventHandler(async event => {
  if (event.context.role !== 1) throw createError({ statusCode: 403, message: 'Admin only' })

  const parts = await readMultipartFormData(event)
  if (!parts) throw createError({ statusCode: 400, message: 'No files uploaded' })

  const getFile = (name: string) => parts.find(p => p.name === name)

  const mentorPart = getFile('mentorFile')
  const projectPart = getFile('projectFile')
  const studentPart = getFile('studentFile')

  const allErrors: ErrorRow[] = []

  // ── 1. Process Mentors ────────────────────────────────────────────────────
  let mentorRows: MentorRow[] = []
  if (mentorPart?.data) {
    mentorRows = parseSheet<MentorRow>(mentorPart.data)
    mentorRows.forEach((row, i) => {
      allErrors.push(...validateMentorRow(row, i + 2))
    })
  }

  // ── 2. Process Projects ───────────────────────────────────────────────────
  let projectRows: ProjectRow[] = []
  if (projectPart?.data) {
    projectRows = parseSheet<ProjectRow>(projectPart.data)
    projectRows.forEach((row, i) => {
      allErrors.push(...validateProjectRow(row, i + 2))
    })
  }

  // ── 3. Process Students ───────────────────────────────────────────────────
  let studentRows: StudentRow[] = []
  if (studentPart?.data) {
    studentRows = parseSheet<StudentRow>(studentPart.data)
    // Build set of known project nums (existing + from this upload)
    const existingProjects = await prisma.project.findMany({ select: { projectNum: true } })
    const knownProjectNums = new Set([
      ...existingProjects.map(p => p.projectNum),
      ...projectRows.map(p => p.projectNum?.toString().trim()),
    ])

    studentRows.forEach((row, i) => {
      allErrors.push(...validateStudentRow(row, i + 2, knownProjectNums))
    })
  }

  // ── Return error report if any validation failures ─────────────────────────
  if (allErrors.length > 0) {
    const reportBuffer = generateErrorReport(allErrors)
    const reportPath = join(tmpdir(), `upload-errors-${Date.now()}.xlsx`)
    await writeFile(reportPath, reportBuffer)

    // Email admins the error report
    await sendEmailToAdmins(
      prisma,
      'Database Upload Error Report',
      templateDbUploadError(),
      reportPath,
    ).catch(() => {})

    // Return the error file as download
    setHeader(event, 'Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    setHeader(event, 'Content-Disposition', 'attachment; filename="upload-errors.xlsx"')
    return reportBuffer
  }

  // ── Write to database in dependency order ──────────────────────────────────
  await prisma.$transaction(async tx => {
    // 1. Upsert mentors/faculty
    for (const row of mentorRows) {
      const email = row.email.trim().toLowerCase()
      const netID = emailToNetID(email)
      await tx.user.upsert({
        where: { email },
        update: { firstName: row.firstName.trim(), lastName: row.lastName.trim(), netID, active: true },
        create: {
          email,
          firstName: row.firstName.trim(),
          lastName: row.lastName.trim(),
          netID,
          roleID: 2, // Mentor
          active: true,
        },
      })
    }

    // 2. Upsert projects
    for (const row of projectRows) {
      const projectNum = row.projectNum.toString().trim()
      await tx.project.upsert({
        where: { projectNum },
        update: {
          projectTitle: row.projectTitle.trim(),
          projectType: row.projectType.trim(),
          startingBudget: Number(row.startingBudget),
          sponsorCompany: row.sponsorCompany.trim(),
          costCenter: row.costCenter?.trim() ?? null,
          additionalInfo: row.additionalInfo?.trim() ?? null,
        },
        create: {
          projectNum,
          projectTitle: row.projectTitle.trim(),
          projectType: row.projectType.trim(),
          startingBudget: Number(row.startingBudget),
          sponsorCompany: row.sponsorCompany.trim(),
          costCenter: row.costCenter?.trim() ?? null,
          additionalInfo: row.additionalInfo?.trim() ?? null,
          activationDate: new Date(),
        },
      })
    }

    // 3. Upsert students and create WorksOn
    for (const row of studentRows) {
      const email = row.email.trim().toLowerCase()
      const netID = emailToNetID(email)
      const projectNum = row.projectNum.toString().trim()

      const user = await tx.user.upsert({
        where: { email },
        update: { firstName: row.firstName.trim(), lastName: row.lastName.trim(), netID, active: true },
        create: {
          email,
          firstName: row.firstName.trim(),
          lastName: row.lastName.trim(),
          netID,
          roleID: 3, // Student
          active: true,
        },
      })

      const project = await tx.project.findUnique({ where: { projectNum } })
      if (project) {
        // Check if already assigned
        const existing = await tx.worksOn.findFirst({
          where: { userID: user.id, projectID: project.projectID, endDate: null },
        })
        if (!existing) {
          await tx.worksOn.create({
            data: {
              userID: user.id,
              projectID: project.projectID,
              startDate: new Date(),
            },
          })
        }
      }
    }
  })

  return { ok: true, mentors: mentorRows.length, projects: projectRows.length, students: studentRows.length }
})
