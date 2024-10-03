import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const approvedVendors = await prisma.vendor.findMany({
        where: {
          vendorStatus: 'APPROVED',
        },
      });

      res.status(200).json(approvedVendors);
    } catch (error: any) {
      res.status(500).json({ message: 'Error fetching approved vendors', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
