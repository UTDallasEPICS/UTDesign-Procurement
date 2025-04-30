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

  const { type, id } = req.body

  try {
    if (type === 'user') {
      // First, delete all WorksOn relationships for this user
      await prisma.worksOn.deleteMany({
        where: {
          userID: id
        }
      });

      // Then delete the user
      const user = await prisma.user.delete({
        where: {
          userID: id
        }
      });
      
      return res.status(200).json(user);
    }

    if (type === 'project') {
      // First, delete all WorksOn relationships for this project
      await prisma.worksOn.deleteMany({
        where: {
          projectID: id
        }
      });

      const project = await prisma.project.delete({
        where: {
          projectID: id
        }
      });
      
      return res.status(200).json(project);
    }

    return res.status(400).json({ error: 'Invalid type specified' });
  } catch (error) {
    console.error('Error in admin-delete:', error);
    return res.status(500).json({ error: 'Failed to delete record' });
  }
}