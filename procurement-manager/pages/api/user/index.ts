/**
 * Type safe for requesting body
 * https://stackoverflow.com/questions/69893369/how-to-add-typescript-types-to-request-body-in-next-js-api-route/70788003#70788003
 */
// pages/api/users.js
// pages/api/users.js

import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'
import { validateEmailAndReturnNetID } from '@/lib/netid'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  /* This code is defining a handler function for a Next.js API route that handles both GET and POST
  requests. */
  /* This code block is handling a GET request to retrieve all users from the database using Prisma's
  `findMany` method. If the request is successful, it sends a JSON response with the user data and a
  status code of 200 (indicating that the request was successful). If there is an error, it sends a
  JSON response with an error message and a status code of 500 (indicating that there was a server
  error). */
  if (req.method === 'GET') {
    try {
      const users = await prisma.user.findMany()
      res.status(200).json(users)
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' })
    }
  } /* This code block is handling a POST request to create a new user. It is extracting the necessary
  data from the request body (first name, last name, email, responsibilities, and role ID), using
  that data to create a new user in the database using Prisma's `create` method, and then sending
  a JSON response with the newly created user data and a status code of 201 (indicating that the
  request was successful and a new resource was created). */ else if (
    req.method === 'POST'
  ) {
    const { firstName, lastName, email, responsibilities, roleID } = req.body
    try {
      const requiresValidNetID = roleID == 3; // check if student
      const netID = validateEmailAndReturnNetID(email, requiresValidNetID);
      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          netID: netID, // gets netID from email
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
    res.status(405).json({ error: 'Invalid method' })
  }
}
