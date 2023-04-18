import { NextApiRequest, NextApiResponse } from 'next'
import {
  Status,
  Request,
  RequestItem,
  RequestUpload,
  Process,
} from '@prisma/client'
import { prisma } from '@/db'

// PSEUDO:
// POST request-form -- done
/// create a new request in database -- done
//// backend gets the current date -- done
/// create multiple items with the url, connect those items with the requestID of request that was just created -- done
/// put those items in the database -- done

/// if there is a RequestUpload, put in database -- done
/// if there is OtherExpense, put in database

/// create a new process and put in database
activationDate: new Date('08/01/20')

interface Optionals {
  justification: string | undefined
  additionalInfo: string | undefined
}

interface Item {
  description: string
  url: string
  partNumber: string
  quantity: number
  unitPrice: number
  vendorID: number
  upload:
    | {
        attachmentPath: string | undefined
        attachmentName: string | undefined
      }
    | undefined
}

/**
 * What frontend needs to send:
 * - dateNeeded
 * - projectNum
 * - studentEmail ???  - check with frontend
 * - items as an array where each item has: description, url, partNumber, quantity, unitPrice, vendor
 * - upload and other expense are optional
 ****************************************
 * Outline:
 * - check if optional fields exists
 * - input new Request to Database
 * - get requestID
 * - input new Items to database with the requestID from the recently made Request
 * - input new Process with STATUS = UNDER_REVIEW
 *
 */
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

  // POST - create a new request
  try {
    const dateSubmitted = new Date()
    const body = req.body

    // CHECK IF OPTIONAL FIELDS ARE IN THE req.body
    let justification: string | undefined, additionalInfo: string | undefined
    const optionalFields: Optionals = { justification, additionalInfo }
    if ('justification' in body && typeof body.justification === 'string') {
      optionalFields.justification = body.justification
    }
    if ('additionalInfo' in body && typeof body.additionalInfo === 'string')
      optionalFields.additionalInfo = body.additionalInfo

    if (typeof body.projectNum === 'string')
      body.projectNum = parseInt(body.projectNum)

    // FINALLY CREATE THE REQUEST FORM AND INSERT TO DATABASE
    const requestForm = await createRequest(body, dateSubmitted, optionalFields)
    const requestID = requestForm.requestID

    // INPUT ARRAY OF ITEMS INTO DATABASE
    const items = req.body.items
    items.forEach(async (item: Item) => {
      await createItem(requestID, item)
    })

    // CREATE NEW PROCESS WITH STATUS OF UNDER_REVIEW INTO DATABASE
    await createProcess(requestID)

    res.status(200).json({
      message: 'POST was a success',
      data: {
        id: requestID,
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
async function createRequest(
  body: any,
  dateSubmitted: Date,
  optionalFields: Optionals
) {
  const requestForm = await prisma.request
    .create({
      data: {
        dateNeeded: new Date(body.dateNeeded), // may change in the future
        dateSubmitted: dateSubmitted,
        project: {
          // sample project
          connect: { projectNum: body.projectNum },
        },
        student: {
          connect: { email: body.studentEmail },
        },
        justification: optionalFields.justification,
        additionalInfo: optionalFields.additionalInfo,
      },
    })
    .catch((e) => {
      throw new Error(e)
    })
  return requestForm
}

async function createItem(reqID: number, itemToPut: Item) {
  const {
    description,
    url,
    partNumber,
    quantity,
    unitPrice,
    upload,
    vendorID,
  } = itemToPut

  // If something was uploaded, create a new RequestUpload to database
  let uploadID: number | undefined = undefined
  if (upload) {
    const newUpload = await prisma.requestUpload.create({
      data: {
        attachmentPath: upload.attachmentPath,
        attachmentName: upload.attachmentName,
      },
    })
    if (newUpload) uploadID = newUpload.uploadID
  }

  // TODO :: do error handling
  // NEW ITEM IS INSERTED INTO SERVER
  const newItem = await prisma.requestItem
    .create({
      data: {
        description: description,
        url: url,
        partNumber: partNumber,
        quantity: quantity,
        unitPrice: unitPrice,
        request: {
          connect: { requestID: reqID },
        },
        vendor: {
          connect: { vendorID: vendorID },
        },
        upload: {
          connect: { uploadID: uploadID },
        },
      },
    })
    .catch(async (e) => {
      // Deletes the request to show there was an error
      // await prisma.request.delete({ where: { requestID: reqID } })
      // await prisma.requestUpload.delete({ where: { uploadID: uploadID } })
      throw new Error(e)
    })

  return newItem
}

// Creates a new Process into the database
async function createProcess(reqID: number) {
  const newProcess = await prisma.process
    .create({
      data: {
        status: Status.UNDER_REVIEW,
        request: {
          connect: { requestID: reqID },
        },
      },
    })
    .catch(async (e) => {
      // await prisma.request.delete({ where: { requestID: reqID } })
      throw new Error(e)
    })
  return newProcess
}
