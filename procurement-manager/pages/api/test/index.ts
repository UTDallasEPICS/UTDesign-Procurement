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

    // create sample student
    await prisma.user.create({
      data: {
        netID: 'abc000000',
        firstName: 'Student',
        lastName: '1',
        email: 'abc000000@utdallas.edu',
        active: true,
        role: { connect: { roleID: 3 } },
      },
    })

    // create sample mentor
    await prisma.user.create({
      data: {
        netID: 'def000000',
        firstName: 'Mentor',
        lastName: '1',
        email: 'def000000@utdallas.edu',
        active: true,
        role: { connect: { roleID: 2 } },
      },
    })

    // create sample admin
    await prisma.user.create({
      data: {
        netID: 'ghi000000',
        firstName: 'Admin',
        lastName: '1',
        email: 'ghi000000@utdallas.edu',
        active: true,
        role: { connect: { roleID: 1 } },
      },
    })

    // create sample project
    await prisma.project.create({
      data: {
        projectType: 'EPICS',
        projectNum: 1000,
        projectTitle: 'Sample Project 1',
        startingBudget: 1000.0,
        sponsorCompany: 'Sample Company 1',
        activationDate: new Date(),
      },
    })

    // create sample project 2
    await prisma.project.create({
      data: {
        projectType: 'EPICS',
        projectNum: 1001,
        projectTitle: 'Sample Project 2',
        startingBudget: 1010.0,
        sponsorCompany: 'Sample Company 2',
        activationDate: new Date(),
      },
    })

    // create sample project 3
    await prisma.project.create({
      data: {
        projectType: 'EPICS',
        projectNum: 1002,
        projectTitle: 'Sample Project 3',
        startingBudget: 1100.0,
        sponsorCompany: 'Sample Company 3',
        activationDate: new Date(),
      },
    })

    // create sample request
    await prisma.request.create({
      data: {
        dateNeeded: new Date(),
        dateSubmitted: new Date(),
        dateOrdered: new Date(),
        dateReceived: new Date(),
        dateApproved: new Date(),
        additionalInfo: 'Some Additional info',
        project: {
          connect: { projectID: 1 },
        },
        student: {
          connect: { userID: 1 },
        },
      },
    })

    // Connect student to a project
    await prisma.worksOn.create({
      data: {
        user: { connect: { netID: 'abc000000' } },
        project: { connect: { projectNum: 1000 } },
        startDate : new Date(),
      },
    })

    // Connect mentor to a project
    await prisma.worksOn.create({
      data: {
        user: { connect: { netID: 'def000000' } },
        project: { connect: { projectNum: 1000 } },
        startDate : new Date(),
      },
    })


    // Connect mentor to a project 2
    await prisma.worksOn.create({
      data: {
        user: { connect: { netID: 'def000000' } },
        project: { connect: { projectNum: 1001 } },
        startDate : new Date(),
      },
    })


    // Create a sample vendor
    await prisma.vendor.createMany({
      data: [
        { vendorName: 'Sample Vendor 1' },
        { vendorName: 'Sample Vendor 2' },
        { vendorName: 'Sample Vendor 3' },
      ],
      skipDuplicates: true,
    })

    res.status(200).json({ message: 'Responded Successfully!' })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Internal Server Error', error: error })
  }
}
