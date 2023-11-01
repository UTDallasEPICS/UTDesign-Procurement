// API to deactivate user in project (make current project user a past user) by updating endDate in worksOn

import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    if (req.method === 'POST') {
        try {
            const user = await prisma.user.findUnique({
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

            const worksOnVals = await prisma.worksOn.findFirst({
                where: {
                    userID: user.userID,
                    projectID: project.projectID,
                    startDate: new Date(req.body.startDate) // passed in start date in correct date format
                }
            })

            if ('comments' in req.body && typeof req.body.comments === 'string') {
                const worksOn = await prisma.worksOn.updateMany({
                    where: {
                        userID: user.userID,
                        projectID: project.projectID,
                        startDate: new Date(req.body.startDate) // passed in start date in correct date format
                    },
                    data: {
                        endDate: new Date(), // since starting at the time admin deactivates user, user is no longer in project and is a past project user
                        comments: req.body.comments // since only update comments if it was passed in, is optional field
                    }
                })
                if (worksOn === null) throw new Error('user is not in project')

                res.status(200).json( { worksOnVals })
            }
            else {
                const worksOn = await prisma.worksOn.updateMany({
                    where: {
                        userID: user.userID,
                        projectID: project.projectID,
                        startDate: new Date(req.body.startDate) // passed in start date in correct date format
                    },
                    data: {
                        endDate: new Date(), // since starting at the time admin deactivates user, user is no longer in project and is a past project user
                    }
                })
                if (worksOn === null) throw new Error('user is not in project')

                res.status(200).json( { worksOnVals })
            }
        }
        catch (error) {
            if (error instanceof Error) res.status(500).json({ message: error.message })
        }
    }
    else {
        res.status(400).json({ error: 'Invalid method' })
    }
}