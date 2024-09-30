/**
 * This file contains all the custom types that are used in the application
 */

import {
  Request,
  OtherExpense,
  Process,
  RequestItem,
  Project,
  Reimbursement,
  ReimbursementItem,
} from '@prisma/client'
import PersistentFile from 'formidable/PersistentFile'

// This is the type of the request object that will be sent to the frontend (in orders page)
export interface RequestDetails extends Request {
  project: Project
  RequestItem: RequestItem[]
  OtherExpense: OtherExpense[]
  Process: Process[]
  // maybe add the RequestUpload here
}

export interface ReimbursementDetails extends Reimbursement {
  project: Project
  ReimbursementItem: ReimbursementItem[]
  Process: Process[]
}

export interface ValidFile {
  valid: boolean
  reason: string
}

export interface FileWithValid extends File {
  validity: ValidFile
}

export enum InvalidReason {
  FILE_TYPE = 'Invalid file type. Please upload .xlsx files only.',
  DUPLICATE_NAME = 'There are duplicate file names. Please rename the files and try again.',
}

export interface StudentFileData {
  ['Deactivation Date']: number
  ['Email']: string
  ['First Name']: string
  ['Last Name']: string
  ['Project Number']: number
  ['Project Type']: string
  ['__rowNum__']: number
}

export interface NonStudentFileData {
  ['Faculty Email']: string
  ['First Name']: string
  ['Last Name']: string
  ['__rowNum__']: number
}

export interface ProjectFileData {
  ['Company']: string
  ['Dept']: string
  ['Project End']: number
  ['Project Number']: number
  ['Project Start']: number
  ['Project Type']: string
  ['Title']: string
  ['TM First Name']: string
  ['TM Last Name']: string
  ['__rowNum__']: number
  // Not found in sample files but required in the database
  ['Starting Budget']: number
}

export interface StudentFileDataError extends StudentFileData {
  ['Reason']: string
}

export interface NonStudentFileDataError extends NonStudentFileData {
  ['Reason']: string
}

export interface ProjectFileDataError extends ProjectFileData {
  ['Reason']: string
}

export type FileDataError =
  | StudentFileDataError
  | NonStudentFileDataError
  | ProjectFileDataError

export type FileDataErrorWithName = {
  errorDataFile: FileDataError[]
  originalFilename: string
}

export interface PersistentFileWithName extends PersistentFile {
  originalFilename: string
}
