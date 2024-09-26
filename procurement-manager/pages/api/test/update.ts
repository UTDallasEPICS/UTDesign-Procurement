// This is just a file to test updates on the sample data

import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await prisma.user.update({
      where: {
        netID: 'ghi000000',
      },
      data: {
        email: 'ghi000000@utdallas.edu',
      },
    })

    res.status(200).json({ message: 'Responded Successfully' })
  } catch (error) {
    console.log(error)
    res.send(error)
  }
}
