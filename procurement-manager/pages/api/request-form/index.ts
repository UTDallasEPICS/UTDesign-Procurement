import { NextApiRequest, NextApiResponse } from 'next'
import {
  Status,
  Request,
  RequestItem,
  RequestUpload,
  Process,
  Prisma,
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
  optionalFields: Optionals,
) {
  try {
    const requestForm = await prisma.request.create({
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
        additionalInfo: optionalFields.additionalInfo,
        expense: body.totalExpenses,
      },
      include: {
        RequestItem: true,
        Process: true,
      },
    })
    console.log(requestForm)

    // Update the total expenses in the project
    // Find the project to get the total expenses
    const project = await prisma.project.findUnique({
      where: { projectNum: body.projectNum },
    })
    console.log(project)
    console.log('project', project?.totalExpenses)
    // Update the totalExpenses in the project
    const updateExpense = await prisma.project.update({
      where: { projectNum: body.projectNum },
      data: {
        totalExpenses: Prisma.Decimal.add(
          project?.totalExpenses === undefined ? 0 : project.totalExpenses,
          body.totalExpenses,
        ),
      },
    })
    return requestForm
  } catch (error) {
    throw error
  }
}

// async function createItem(reqID: number, itemToPut: Item) {
//   const {
//     description,
//     url,
//     partNumber,
//     quantity,
//     unitPrice,
//     upload,
//     vendorID,
//     newVendorName,
//     newVendorEmail,
//     newVendorURL,
//   } = itemToPut

//   console.log('itemToPut', itemToPut)

//   // TODO :: move this where submitting the request creates a RequestUpload instead of in each RequestItem
//   // If something was uploaded, create a new RequestUpload to database
//   let uploadID: number | undefined = undefined
//   if (upload) {
//     const newUpload = await prisma.requestUpload.create({
//       data: {
//         attachmentPath: upload.attachmentPath,
//         attachmentName: upload.attachmentName,
//       },
//     })
//     if (newUpload) uploadID = newUpload.uploadID
//   }

//   if (newVendorName) {
//     const vendor = await prisma.vendor.create({
//       data: {
//         vendorName: newVendorName,
//         vendorStatus: 'PENDING',
//         vendorEmail: newVendorEmail || null, // Ensure null is acceptable in the schema
//         vendorURL: newVendorURL?.trim() || 'https://default.com',
//       },
//     });
//     console.log(`Created new vendor: ${vendor.vendorName} with ID: ${vendor.vendorID}`);
//   }

//   // TODO :: do error handling
//   // NEW ITEM IS INSERTED INTO SERVER
//   const newItem = await prisma.requestItem
//     .create({
//       data: {
//         description: description,
//         url: url,
//         partNumber: partNumber,
//         quantity: quantity,
//         unitPrice: unitPrice,
//         request: {
//           connect: { requestID: reqID },
//         },
//         vendor: {
//           connect: { vendorID: vendorID },
//         },
//         // This is not working right now
//         // upload: {
//         //   connect: { uploadID: uploadID },
//         // },
//       },
//     })
//     .catch(async (e) => {
//       // Deletes the request to show there was an error
//       await prisma.request.delete({ where: { requestID: reqID } })
//       // await prisma.requestUpload.delete({ where: { uploadID: uploadID } })
//       throw new Error(e)
//     })

//   return newItem
// }


async function createItem(reqID: number, itemToPut: Item) {
  const {
    description,
    url,
    partNumber,
    quantity,
    unitPrice,
    upload,
    vendorID,
    newVendorName,
    newVendorEmail,
    newVendorURL,
  } = itemToPut;

  console.log("itemToPut", itemToPut);

  // Handle upload creation if provided
  let uploadID: number | undefined = undefined;
  if (upload) {
    const newUpload = await prisma.requestUpload.create({
      data: {
        attachmentPath: upload.attachmentPath,
        attachmentName: upload.attachmentName,
      },
    });
    if (newUpload) uploadID = newUpload.uploadID;
  }

  // Handle vendor creation if "Other" is selected
  let finalVendorID = vendorID;

  if (!vendorID && newVendorName) {
    const newVendor = await prisma.vendor.create({
      data: {
        vendorName: newVendorName,
        vendorStatus: "PENDING",
        vendorEmail: newVendorEmail || null,
        vendorURL: newVendorURL?.trim() || "https://default.com",
      },
    });
    console.log(`Created new vendor: ${newVendor.vendorName} with ID: ${newVendor.vendorID}`);
    finalVendorID = newVendor.vendorID;
  }

  if (!finalVendorID) {
    throw new Error("A valid vendorID is required to create a request item.");
  }

  // Create the new request item
  const newItem = await prisma.requestItem.create({
    data: {
      description,
      url,
      partNumber,
      quantity,
      unitPrice,
      request: {
        connect: { requestID: reqID },
      },
      vendor: {
        connect: { vendorID: finalVendorID },
      },
    },
  });

  return newItem;
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
      await prisma.request.delete({ where: { requestID: reqID } })
      throw new Error(e)
    })
  return newProcess
}
