//this API finds the users that work on a project based on the inputed project number
//it is used in the AdminSortByProjectModal.tsx component
/*Basically doing this:
SELECT u.*
FROM User u
JOIN WorksOn w ON u.userID = w.userID
JOIN Project p ON w.projectID = p.projectID
WHERE p.projectNum = 12345;

except the 12345 is a variable we pass in.
*/
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { searchTerm } = req.body
    console.log('Searching for project number:', searchTerm)

    const project = await prisma.project.findFirst({
      where: { projectNum: searchTerm },
      include: {
        WorksOn: {
          include: {
            user: {
              select: {
                userID: true,
                firstName: true,
                lastName: true,
                netID: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!project) {
      return res.status(200).json({ users: [] });
    }

    const users = project.WorksOn.map(work => work.user);
    console.log('Users found:', users);
    return res.status(200).json({ users: users });

  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ 
      message: 'Error searching for users',
      error: (error as any).message 
    });
  }
}
