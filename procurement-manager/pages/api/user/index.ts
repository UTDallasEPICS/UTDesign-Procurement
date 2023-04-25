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
// pages/api/users.js
// pages/api/users.js

import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const users = await prisma.user.findMany()
      res.status(200).json(users)
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' })
    }
  } else if (req.method === 'POST') {
    const { firstName, lastName, email, responsibilities, roleID } = req.body
    try {
      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          netID: email.split('@')[0], // gets netID from email
          active: true,
          responsibilities,
          role: {
            connect: {
              roleID: roleID,
            },
          },
        },
      })
      res.status(201).json(user)
    } catch (error) {
      res.status(500).json({ error: 'Failed to create user' })
    }
  } else {
    res.status(400).json({ error: 'Invalid method' })
  }
}
