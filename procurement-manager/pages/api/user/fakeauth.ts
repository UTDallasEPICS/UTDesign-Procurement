import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== 'POST') {
      throw new Error('Method not allowed')
    }
    const { roleID } = req.body

    const user = await prisma.user.findFirst({
      where: { roleID: roleID },
    })
    console.log(`\n`, user)
    if (!user) throw new Error('Could not find that user')
    else res.status(200).json({ message: 'User found', user })
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).send(error.message)
    }
  }
}
