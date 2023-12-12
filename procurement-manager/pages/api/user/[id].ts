/*
if get request then returns user for userID query param
if post request then returns all users in a project for projectID query param (current and past users since worksOn schema was updated)
*/

import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const id = parseInt(req.query.id as string)
    if (req.method === 'GET') {
      const user = await prisma.user.findUnique({
        where: {
          userID: id,
        },
      })
      if (!user) {
        res.status(404).json({ message: 'User not found' })
        throw new Error('Could not find that user')
      }
      res.status(200).json(user)
    }
    else if (req.method == 'POST') {
        const project = await prisma.project.findUnique({
            where:
            { projectID: id},
            include:
            { WorksOn: true }
        })

        if (!project) throw new Error('Project not found')

        const users = await prisma.user.findMany({
            where: { WorksOn: { some: { projectID: project?.projectID } } }, // find all users with this project in their WorksOn list
        })

        res.status(200).json({ users })
    }
  } catch (error) {
    res.status(500).json(error)
  }
}
