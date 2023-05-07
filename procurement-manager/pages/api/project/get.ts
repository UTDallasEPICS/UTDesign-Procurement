/**
 * This endpoint gives the projects associated with a user.
 */

import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== 'POST') throw new Error('Invalid method')

    const { netID } = req.body
    const user = await prisma.user.findUnique({
      where: { netID: netID },
      include: { WorksOn: true },
    })

    const projects = await prisma.project.findMany({
      where: { WorksOn: { some: { userID: user?.userID } } },
    })

    res.status(200).json({ projects })

    if (!user) throw new Error('User not found')
  } catch (error) {
    if (error instanceof Error) res.status(500).json({ message: error.message })
  }
}
