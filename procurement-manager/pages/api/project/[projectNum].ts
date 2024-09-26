//pulls up info abt projects from database
//req= GET

/**
 * This is a TypeScript function that handles a GET request to retrieve a project from a Prisma
 * database based on its ID.
 * @param {NextApiRequest} req - NextApiRequest - This is an object that represents the incoming HTTP
 * request in a Next.js API route. It contains information such as the HTTP method, headers, query
 * parameters, and request body.
 * @param {NextApiResponse} res - `res` is an object representing the HTTP response that will be sent
 * back to the client. It has methods like `json()` to send a JSON response, `send()` to send a plain
 * text response, and `status()` to set the HTTP status code of the response.
 */
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const method = req.method
  let num = req.query?.projectNum
  let result
  /* The `if` statement is checking if the HTTP method of the incoming request is a GET request. If it
 is a GET request, the function retrieves a project from a Prisma database based on its ID using the
 `prisma.project.findUnique()` method and sends a JSON response containing the result and a message
 using the `res.json()` method. */
  if (req.method === 'GET') {
    result = await prisma.project.findUnique({
      where: {
        projectNum: Number(num),
      },
    })
    res.json({ result, message: 'message' })
  }
}
