import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { id } = req.body
    const updatedProject = await prisma.project.update({
      where: { projectID: id },
      data: { deactivationDate: new Date() },
    })
    return res.status(200).json({ message: 'Project deactivated successfully' })
  } catch (error) {
    console.error('Error deactivating project:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
} 