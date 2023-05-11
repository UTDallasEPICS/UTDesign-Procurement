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
export type RequestDetails = Request & {
  project: Project
  RequestItem: RequestItem[]
  OtherExpense: OtherExpense[]
  Process: Process[]
  // maybe add the RequestUpload here
}
