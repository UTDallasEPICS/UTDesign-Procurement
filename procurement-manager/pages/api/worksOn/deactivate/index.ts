// API to deactivate user in project (make current project user a past user) by updating endDate in worksOn

import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    if (req.method === 'POST') {
        try {
            // TODO: use email instead of netID
            const user = await prisma.user.findFirst({
                where: {
                    netID: req.body.netID
                }
            })
            
            if (user === null) throw new Error('not a valid user')
    
            const project = await prisma.project.findUnique({
                where: {
                    projectNum: Number(req.body.projectNum)
                }
            })
            
            if (project === null) throw new Error('not a valid project')
            
            let updateWorksOn 
            if ('comments' in req.body && typeof req.body.comments === 'string') {
                updateWorksOn = await prisma.worksOn.update({
                    where: {
                        userID_projectID_startDate: { // // composite key - finds entry using unique combination of userID, projectID, and startDate
                            userID: user.userID,
                            projectID: project.projectID,
                            startDate: new Date(req.body.startDate) // passed in start date in correct date format
                        }
                    },
                    data: {
                        endDate: new Date(), // since starting at the time admin deactivates user, user is no longer in project and is a past project user
                        comments: req.body.comments // since only update comments if it was passed in, is optional field
                    }
                })
                if (updateWorksOn === null) throw new Error('user is not in project')
            }
            else {
                updateWorksOn = await prisma.worksOn.update({
                    where: {
                        userID_projectID_startDate: {
                            userID: user.userID,
                            projectID: project.projectID,
                            startDate: new Date(req.body.startDate) // passed in start date in correct date format
                        }
                    },
                    data: {
                        endDate: new Date(), // since starting at the time admin deactivates user, user is no longer in project and is a past project user
                    }
                })
                if (updateWorksOn === null) throw new Error('user is not in project')
            }

            const worksOn = await prisma.worksOn.findUnique({ // find updated worksOn entry and return as JSON
                where: {
                    userID_projectID_startDate: {
                        userID: user.userID,
                        projectID: project.projectID,
                        startDate: new Date(req.body.startDate) // passed in start date in correct date format
                    }
                }
            })
            res.status(200).json({ worksOn }) 
        }
        catch (error) {
            console.log(error)
            if (error instanceof Error)
            res.status(500).json({
                message: error.message,
                error: error,
            })
            else res.status(500).send(error)
        }
    }
    else {
        res.status(400).json({ error: 'Invalid method' })
    }
}