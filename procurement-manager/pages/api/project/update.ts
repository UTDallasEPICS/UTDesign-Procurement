// API to update information in project

import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'POST') {
        try {
            let project = await prisma.project.findUnique({
                where: {
                    projectID: req.body.projectID // use projectID and not projectNum to check project to avoid error if updated projectNum
                }
            })

            if (project === null) throw new Error('not a valid project')

            if ('totalExpenses' in req.body && typeof req.body.totalExpenses === 'number') {
                const updatedProject = await prisma.project.updateMany({
                    where: {
                        projectID: project.projectID,
                    },
                    data: {
                        totalExpenses: req.body.totalExpenses // only update totalExpenses if it was passed in
                    }
                })
                if (updatedProject === null) throw new Error('invalid project')

            }
            if('projectNum' in req.body && typeof req.body.projectNum === 'number') {
                const updatedProject = await prisma.project.updateMany({
                    where: {
                        projectID: project.projectID,
                    },
                    data: {
                        projectNum: req.body.projectNum // only update projectNum if it was passed in
                    }
                })
                if (updatedProject === null) throw new Error('invalid project')

            }
            if('projectTitle' in req.body && typeof req.body.projectTitle === 'string') {
                const updatedProject = await prisma.project.updateMany({
                    where: {
                        projectID: project.projectID,
                    },
                    data: {
                        projectTitle: req.body.projectTitle // only update projectTitle if it was passed in
                    }
                })
                if (updatedProject === null) throw new Error('invalid project')

            }
            if('startingBudget' in req.body && typeof req.body.startingBudget === 'number') {
                const updatedProject = await prisma.project.updateMany({
                    where: {
                        projectID: project.projectID,
                    },
                    data: {
                        startingBudget: req.body.startingBudget // only update startingBudget if it was passed in
                    }
                })
                if (updatedProject === null) throw new Error('invalid project')

            }
            if('sponsorCompany' in req.body && typeof req.body.sponsorCompany === 'string') {
                const updatedProject = await prisma.project.updateMany({
                    where: {
                        projectID: project.projectID,
                    },
                    data: {
                        sponsorCompany: req.body.sponsorCompany // only update sponsorCompany if it was passed in
                    }
                })
                if (updatedProject === null) throw new Error('invalid project')

            }
            if('additionalInfo' in req.body && typeof req.body.additionalInfo === 'string') {
                const updatedProject = await prisma.project.updateMany({
                    where: {
                        projectID: project.projectID,
                    },
                    data: {
                        additionalInfo: req.body.additionalInfo // only update additionalInfo if it was passed in
                    }
                })
                if (updatedProject === null) throw new Error('invalid project')

            }

            project = await prisma.project.findUnique({
                where: {
                    projectNum: Number(req.body.projectNum)
                }
            })

            res.status(200).json( { project })
            }
        catch (error) {
            console.log(error)
            if (error instanceof Error) res.status(500).json({ message: error.message })
        }
    }
    else {
        res.status(400).json({ error: 'Invalid method' })
    }
}