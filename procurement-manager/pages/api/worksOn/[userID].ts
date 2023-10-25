import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'
import axios from 'axios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    if (req.method === 'GET') {
        try{
            const {
                query: {userID, projectID},
                method,
            } = req;
            // request header (since 2 query params): /api/WorksOn/*userID*/?projectID=*projectID*
            // replace ** with the values
    
            let worksOn = await prisma.worksOn.findFirst({
                where:{ 
                    userID: Number(userID), 
                    projectID: Number(projectID),
                }
            })

            if (worksOn === null) throw new Error // since userID and projectID is either invalid or user is not in that project

            res.status(200).json({ worksOn })
        }
        catch (error) {
            res.status(500).json({error: 'WorksOn not found'})
        }
    }
    else if (req.method === 'PUT') {
        try{
            const {
                query: {userID, projectID},
                method,
            } = req;
            // request header (since 2 query params): /api/WorksOn/*userID*/?projectID=*projectID*
            // replace ** with the values

            // PUT will update a user's worksOn  based on passed in userID and projectID
            // this happens by deleting the user's current worksOn if needed and then creating a new worksOn (so now only works if user has just 0 or 1 worksOn)
            const project = await prisma.project.findUnique({
                where:
                { projectID: Number(projectID)},
            })
            if (!project) throw new Error('Project not found')

            const user = await prisma.user.findUnique({
                where:
                { userID: Number(userID)},
            })
            if (!user) throw new Error('User not found')

            const worksOnCur = await prisma.worksOn.findFirst({
                where: {
                    userID: Number(userID),
                }
            })

            if (worksOnCur !== null) {
                const worksOnDeleted = await prisma.worksOn.delete({
                    where: {
                        userID_projectID: {userID: user.userID, projectID: worksOnCur.projectID},
                    },
                })
            }

            const worksOnNew = await prisma.worksOn.create({
                data: {
                    user: { connect: { userID: user.userID } },
                    project: { connect: { projectID: project.projectID } }
                }
            })

            res.status(200).json({ worksOnNew })
        }
        catch (error) {
            if (error instanceof Error) res.status(500).json({message: error.message})
        }
    }
    else
    {
        res.status(400).json({ error: 'Invalid method' })
    }
}