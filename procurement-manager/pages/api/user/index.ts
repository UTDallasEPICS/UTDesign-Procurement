import { Prisma } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'
// POST request
// get email, first name, last name from SSO,
// get netID from email

// create user - POST
// only UTDesign users can login, not everyone in UTD can sign in
/**
 * await prisma.user.create({
 * data: { ... }
 * }
 */

// get / auth user - POST
/// use SSO to verify username (netID) and password
/// once SSO gives us like success or something
//// get the user role
//// data = token, user role, basic user info
//// send back data to front end using res
/**
 * Type safe for requesting body
 * https://stackoverflow.com/questions/69893369/how-to-add-typescript-types-to-request-body-in-next-js-api-route/70788003#70788003
 */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await prisma.role.createMany({
    data: [
      {
        role: 'Admin',
      },
      {
        role: 'Mentor',
      },
      {
        role: 'Student',
      },
    ],
  })
  await prisma.user.create({
    data: {
      netID: 'AXT210117',
      firstName: 'Ananth',
      lastName: 'Tekkalakota',
      email: 'axt210117@utdallas.edu',
      active: true,
      role: { connect: { roleID: 1 } },
    },
  })

  if (req.method == 'GET') {
    const { Firstname, Lastname, email } = req.body
    const user = prisma.user.findUnique({
      where: {
        //email.slice(0,9)
        email,
      },
    })
    if (!user) {
      res.status(404).json({ error: 'User Not Found' })
      return
    } else {
      res.status(200).json({ user: user })
    }
  }
}
/*const { body } = req
  try {
    if ('role' in body && typeof body.role === 'string') {
      const role: string = req.body.role
      res.status(200).json({ givenRole: role })
    }
  } catch (error) {}
}*/
