import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'

// admin to create projects
// make sure it is admin only
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // creating sample vendor
    const response = await prisma.vendor.create({
      data: {
        vendorName: 'Test Vendor',
      },
    })

    res.status(200).json(response)
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error })
  }
}
