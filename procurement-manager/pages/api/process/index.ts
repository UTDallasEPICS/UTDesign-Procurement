import { Prisma, Status } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'
//Menotr will either approve or reject request for tiem and provide a comment as to why
//this information needs to be sent to the student (status update)
//only approved request by mentor reaches admin
//admin approves or declines this information is then sent to student and mentor withe comments
//admin also tells students to pickup when ready

// GET for mentors
//mentors would be assigned or view only specific project id's
/// filter Processes for status === UNDER_REVIEW && NOT CANCELLED, get projectID from requestID

// GET for admins
// filter Process for status === APPROVED
// admin can see every process that is approved by mentors

// IF PROCESS IS CANCELLED DO PATCH/PUT REQUEST - prob used by students
// find Process
// change status of Process to CANCELLED

// IF PROCESS IS APPROVED BY ADMIN
// create an order and put in database
// ??? ask Oddrun and Navaneeth about how creating a new Order into database will work
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method == 'POST') {
    const { netID } = req.body
    const user = await prisma.user.findUnique({
      where: {
        netID: netID,
      },
    })
    if (user != null) {
      if (user.roleID == 1) {
        //if user is admin
        const data = await prisma.process.findMany({
          where: {
            status: Status.APPROVED,
          },
        })
        res.status(200).json(data)
      } else if (user.roleID == 2) {
        //if user is mentor
        const data = await prisma.process.findMany({
          where: {
            status: Status.UNDER_REVIEW,
          },
        })
        res.status(200).json(data)
      } else if (user.roleID == 3) {
        //if user is student
        const data = await prisma.process.findMany({
          where: {
            status: Status.REJECTED,
          },
        })
        res.status(200).json(data)
      }
    } else {
      res.status(404).json({ message: 'NetID not found' })
    }
    //const response = await prisma.process.findMany()
    //res.send(response)
    //res.status(200).json({process :process})
  }
}
