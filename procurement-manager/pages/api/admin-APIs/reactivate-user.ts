import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { id } = req.body
    const updatedUser = await prisma.user.update({
      where: { userID: id },
      data: { 
        active: true,
        deactivationDate: null
      },
    })
    return res.status(200).json({ message: 'User reactivated successfully' })
  } catch (error) {
    console.error('Error reactivating user:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
} 