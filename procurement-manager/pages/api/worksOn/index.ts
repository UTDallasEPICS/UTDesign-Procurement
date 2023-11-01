import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {

    if (req.method === 'GET') {
        try{
            const WorksOns = await prisma.worksOn.findMany() // get all works on entries in database
            res.status(200).json(WorksOns)
        }
        catch(error) {
            res.status(500).json({ error: 'failed to fetch worksOn entries' })
        }
    }
    else if (req.method === 'POST') {
        const {netID, projectNum} = req.body // to create new works on entry for a specific user and project
        try {
            const worksOn = await prisma.worksOn.create({
                data: {
                  user: { connect: { netID: netID } },
                  project: { connect: { projectNum: projectNum } },
                  startDate: new Date(), // since starting at the time admin creates user, user is a current project user
                },
              })
              res.status(201).json(worksOn)
        }
        catch(error) {
            res.status(500).json({ error: 'failed to create worksOn entry' })
        }    
    }
    else {
        res.status(400).json({ error: 'Invalid method' })
    }
}