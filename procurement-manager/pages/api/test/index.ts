// THIS FILE IS TO CREATE THE SAMPLE DATA FOR THE DATABASE WHEN IT IS RESET
// BECAUSE THERE ARE NO ERROR HANDLING, ONLY CALL THIS ENDPOINT ONCE AFTER RESET

import { PrismaClientKnownRequestError } from '@prisma/client/runtime/binary'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    res.status(405).json({ data: null, error: 'Method Not Allowed' })
    return
  }

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
        projectNum: 10000, // Changed because Sample Files to be uploaded have projects greater than 1000
        projectTitle: 'Sample Project 1',
        startingBudget: 100000,
        sponsorCompany: 'Sample Company 1',
        activationDate: new Date(),
      },
    })

    // create sample project
    await prisma.project.create({
      data: {
        projectType: 'EPICS',
        projectNum: 20000, // Changed because Sample Files to be uploaded have projects greater than 1000
        projectTitle: 'Sample Project 2',
        startingBudget: 100000,
        sponsorCompany: 'Sample Company 1',
        activationDate: new Date(),
      },
    })

    //create sample request
    // await prisma.request.create({
    //   data: {
    //     dateNeeded: new Date(),
    //     dateSubmitted: new Date(),
    //     dateOrdered: new Date(),
    //     dateReceived: new Date(),
    //     dateApproved: new Date(),
    //     additionalInfo: 'Some Additional info',
    //     project: {
    //       connect: { projectID: 1 },
    //     },
    //     student: {
    //       connect: { userID: 1 },
    //     },
    //   },
    // })

    // Connect student to project 1
    await prisma.worksOn.create({
      data: {
        user: { connect: { email: 'abc000000@utdallas.edu' } },
        project: { connect: { projectNum: 10000 } },
        startDate: new Date(),
      },
    })

    // Connect mentor to project 1
    await prisma.worksOn.create({
      data: {
        user: { connect: { email: 'def000000@utdallas.edu' } },
        project: { connect: { projectNum: 10000 } },
        startDate: new Date(),
      },
    })

    // Connect mentor to project 2
    await prisma.worksOn.create({
      data: {
        user: { connect: { email: 'def000000@utdallas.edu' } },
        project: { connect: { projectNum: 20000 } },
        startDate: new Date(),
      },
    })

    // Create a sample vendor
    await prisma.vendor.createMany({
      data: [
        { vendorName: 'Sample Vendor 1', vendorStatus: 'APPROVED'  },
        { vendorName: 'Sample Vendor 2', vendorStatus: 'PENDING' },
        { vendorName: 'Sample Vendor 3', vendorStatus: 'DENIED' },
      ],
      skipDuplicates: true,
    })

    res.status(200).json({ message: 'Responded Successfully!' })
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002')
        res.status(200).json({ message: 'Test API has been called already!' })
      res.status(500).json({ message: 'Internal Server Error', error: error })
    } else if (error instanceof Error) {
      if ('code' in error) {
        if (error.code === 'P2002')
          res.status(200).json({
            message: 'Test API has been called already!',
            error: error,
          })
      }
    } else {
      console.log(error)
      res.status(500).json({ message: 'Internal Server Error', error: error })
    }
  }
}
