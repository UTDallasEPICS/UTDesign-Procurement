// API to get all the current users of a project, returns both works on entries and users

import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'
import { Prisma, Project, WorksOn, User } from '@prisma/client'
import axios from 'axios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    if (req.method === 'GET') {
        try{
            const { query: { projectID }, method } = req;

            const project = await prisma.project.findUnique({
                where: {
                    projectID: Number(projectID)
                }
            })
            if (project === null) throw new Error('invalid projectID')

            let worksOns = await prisma.worksOn.findMany({
                where:{ 
                    projectID: Number(projectID),
                    endDate: null // if no end date then users are still in project, so current users
                }
            })
            if (worksOns === null || worksOns.length === 0) throw new Error('no current worksOn entries') 
            // to prevent finding users if no works on entries or if empty array returned

            let users: User[] = []
            for (const worksOn of worksOns) {
                const user = await prisma.user.findUnique({
                    where: {
                        userID: worksOn.userID
                    }
                })
                if (user === null) throw new Error('invalid current user')

                users.push(user)
            }

            res.status(200).json({ 
                worksOnEntries: worksOns,
                worksOnUsers: users,
            })
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
    else
    {
        res.status(400).json({ error: 'Invalid method' })
    }
}