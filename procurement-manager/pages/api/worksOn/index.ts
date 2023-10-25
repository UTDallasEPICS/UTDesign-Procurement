import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {

    if (req.method === 'GET') {
        try{
            const WorksOns = await prisma.worksOn.findMany()
            res.status(200).json(WorksOns)
        }
        catch(error) {
            res.status(500).json({ error: 'failed to fetch worksOn entries' })
        }
    }
    else if (req.method === 'POST') {
        const {netID, projectNum} = req.body
        try {
            const worksOn = await prisma.worksOn.create({
                data: {
                  user: { connect: { netID: netID } },
                  project: { connect: { projectNum: projectNum } },
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