import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'
import { Prisma } from '@prisma/client' 
import { validateEmailAndReturnNetID } from '@/lib/netid'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const { type, data } = req.body // type will be either 'user' or 'project'

  try {
    if (type === 'user') {
      const { email, firstName, lastName, roleID, projectNum } = data

      let netID = validateEmailAndReturnNetID(email, false)
      // if no net ID is found then netID will be null otherwise it will be whatever is parsed from the email
      
      if (roleID === 3 && !netID) {
        return res.status(400).json({ 
          error: 'Email must be in the format abc123456@utdallas.edu'
        });
      }

      try {
        const user = await prisma.user.create({
          data: {
            firstName,
            lastName,
            email,
            netID,
            active: true,
            role: {
              connect: { roleID: roleID }
            },
            responsibilities: '',
            ...(projectNum && {
              WorksOn: {
                create: {
                  project: {
                    connect: { projectNum: projectNum }
                  },
                  startDate: new Date(),
                }
              }
            })
          },
        })
        return res.status(201).json(user)
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
          return res.status(400).json({ error: 'Project number not found' })
        }
        console.error('Error in admin-add:', error)
        return res.status(500).json({ error: 'Failed to add user' })
      }
    }

    if (type === 'project') {
      const {
        projectTitle,
        projectNum,
        startingBudget,
        projectType,
        sponsorCompany,
        costCenter,
        additionalInfo,
        initialExpenses
      } = data

      try {
        // Validate numeric fields
        if (isNaN(parseFloat(startingBudget)) || isNaN(parseFloat(initialExpenses))) {
          return res.status(400).json({ 
            error: 'Starting budget and expenses must be valid numbers' 
          });
        }

        const project = await prisma.project.create({
          data: {
            projectTitle,
            projectNum: parseInt(projectNum),
            startingBudget: parseFloat(startingBudget),
            projectType,
            sponsorCompany,
            costCenter: costCenter ? parseInt(costCenter) : null,
            additionalInfo,
            activationDate: new Date(),
            totalExpenses: parseFloat(initialExpenses),
          },
        })
        return res.status(201).json(project)
      } catch (error) {
        console.error('Error in admin-add:', error)
        return res.status(500).json({ error: 'Failed to add project' })
      }
    }

    return res.status(400).json({ error: 'Invalid type specified' })
  } catch (error) {
    console.error('Error in admin-add:', error)
    return res.status(500).json({ error: 'Failed to add record' })
  }
}