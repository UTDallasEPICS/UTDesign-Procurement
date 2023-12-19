/**
 * This file contains all the custom types that are used in the application
 */

import {
  Request,
  OtherExpense,
  Process,
  RequestItem,
  Project,
} from '@prisma/client'

// This is the type of the request object that will be sent to the frontend (in orders page)
export interface RequestDetails extends Request {
  project: Project
  RequestItem: RequestItem[]
  OtherExpense: OtherExpense[]
  Process: Process[]
  // maybe add the RequestUpload here
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
