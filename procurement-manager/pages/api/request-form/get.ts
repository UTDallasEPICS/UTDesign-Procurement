import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // const requestForm = await prisma.req
    // first verify the user and get the project they are working on
    /// using the works on
    const user = await prisma.user.findUnique({
      where: {
        netID: req.body.netID,
      },
    })
    // first find requests associated with a project from Process API
  } catch (error) {
    console.log(error)
    if (error instanceof Error)
      res.status(500).json({
        message: 'Internal Server Error',
        error: error.message,
      })
    else
      res.status(500).json({
        error: error,
      })
  }
}
