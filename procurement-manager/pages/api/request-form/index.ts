import type { NextApiRequest, NextApiResponse } from 'next'
import { Status, Prisma } from '@prisma/client'
import { prisma } from '@/db'

// PSEUDO:
// POST request-form -- done
/// create a new request in database -- done
//// backend gets the current date -- done
/// create multiple items with the url, connect those items with the requestID of request that was just created -- done
/// put those items in the database -- done

/// if there is a RequestUpload, put in database -- done
/// if there is OtherExpense, put in database

/// create a new process and put in database -- done

interface Optionals {
  additionalInfo: string | undefined
}

interface Item {
  description: string
  url: string
  partNumber: string
  quantity: number
  unitPrice: number
  vendorID: number
  newVendorName: string
  newVendorEmail: string
  newVendorURL: string
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
  res: NextApiResponse,
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
    let additionalInfo: string | undefined
    const optionalFields: Optionals = { additionalInfo }
    if ('additionalInfo' in body && typeof body.additionalInfo === 'string')
      optionalFields.additionalInfo = body.additionalInfo

    if (typeof body.projectNum === 'string')
      body.projectNum = parseInt(body.projectNum)

    // CREATE NEW PROCESS WITH STATUS OF UNDER_REVIEW INTO DATABASE

    // FINALLY CREATE THE REQUEST FORM AND INSERT TO DATABASE
    // TODO: should we validate items actually matches the expected schema?
    const requestForm = await createRequest(
      body,
      dateSubmitted,
      optionalFields,
      req.body.items,
    )
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

// TODO :: do error handling
async function createRequest(
  body: any,
  dateSubmitted: Date,
  optionalFields: Optionals,
  items: Item[],
) {
  // wrapping the whole request creation process in a transaction to ensure that if anything fails, nothing gets inserted
  const createdRequestForm = await prisma.$transaction(async (prisma) => {
    // using prisma's nested write functionality to create a process and request together
    const newProcess = await prisma.process.create({
      data: {
        status: Status.UNDER_REVIEW,
        request: {
          create: {
            dateNeeded: new Date(body.dateNeeded), // may change in the future
            dateSubmitted,
            project: {
              // sample project
              connect: { projectNum: body.projectNum },
            },
            student: {
              connect: { email: body.studentEmail },
            },
            additionalInfo: optionalFields.additionalInfo,
            expense: parseInt(body.totalExpenses),
          },
        },
      },
      include: {
        request: true,
      },
    })
    const requestForm = newProcess.request
    console.log({ requestForm })
    if (!requestForm) {
      throw new Error('Missing request form')
    }

    // creating new vendors one by one so we can get their IDs back to link to the request items
    // TODO: if/when we bump to prisma version > 5.14, we can rewrite this to use prisma's createManyAndReturn fn: https://www.prisma.io/docs/orm/prisma-client/queries/crud#create-and-return-multiple-records.
    const newVendors = await Promise.all(
      items
        .filter((item) => !item.vendorID && item.newVendorName)
        .map(async (item) =>
          prisma.vendor.create({
            data: {
              vendorName: item.newVendorName,
              vendorStatus: 'PENDING',
              vendorEmail: item.newVendorEmail,
            },
          }),
        ),
    )

    await prisma.requestItem.createMany({
      data: items.map((item) => ({
        description: item.description,
        url: item.url,
        partNumber: item.partNumber,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        requestID: requestForm.requestID,
        vendorID: item.vendorID ?? newVendors.shift()!.vendorID,
      })),
    })

    if (newVendors.length > 0) {
      throw new Error(
        'Not all newly created vendors were connected to a request item - something is wrong',
      )
    }

    // Update the total expenses in the project
    // Find the project to get the total expenses
    const project = await prisma.project.findUnique({
      where: { projectID: requestForm.projectID },
    })
    console.log(project)
    // Update the totalExpenses in the project
    const updateExpense = await prisma.project.update({
      where: { projectID: requestForm.projectID },
      data: {
        totalExpenses: (
          (project?.totalExpenses === undefined ? 0 : project.totalExpenses)+
          body.totalExpenses
        ),
      },
    })
    return requestForm
  })

  return createdRequestForm
}
