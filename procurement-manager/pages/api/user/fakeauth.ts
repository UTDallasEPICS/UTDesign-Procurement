import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'

/**
 * This is an async function that handles a POST request, finds a user based on their role ID using
 * Prisma, and returns a JSON response with the user's information.
 * @param {NextApiRequest} req - The NextApiRequest object represents the incoming HTTP request in a
 * Next.js API route. It contains information about the request such as the HTTP method, headers, and
 * body.
 * @param {NextApiResponse} res - `res` stands for the Next.js `NextApiResponse` object, which is used
 * to send the HTTP response to the client. It contains methods such as `status()` to set the HTTP
 * status code, `json()` to send a JSON response, and `send()` to send a plain text response
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== 'POST') {
      throw new Error('Method not allowed')
    }
    const { roleID } = req.body

    const user = await prisma.user.findFirst({
      where: { roleID: roleID },
    })
    console.log(`\n`, user)
    if (!user) throw new Error('Could not find that user')
    else res.status(200).json({ message: 'User found', user })
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).send(error.message)
    }
  }
}
