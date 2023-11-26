// API to get all the current projects of a user (returns worksOn entries of user with no end date, so ongoing)

import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'
import axios from 'axios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    if (req.method === 'GET') {
        try{
            const userID = parseInt(req.query.userID as string)

            let worksOn = await prisma.worksOn.findMany({
                where:{ 
                    userID: userID,
                    endDate: null // if no end date then user is still in projects, so current projects
                }
            })

            if (worksOn === null) throw new Error('no current worksOn entries')  // since userID and projectID is either invalid or user is not in that project

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
    else
    {
        res.status(400).json({ error: 'Invalid method' })
    }
}