/**
 * This endpoint gives the projects associated with a user.
 */

import {NextApiRequest, NextApiResponse} from 'next'
import {prisma} from '@/db'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        if (req.method !== 'DELETE') throw new Error('Invalid method')

        const {netID} = req.body
        const user = await prisma.user.findUnique({
            where: {netID: netID},
            include: {WorksOn: true},
        })

        const {projectNum} = req.body
        const project = await prisma.project.findUnique({
            where:
                {projectNum: parseInt(projectNum)},
            include:
                {WorksOn: true}
        })

        // currently to delete a project, we need the projectID, how do get projectID.
        if (user !== null && project !== null) {
            const projectDeleted = await prisma.worksOn.delete({
                where: {
                    userID_projectID: {userID: user.userID, projectID: project.projectID},
                },
            })
            res.status(200).json({projectDeleted})
        }

        if (!user) throw new Error('User not found')
    } catch (error) {
        if (error instanceof Error) res.status(500).json({message: error.message})
    }
}