import { Request, OtherExpense, Process, RequestItem } from '@prisma/client'

// This is the type of the request object that will be sent to the frontend (in orders page)
export type RequestDetails = Request & {
  RequestItem: RequestItem[]
  OtherExpense: OtherExpense[]
  Process: Process[]
}
