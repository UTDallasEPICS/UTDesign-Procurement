// THIS FILE IS TO CREATE THE SAMPLE DATA FOR THE DATABASE WHEN IT IS RESET
// BECAUSE THERE ARE NO ERROR HANDLING, ONLY CALL THIS ENDPOINT ONCE AFTER RESET

import { PrismaClient } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // create roles
    await prisma.role.createMany({
      data: [{ role: 'Admin' }, { role: 'Mentor' }, { role: 'Student' }],
    })

    // create sample user
    await prisma.user.create({
      data: {
        netID: 'abc000000',
        firstName: 'Person',
        lastName: '1',
        email: 'abc000000@utdallas.edu',
        active: true,
        role: { connect: { roleID: 3 } },
      },
    })

    // create sample project
    await prisma.project.create({
      data: {
        projectType: 'EPICS',
        projectNum: 1566,
        projectTitle: 'Sample Project',
        startingBudget: 1000.0,
        sponsorCompany: 'Sample Company',
        activationDate: new Date(),
      },
    })

    // Connect user to a project
    await prisma.worksOn.create({
      data: {
        user: {
          connect: {
            netID: 'abc000000',
          },
        },
        project: {
          connect: {
            projectNum: 1566,
          },
        },
      },
    })

    // Create a sample vendor
    await prisma.vendor.create({
      data: {
        vendorName: 'Sample Vendor',
      },
    })

    res.status(200).json({ message: 'Responded Successfully!' })
  } catch (error) {
    console.log(error)
    res.status(500).send('Internal Server Error')
  }
}
