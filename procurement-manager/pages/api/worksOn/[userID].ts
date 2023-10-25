import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'

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
}