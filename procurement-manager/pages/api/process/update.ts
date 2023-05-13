import { Prisma, Status } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'

//creating a update api under process which updates the comments
//field under process based on the proccesID
//based on the role we update either mentorProcessedCommetns or
// adminProcessedComments

/**
 * This is an async function that updates a process based on the user's role and the information
 * provided in the request body.
 * @param {NextApiRequest} req - The NextApiRequest object, which contains information about the
 * incoming HTTP request.
 * @param {NextApiResponse} res - The `res` parameter is an instance of the `NextApiResponse` class,
 * which is used to send the HTTP response back to the client. It contains methods such as `status()`
 * to set the HTTP status code, `json()` to send a JSON response, and `send()` to send a
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== 'POST') {
      throw new Error('Method Not Allowed')
    }

    //post method as we are getting info
    const { netID, requestID, comment, status } = req.body

    // Finds the user and request based on the netID and requestID provided in the request body
    const [user, request] = await Promise.all([
      await prisma.user.findUnique({ where: { netID: netID } }),
      await prisma.request.findUnique({
        where: { requestID: requestID },
        include: { Process: true },
      }),
    ])

    if (!user) throw new Error('User not found')
    if (!request) throw new Error('Request not found')

    // CHECK FOR ROLE -- DIFFERENT ROLES HAVE DIFFERENT PERMISSIONS TO UPDATE THE PROCESS
    // user.roleID is admin so update the comment and status given by admin
    if (user.roleID === 1) {
      console.log(comment)
      const updateC = await prisma.process.update({
        where: { processID: request.Process[0].processID },
        data: {
          adminProcessedComments: comment,
          status: status,
          adminProcessed: new Date(),
        },
        include: {
          request: true,
        },
      })
      if (status === Status.REJECTED) {
        // TODO :: Undo the expense - hard coded to zero for demo purposes
        const project = await prisma.project.findUnique({
          where: { projectID: request.projectID },
        })
        const undoExpense = await prisma.project.update({
          where: { projectID: request.projectID },
          data: {
            totalExpenses: Prisma.Decimal.sub(
              project?.totalExpenses === undefined
                ? request.expense
                : project.totalExpenses,
              request.expense
            ),
          },
        })
      }
      res.status(200).json({
        message: `Process ${request.Process[0].processID} in Request #${requestID} was updated successfully`,
        update: updateC,
      })
    }
    //user.roleID is mentor so update the the comment and status given by mentor
    else if (user.roleID === 2) {
      const updateC = await prisma.process.update({
        where: { processID: request.Process[0].processID },
        data: {
          mentorID: user.userID,
          mentorProcessedComments: comment,
          status: status,
          mentorProcessed: new Date(),
        },
        include: {
          request: true,
        },
      })

      // if the given status in req.body is APPROVED also update the dateApproved field for the request
      if (status === Status.APPROVED) {
        await prisma.request.update({
          where: { requestID: requestID },
          data: { dateApproved: new Date() },
        })
      }

      if (status === Status.REJECTED) {
        // Undo the expense
        const undoExpense = await prisma.project.update({
          where: { projectID: request.projectID },
          data: { totalExpenses: 0 },
        })
      }

      res.status(200).json({
        message: `Process ${request.Process[0].processID} in Request #${requestID} was updated successfully`,
        update: updateC,
      })
    }
    //user.roleID is student, so student can reject the status
    else if (user.roleID === 3) {
      const updatedProcess = await prisma.process.update({
        where: { processID: request.Process[0].processID },
        data: {
          status: status,
        },
      })
      res.status(200).json({
        message: `Process ${request.Process[0].processID} was updated successfully`,
        update: updatedProcess,
      })
    }
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
}
