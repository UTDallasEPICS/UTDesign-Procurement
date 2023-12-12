/*
 * This endpoint adds a deactivation date to a project given a project number.
 * The request method is only POST.
 */

import {NextApiRequest, NextApiResponse} from 'next'
import {prisma} from '@/db'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'POST') {
        try {
            const projectInfo = await prisma.project.findUnique({
                where: {
                    projectNum: Number(req.body.projectNum)
                }
            })
            if (projectInfo === null) throw new Error('not a valid project')

                const project = await prisma.project.updateMany({
                    where: {
                        projectID: projectInfo.projectID,
                    },
                    data: {
                        deactivationDate: new Date(), //starting at the time admin deactivates the project
                    }
                })
                if (project === null) throw new Error('user is not in project')

                res.status(200).json( { projectInfo })
            }
        catch (error) {
            if (error instanceof Error) res.status(500).json({ message: error.message })
        }
    }
    else {
        res.status(400).json({ error: 'Invalid method' })
    }
}
