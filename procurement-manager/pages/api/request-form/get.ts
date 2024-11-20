import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'
import { Project, Status } from '@prisma/client'
import { RequestDetails } from '@/lib/types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // first verify the user and get the project they are working on
    /// using the works on
    const user = await prisma.user.findUnique({
      where: {
        email: req.body.email,
      },
      include: {
        WorksOn: true,
      },
    })

    if (!user) {
      throw new Error('Could not find that user')
    }

    let worksOn = await prisma.worksOn.findMany({
      where:{ 
          userID: user.userID,
          endDate: null // if no end date then user is still in projects, so current projects
      }
    })

    // this will be the array of Request Forms that will be sent
    let requestsOfMultipleProjects: RequestDetails[][] = []
    let listOfProjects: Project[] = []
    // requests given back would be like this [[requests for project 1], [requests for project 2]]

    // Admin just gets every Request that is approved
    if (user.roleID === 1) {
      const allProjects = await prisma.project.findMany()
      for (const project of allProjects) {
        const requests: RequestDetails[] = await prisma.request.findMany({
          where: {
            projectID: project.projectID,
            Process: {
              some: {
                status: Status.APPROVED,
              },
            },
          },
          include: {
            RequestItem: true,
            Process: true,
            OtherExpense: true,
            project: true,
          },
        })

        requestsOfMultipleProjects.push(requests)
      }

      res.status(200).json({
        userRole: user.roleID,
        projects: allProjects,
        requests: requestsOfMultipleProjects,
      })
      return
    }

    // first find requests associated with a project
    if (worksOn) 
    {
      for (const project of worksOn) {
        const [requests, theProject] = await Promise.all([
          prisma.request.findMany({
            where: { projectID: project.projectID },
            include: {
              RequestItem: true,
              Process: true,
              OtherExpense: true,
              project: true,
            },
          }),
          prisma.project.findUnique({
            where: {
              projectID: project.projectID,
            },
          }),
        ])
  
        let filteredRequests: RequestDetails[]
  
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
  
        // add the project to the list of projects
        if (!theProject) throw new Error('Could not find the project')
        listOfProjects.push(theProject)
      }
    }

    console.debug('Requests associated with user: ', requestsOfMultipleProjects)
    res.status(200).json({
      userRole: user.roleID,
      projects: listOfProjects,
      requests: requestsOfMultipleProjects,
    })
  } catch (error) {
    console.log(error)
    if (error instanceof Error)
      res.status(500).json({
        message: error.message,
        error: error,
      })
    else res.status(500).send(error)
  }
}
