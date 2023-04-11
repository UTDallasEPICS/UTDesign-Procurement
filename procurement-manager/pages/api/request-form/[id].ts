import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // TODO :: use type safe stuff for req.body
  try {
    if (req.method === 'GET') {
      const project = await prisma.project.findFirst({
        where: {
          projectNum: req.body.projectNum,
        },
      })
      if (project) {
        // project was found
        res.status(200).json({
          message: 'Finding project successful',
          data: project,
        })
      } else {
        // project was not found
        res.status(400).json({
          message: 'Finding project unsuccessful',
        })
      }
    }
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
