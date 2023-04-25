import { Prisma, Status } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'

//creating a update api under process which updates the comments
//field under process based on the proccesID
//based on the role we update either mentorProcessedCommetns or
// adminProcessedComments

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method == 'POST') {
    //post method as we are getting info
    const { netID, processID, comment, status } = req.body
    // first get user's netID ??? from req.body
    const user = await prisma.user.findUnique({
      where: {
        netID: netID,
      },
    })

    // check for role -- different roles have different functions
    if (user) {
      //user.roleID is admin so update the comment and status given by admin
      if (user.roleID === 1) {
        //if user is admin
        const updateC = await prisma.process
          .update({
            where: { processID: processID },
            data: {
              adminProcessedComments: comment,
              status: status,
              adminProcessed: new Date(),
            },
          })
          .catch((err) => {
            console.log(err)
            res
              .status(500)
              .json({ message: 'Something went wrong', error: err })
          })
        res.status(200).json({
          message: `Process ${processID} was updated successfully`,
          update: updateC,
        })
      }
      //user.roleID is mentor so update the the comment and status given by mentor
      else if (user.roleID === 2) {
        //if user is mentor
        const updateC = await prisma.process
          .update({
            where: { processID: processID },
            data: {
              mentorProcessedComments: comment,
              status: status,
              mentorProcessed: new Date(),
            },
          })
          .catch((err) => {
            console.log(err)
            res
              .status(500)
              .json({ message: 'Something went wrong', error: err })
          })
        res.status(200).json({
          message: `Process ${processID} was updated successfully`,
          update: updateC,
        })
      }
      //user.roleID is user
      else if (user.roleID === 3) {
        // if user is student
        const updatedProcess = await prisma.process
          .update({
            where: { processID: processID },
            data: {
              status: status,
            },
          })
          .catch((err) => {
            console.log(err)
            res
              .status(500)
              .json({ message: 'Something went wrong', error: err })
          })
        res.status(200).json({
          message: `Process ${processID} was updated successfully`,
          update: updatedProcess,
        })
      }
    }
  }
}
