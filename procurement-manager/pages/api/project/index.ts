import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'
// admin to create projects
// make sure it is admin only
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // creating sample data in Project
    const response = await prisma.project.create({
      data: {
        projectType: 'Sample',
        projectNum: 1566,
        projectTitle: 'Sample Project',
        startingBudget: 0,
        sponsorCompany: '',
        activationDate: new Date(),
      },
    })

    res.status(200).json(response)
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error })
  }
}
