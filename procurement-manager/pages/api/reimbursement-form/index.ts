// API to create new reimbursement entry, reimbursement items, and status of under review for submitted reimbursement form

import { NextApiRequest, NextApiResponse } from 'next'
import {
  Status,
  Prisma,
} from '@prisma/client'
import { prisma } from '@/db'

interface Optionals {
  additionalInfo: string | undefined
}

interface Item {
  receiptDate: Date
  description: string
  receiptTotal: number
  vendorID: number
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Some error handling???
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed')
    return
  }
  // if req.body is empty
  if (Object.keys(req.body).length === 0) {
    res.status(400).send('There were no fields')

    return
  }
  if (!('items' in req.body)) {
    res.status(400).send('Items is missing')
  }

  // POST - create a new reimbursement
  try {
    const dateSubmitted = new Date()
    const body = req.body

    // CHECK IF OPTIONAL FIELDS ARE IN THE req.body
    let additionalInfo: string | undefined
    const optionalFields: Optionals = { additionalInfo }
    if ('additionalInfo' in body && typeof body.additionalInfo === 'string')
      optionalFields.additionalInfo = body.additionalInfo

    if (typeof body.projectNum === 'string')
      body.projectNum = parseInt(body.projectNum)

    // CREATE NEW PROCESS WITH STATUS OF UNDER_REVIEW INTO DATABASE
    const process = await createProcess()
    const processID = process.processID

    // FINALLY CREATE THE FORM AND INSERT TO DATABASE
    const reimbursementForm = await createReimbursement(body, dateSubmitted, processID, optionalFields)
    const reimbursementID = reimbursementForm.reimbursementID

    // INPUT ARRAY OF ITEMS INTO DATABASE
    const items = req.body.items

    try {
      await Promise.all(
        items.map((item: Item) => createItem(reimbursementID, item))
      )
    
      res.status(200).json({
        message: 'POST was a success',
        data: {
          id: reimbursementID,
          dateSubmitted: dateSubmitted,
        },
      })
    } catch (itemError) {
      // Clean up by deleting the reimbursement and process
      await prisma.reimbursement.delete({ where: { reimbursementID } })
      await prisma.process.delete({ where: { processID } })
    
      console.error('Item creation failed:', itemError)
      res.status(400).json({
        message: 'Failed to add items to reimbursement',
        error: itemError instanceof Error ? itemError.message : itemError,
      })
    }
    

  } catch (error) {
    console.log(error)
    if (error instanceof Error)
      res.status(500).json({
        message: 'Internal Server Error',
        error: error.message,
      })
    else
      res.status(500).json({
        message: 'Internal Server Error',
        error: error,
      })
  }
}

// TODO :: do error handling
async function createReimbursement(
  body: any,
  dateSubmitted: Date,
  processID: number,
  optionalFields: Optionals
) {
    const reimbursementForm = await prisma.reimbursement.create({
        data: {
            dateSubmitted: dateSubmitted,
            project: {
              connect: { projectNum: body.projectNum },
            },
            student: {
              connect: { email: body.studentEmail },
            },
            process: {
              connect: { processID: processID },
            },
            additionalInfo: optionalFields.additionalInfo,
            expense: body.totalExpenses
        },
        include: {
            ReimbursementItem: true,
            process: true,
        },
        })
        .catch((e) => {
            throw new Error(e)
        })

    // Update the total expenses in the project
    // Find the project to get the total expenses
    const project = await prisma.project.findUnique({
        where: { projectNum: body.projectNum },
    })
    console.log('project', project?.totalExpenses)
    
    // Update the totalExpenses in the project
    const updateExpense = await prisma.project.update({
        where: { projectNum: body.projectNum },
        data: {
        totalExpenses: (
            (project?.totalExpenses === undefined ? 0 : project.totalExpenses)+
            (body.totalExpenses)
        ),
        },
    })
    return reimbursementForm
}

async function createItem(reimbursementID: number, itemToPut: Item) {
  const {
    receiptDate,
    description,
    receiptTotal,
    vendorID,
  } = itemToPut

  console.log('CONSOLE: itemToPut', itemToPut)

  // TODO :: do error handling
  // NEW ITEM IS INSERTED INTO SERVER
  // uploads not handled here since uploads will be stored in the cloud
  const newItem = await prisma.reimbursementItem
    .create({
      data: {
        receiptDate: new Date(receiptDate),
        description: description,
        receiptTotal: receiptTotal,
        reimbursement: {
          connect: { reimbursementID: reimbursementID },
        },
        vendor: {
          connect: { vendorID: vendorID },
        },
      },
    })
    .catch(async (e) => {
      // Deletes to show there was an error
      await prisma.reimbursement.delete({ where: { reimbursementID: reimbursementID } })
      throw new Error(e)
    })

  return newItem
}

// Creates a new Process into the database
async function createProcess() {
  const newProcess = await prisma.process
    .create({
      data: {
        status: Status.UNDER_REVIEW,
      },
    })
    .catch(async (e) => {
      throw new Error(e)
    })
  return newProcess
}
