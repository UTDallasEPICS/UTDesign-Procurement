/*
API returns user based on userID query param
*/

import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const id = parseInt(req.query.id as string)
    if (req.method === 'GET') {
      const user = await prisma.user.findFirst({
        where: {
          userID: id,
        },
      })
      if (!user) {
        res.status(404).json({ message: 'User not found' })
        throw new Error('Could not find that user')
      }
      res.status(200).json(user)
    }
  } catch (error) {
    res.status(500).json(error)
  }
}
