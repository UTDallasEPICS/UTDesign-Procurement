/*
API for deleting users and projects from the database connected with AdminDeleteButtonModal.tsx
*/ 
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { type, id } = req.body // type will be either 'user' or 'project'

  //deleting a user
  try {
    if (type === 'user') {
      const user = await prisma.user.delete({
        where: {
          userID: id
        }
      })
      return res.status(200).json(user)
    }
    //deleting a project
    if (type === 'project') {
      const project = await prisma.project.delete({
        where: {
          projectID: id
        }
      })
      return res.status(200).json(project)
    }

    return res.status(400).json({ error: 'Invalid type specified' })
  } catch (error) {
    console.error('Error in admin-delete:', error)
    return res.status(500).json({ error: 'Failed to delete record' })
  }
}