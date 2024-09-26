// API to get the orders placed for a request
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'

//API call to get data from the project request Item
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      //Get information from the particular model
      const projectSearch = await prisma.project.findMany();
      res.status(200).json(projectSearch);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching items' });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}