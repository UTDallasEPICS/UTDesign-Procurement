import { prisma } from '@/db';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { vendorID, newStatus } = req.body;

    if (!vendorID || !newStatus) {
      return res.status(400).json({ error: 'Invalid request parameters.' });
    }

    try {
      // Update vendorStatus in the database
      await prisma.vendor.update({
        where: { vendorID },
        data: { vendorStatus: newStatus },
      });

      return res.status(200).json({ message: 'Vendor status updated successfully.' });
    } catch (error) {
      console.error('Error updating vendor status:', error);
      return res.status(500).json({ error: 'Failed to update vendor status.' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed.' });
  }
}