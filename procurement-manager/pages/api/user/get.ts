/**
 * This endpoint gives the users associated with a project
 */

import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) 
{
    try {
        if (req.method !== 'POST') throw new Error('Invalid method')

        const {projectNum} = req.body 
        const project = await prisma.project.findUnique({
            where:
            { projectNum: projectNum},
            include:
            { WorksOn: true }
        })

        const users = await prisma.user.findMany({
            where: { WorksOn: { some: { projectID: project?.projectID } } }, // find all users with this project in their WorksOn list
        })

        res.status(200).json({ users })

        if (!project) throw new Error('Project not found')
    } catch(error) {
        if (error instanceof Error) res.status(500).json({ message: error.message})
    }
}