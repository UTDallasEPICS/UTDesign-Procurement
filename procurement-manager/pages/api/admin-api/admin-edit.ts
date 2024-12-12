import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { type, id, field, value } = req.body;

  try {
    if (type === 'user') {
      await prisma.user.update({
        where: { userID: id },
        data: { [field]: value },
      });
    } else if (type === 'project') {
      await prisma.project.update({
        where: { projectID: id },
        data: { [field]: value },
      });
    }

    res.status(200).json({ message: 'Updated successfully' });
  } catch (error) {
    console.error('Error updating:', error);
    res.status(500).json({ message: 'Error updating data' });
  }
} 