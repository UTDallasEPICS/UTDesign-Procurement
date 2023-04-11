import { NextApiRequest, NextApiResponse } from 'next'
import { Status } from '@prisma/client'
import { prisma } from '@/db'

// PSEUDO:
// POST request-form -- done
/// create a new request in database -- done
//// backend gets the current date -- done
/// create multiple items with the url, connect those items with the requestID of request that was just created
/// put those items in the database

/// if there is a RequestUpload, put in database
/// if there is OtherExpense, put in database

/// create a new process and put in database

interface Optionals {
  justification: string | undefined
  additionalInfo: string | undefined
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') res.status(405).send('Method Not Allowed')

  // POST - create a new request
  try {
    /**
     * What frontend needs to send:
     * dateNeeded
     * projectNum
     * studentEmail ???  - check with frontend
     * vendor???
     * items as an array where each item has:
     * description, url, partNumber, quantity, unitPrice, vendor
     * upload and other expense are optional
     */

    /**
     * Outline:
     * check if optional fields exists
     * input new Request to Database
     * get requestID
     * input new Items to database with the requestID from the recently made Request
     * input new Process with STATUS = UNDER_REVIEW
     *
     */
    const dateSubmitted = new Date()
    const body = req.body

    // check if optional fields are in the req.body
    let justification: string | undefined, additionalInfo: string | undefined
    const optionalFields: Optionals = { justification, additionalInfo }
    if ('justification' in body && typeof body.justification === 'string') {
      optionalFields.justification = body.justification
    }
    if ('additionalInfo' in body && typeof body.additionalInfo === 'string')
      optionalFields.additionalInfo = body.additionalInfo

    if (typeof body.projectNum === 'string')
      body.projectNum = parseInt(body.projectNum)

    // Finally create the request form and put into database
    const requestForm = await createRequest(body, dateSubmitted, optionalFields)
    const requestID = requestForm.requestID
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

async function createRequest(
  body: any,
  dateSubmitted: Date,
  optionalFields: Optionals
) {
  const requestForm = await prisma.request.create({
    data: {
      dateNeeded: body.dateNeeded,
      dateSubmitted: dateSubmitted,
      status: Status.UNDER_REVIEW,
      project: {
        // sample project
        connect: { projectNum: body.projectNum },
      },
      student: {
        connect: { email: body.studentEmail },
      },
      vendor: {
        // sample vendor
        connect: { vendorID: 1 },
      },
      justification: optionalFields?.justification,
      additionalInfo: optionalFields?.additionalInfo,
    },
  })
  return requestForm
}

async function createItem(requestId: number) {}

async function createProcess() {}
