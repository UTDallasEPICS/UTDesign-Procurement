import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'

// admin to create projects
// make sure it is admin only

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const vendors = await prisma.vendor.findMany({
        where: { vendorStatus: 'APPROVED' },
      });
      res.status(200).json(vendors);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching vendors', error });
    }
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
