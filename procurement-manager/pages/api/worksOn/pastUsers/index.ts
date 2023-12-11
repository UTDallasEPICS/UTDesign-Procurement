/* API to get all the previous users on a project (returns worksOn entries of users with an end date that isn't null,
 meaning worksOn with a null end date are disregarded)
*/
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'GET') {
        try{
            const projectID = Number(req.query.projectID as string)

            let worksOn = await prisma.worksOn.findMany({
                where:{
                    AND:[
                        {projectID: projectID},
                        {endDate:{not:null}}
                    ]
                }
            })

            if (worksOn === null) throw new Error

            res.status(200).json({ worksOn })
        }
        catch (error) {
            res.status(500).json({error: 'WorksOn not found'})
        }
    }
    else
    {
        res.status(400).json({ error: 'Invalid method' })
    }
}