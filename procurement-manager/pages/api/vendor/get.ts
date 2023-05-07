import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const vendors = await prisma.vendor.findMany()
      res.status(200).json(vendors)
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch vendors' })
    }
  }
}
