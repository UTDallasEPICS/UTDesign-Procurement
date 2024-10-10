import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'

//API call to get data from the project model
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      //Get information from the a particular model
      const vendors = await prisma.vendor.findMany();
      res.status(200).json(vendors);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching items' });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}