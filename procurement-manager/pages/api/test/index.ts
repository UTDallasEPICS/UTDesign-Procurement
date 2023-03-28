import { PrismaClient } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // const response = await prisma.role.create({
    //   data: {
    //     role: 'Admin',
    //     roleID: 1,
    //   },
    // })

    const response = await prisma.role.count()
    console.log(response)
    res.status(200).json({ message: 'Responded Successfully!', data: response })
  } catch (error) {
    console.log(error)
    res.status(500).send('Internal Server Error')
  }

  // const response = await prisma.user.create({
  //   data: {
  //     netID: 'rab210006',
  //     firstName: 'Rommel Isaac',
  //     lastName: 'Baldivas',
  //     email: 'rab210006@utdallas.edu',
  //     active: true,
  //     roleID: 3,
  //   },
  // })
}
