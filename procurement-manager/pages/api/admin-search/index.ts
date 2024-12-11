import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { type, searchTerm } = req.body

  try {
    if (type === 'user') {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { netID: { contains: searchTerm } },
            { firstName: { contains: searchTerm } },
            { lastName: { contains: searchTerm } }
          ]
        }
      })
      return res.status(200).json(users)
    }

    if (type === 'project') {
      const projects = await prisma.project.findMany({
        where: {
          projectNum: parseInt(searchTerm)
        }
      })
      return res.status(200).json(projects)
    }

    return res.status(400).json({ error: 'Invalid type specified' })
  } catch (error) {
    console.error('Error in admin-search:', error)
    return res.status(500).json({ error: 'Search failed' })
  }
} 