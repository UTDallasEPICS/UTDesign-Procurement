import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userID, projectID, startDate } = req.body;

  try {
    const worksOn = await prisma.worksOn.create({
      data: {
        userID: userID,
        projectID: projectID,
        startDate: new Date(startDate),
      },
    });

    res.status(200).json({ message: 'Project assigned successfully' });
  } catch (error) {
    console.error('Error assigning project:', error);
    res.status(500).json({ message: 'Error assigning project' });
  }
}