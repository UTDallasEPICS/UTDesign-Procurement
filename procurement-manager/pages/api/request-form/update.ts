import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // TODO:: Add validation
  // TODO:: Add error handling
  // TODO:: Type safety
  // Right now, if there is anything in the req.body, then it will be updated
  try {
    const { requestID, requestDetails } = req.body
    console.log(requestDetails.RequestItem)
    const oldRequestForm = await prisma.request.findUnique({
      where: {
        requestID: requestID,
      },
    })
    if (!oldRequestForm) throw new Error('Could not find that request form')
    const request = await prisma.request.update({
      where: {
        requestID: oldRequestForm.requestID,
      },
      data: {
        ...requestDetails,
      },
      // data: {
      //   // Updating Request
      //   dateOrdered: req.body.dateOrdered,
      //   dateReceived: req.body.dateReceived,
      //   dateApproved: req.body.dateApproved,
      //   // fix where if there is req.body.justification or additionalInfo is null, just keep what it was before
      //   justification: req.body.justification,
      //   additionalInfo: req.body.additionalInfo,
      //   Order: {
      //     updateMany: {
      //       where: { requestID: req.body.requestID },
      //       data: {
      //         dateOrdered: req.body.dateOrdered,
      //         orderNumber: req.body.orderNumber,
      //         orderDetails: req.body.orderDetails,
      //         trackingInfo: req.body.trackingInfo,
      //         shippingCost: req.body.shippingCost,
      //       },
      //     },
      //   },
      //   // Updating Request Items
      //   RequestItem: {
      //     updateMany: {
      //       where: {
      //         requestID: req.body.requestID,
      //       },
      //       data: {
      //         itemID: req.body.itemID,
      //         quantity: req.body.quantity,
      //         description: req.body.description,
      //       },
      //     },
      //   },
      //   // Updating Other Expenses
      //   OtherExpense: {
      //     updateMany: {
      //       where: {
      //         requestID: req.body.requestID,
      //       },
      //       data: {
      //         expenseID: req.body.expenseID,
      //         expenseAmount: req.body.expenseAmount,
      //         expenseComments: req.body.expenseComments,
      //       },
      //     },
      //   },
      // },
    })
    res.status(200).json({ message: 'Request Form Updated', request: request })
  } catch (err) {
    if (err instanceof Error)
      res
        .status(500)
        .json({ message: 'Internal Server Error', error: err.message })
    else res.status(500).json({ message: 'Internal Server Error', error: err })
  }
}
