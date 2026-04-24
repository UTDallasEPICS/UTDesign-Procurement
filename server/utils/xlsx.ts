import * as XLSX from 'xlsx'

/**
 * Track 1: Excel/XLSX Utilities
 * SheetJS helpers for parsing, validating, and generating XLSX files.
 */

export interface MentorRow {
  firstName: string
  lastName: string
  email: string
  netID?: string
}

export interface ProjectRow {
  projectNum: string
  projectTitle: string
  projectType: string
  startingBudget: number
  sponsorCompany: string
  costCenter?: string
  additionalInfo?: string
}

export interface StudentRow {
  firstName: string
  lastName: string
  email: string
  netID?: string
  projectNum: string
}

export interface ErrorRow {
  file: string
  row: number
  field: string
  error: string
}

/** Parse the first sheet of an XLSX buffer into row objects. */
export function parseSheet<T = Record<string, unknown>>(buffer: Buffer): T[] {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true })
  const sheetName = workbook.SheetNames[0]
  if (!sheetName) return []
  const sheet = workbook.Sheets[sheetName]
  return XLSX.utils.sheet_to_json<T>(sheet, { defval: '' })
}

const UTD_EMAIL_RE = /^[a-zA-Z]{3}\d{6}@utdallas\.edu$/i

/** Validate a mentor/faculty row. Returns array of error strings (empty = valid). */
export function validateMentorRow(row: MentorRow, rowIndex: number): ErrorRow[] {
  const errors: ErrorRow[] = []
  if (!row.firstName?.trim()) errors.push({ file: 'mentorFile', row: rowIndex, field: 'firstName', error: 'Required' })
  if (!row.lastName?.trim()) errors.push({ file: 'mentorFile', row: rowIndex, field: 'lastName', error: 'Required' })
  if (!row.email?.trim()) {
    errors.push({ file: 'mentorFile', row: rowIndex, field: 'email', error: 'Required' })
  } else if (!UTD_EMAIL_RE.test(row.email.trim())) {
    errors.push({ file: 'mentorFile', row: rowIndex, field: 'email', error: 'Must be a valid UTD email (abc123456@utdallas.edu)' })
  }
  return errors
}

/** Validate a project row. Returns array of error strings (empty = valid). */
export function validateProjectRow(row: ProjectRow, rowIndex: number): ErrorRow[] {
  const errors: ErrorRow[] = []
  if (!row.projectNum?.toString().trim()) errors.push({ file: 'projectFile', row: rowIndex, field: 'projectNum', error: 'Required' })
  if (!row.projectTitle?.trim()) errors.push({ file: 'projectFile', row: rowIndex, field: 'projectTitle', error: 'Required' })
  if (!row.projectType?.trim()) errors.push({ file: 'projectFile', row: rowIndex, field: 'projectType', error: 'Required' })
  if (!row.sponsorCompany?.trim()) errors.push({ file: 'projectFile', row: rowIndex, field: 'sponsorCompany', error: 'Required' })
  if (!row.startingBudget || isNaN(Number(row.startingBudget))) {
    errors.push({ file: 'projectFile', row: rowIndex, field: 'startingBudget', error: 'Must be a valid number' })
  }
  return errors
}

/** Validate a student row. Returns array of error strings (empty = valid). */
export function validateStudentRow(
  row: StudentRow,
  rowIndex: number,
  knownProjectNums: Set<string>,
): ErrorRow[] {
  const errors: ErrorRow[] = []
  if (!row.firstName?.trim()) errors.push({ file: 'studentFile', row: rowIndex, field: 'firstName', error: 'Required' })
  if (!row.lastName?.trim()) errors.push({ file: 'studentFile', row: rowIndex, field: 'lastName', error: 'Required' })
  if (!row.email?.trim()) {
    errors.push({ file: 'studentFile', row: rowIndex, field: 'email', error: 'Required' })
  } else if (!UTD_EMAIL_RE.test(row.email.trim())) {
    errors.push({ file: 'studentFile', row: rowIndex, field: 'email', error: 'Must be a valid UTD email (abc123456@utdallas.edu)' })
  }
  if (!row.projectNum?.toString().trim()) {
    errors.push({ file: 'studentFile', row: rowIndex, field: 'projectNum', error: 'Required' })
  } else if (!knownProjectNums.has(row.projectNum.toString().trim())) {
    errors.push({ file: 'studentFile', row: rowIndex, field: 'projectNum', error: `Project "${row.projectNum}" not found` })
  }
  return errors
}

/** Generate an error report XLSX buffer from an array of ErrorRow objects. */
export function generateErrorReport(errors: ErrorRow[]): Buffer {
  const ws = XLSX.utils.json_to_sheet(errors)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Errors')
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer
}

/** Extract netID from a UTD email. */
export function emailToNetID(email: string): string {
  return email.toLowerCase().split('@')[0]
}
