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

    // FINALLY CREATE THE FORM AND INSERT TO DATABASE
    const reimbursementForm = await createReimbursement(body, dateSubmitted, optionalFields)
    const reimbursementID = reimbursementForm.reimbursementID

    // INPUT ARRAY OF ITEMS INTO DATABASE
    const items = req.body.items
    items.forEach(async (item: Item) => {
      await createItem(reimbursementID, item)
    })

    // CREATE NEW PROCESS WITH STATUS OF UNDER_REVIEW INTO DATABASE
    await createProcess(reimbursementID)

    res.status(200).json({
      message: 'POST was a success',
      data: {
        id: reimbursementID,
        dateSubmitted: dateSubmitted,
      },
    })
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
  optionalFields: Optionals
) {
    // include expense field in reimbursement schema and remove status from schema (since already in process)
    const reimbursementForm = await prisma.reimbursement
        .create({
        data: {
            dateSubmitted: dateSubmitted,
            project: {
            connect: { projectNum: body.projectNum },
            },
            student: {
            connect: { email: body.studentEmail },
            },
            status: body.status,
            additionalInfo: optionalFields.additionalInfo,
        },
        include: {
            ReimbursementItem: true,
            Process: true,
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
        totalExpenses: Prisma.Decimal.add(
            project?.totalExpenses === undefined ? 0 : project.totalExpenses,
            new Prisma.Decimal(body.totalExpenses)
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

  console.log('itemToPut', itemToPut)

  // TODO :: do error handling
  // NEW ITEM IS INSERTED INTO SERVER
  // uploads not handled here since uploads will be stored in the cloud
  const newItem = await prisma.reimbursementItem
    .create({
      data: {
        receiptDate: receiptDate,
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
async function createProcess(reimbursementID: number) {
  const newProcess = await prisma.process
    .create({
      data: {
        status: Status.UNDER_REVIEW,
        reimbursement: {
          connect: { reimbursementID: reimbursementID },
        },
      },
    })
    .catch(async (e) => {
      await prisma.reimbursement.delete({ where: { reimbursementID: reimbursementID } })
      throw new Error(e)
    })
  return newProcess
}
