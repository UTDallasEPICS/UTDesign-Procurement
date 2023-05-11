/**
 * This function creates a new project in a Prisma database using data from a request.
 * @param {any} req - The parameter `req` is likely an object that contains the data needed to create a
 * new project in the database. The `createProject` function uses this object to create a new project
 * using the Prisma client.
 */
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'

async function createProject(req: any) {
  await prisma.project.create({
    data: req,
  })
}

//nextjs
/**
 * This is an async function that handles a POST request and creates a project if the user making the
 * request is an admin.
 * @param {NextApiRequest} req - The `req` parameter is an object that represents the incoming HTTP
 * request. It contains information about the request such as the HTTP method, headers, URL, and
 * body.
 * @param {NextApiResponse} res - `res` is an object representing the HTTP response that will be sent
 * back to the client. It is of type `NextApiResponse` which is provided by the Next.js framework. It
 * contains methods for setting the response status, headers, and body.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const method = req.method

  let result
  if (req.method === 'POST') {
    //post method as we are getting info
    const { netID, projectInfo } = req.body
    // first get user's netID ??? from req.body
    //console.log("netid",netID);
    const user = await prisma.user.findUnique({
      where: {
        netID: netID,
      },
    })
    //console.log("USer details",user);
    // check for role -- different roles have different functions
    if (user) {
      //user.roleID is admin so update the comment and status given by admin
      if (user.roleID === 1) {
        //if user is admin

        result = await createProject(projectInfo)
        res.json({ result, message: 'project with ${projectId} created' })
      }
    }
  }
}
