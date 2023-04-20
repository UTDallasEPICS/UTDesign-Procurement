import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'
import {
  OtherExpense,
  Process,
  Request,
  RequestItem,
  Status,
} from '@prisma/client'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // first verify the user and get the project they are working on
    /// using the works on
    const user = await prisma.user.findUnique({
      where: {
        netID: req.body.netID,
      },
      include: {
        WorksOn: true,
      },
    })

    if (!user) {
      throw new Error('Could not find that user')
    }

    // this will be the array of Request Forms that will be sent
    let requestsOfMultipleProjects: (Request & {
      RequestItem: RequestItem[]
      OtherExpense: OtherExpense[]
      Process: Process[]
    })[][] = []
    // requests given back would be like this [[requests for project 1], [requests for project 2]]

    // first find requests associated with a project
    for (const project of user.WorksOn) {
      const requests = await prisma.request.findMany({
        where: { projectID: project.projectID },
        include: {
          RequestItem: true,
          Process: true,
          OtherExpense: true,
        },
      })

      let filteredRequests: (Request & {
        RequestItem: RequestItem[]
        OtherExpense: OtherExpense[]
        Process: Process[]
      })[]

      // filters the request based on the status and user's roleID
      // admin can see all requests that are APPROVED
      if (user.roleID === 1) {
        filteredRequests = requests.filter(
          (request) => request.Process[0].status === Status.APPROVED
        )
      }
      // mentor can see all requests that are UNDER_REVIEW
      else if (user.roleID === 2) {
        filteredRequests = requests.filter(
          (request) => request.Process[0].status === Status.UNDER_REVIEW
        )
      }
      // Students can see all requests ???
      else {
        filteredRequests = requests
      }
      requestsOfMultipleProjects.push(filteredRequests)
    }
    console.log('Requests associated with user: ', requestsOfMultipleProjects)
    res
      .status(200)
      .json({ userRole: user.roleID, requests: requestsOfMultipleProjects })
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
