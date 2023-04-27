import { Prisma, PrismaClient, Project } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'

const prisma = new PrismaClient({ log: ['query'] })

/**
 * This is an async function that creates a project using the Prisma ORM.
 * @param {Project} req - The parameter `req` is an object of type `Project` that contains the data
 * needed to create a new project in the database. The specific properties and their values will depend
 * on the structure of the `Project` type.
 */

async function createProject(req: Project) {
  await prisma.project.create({
    data: req,
  })
}

/**
 * This is an async function that handles a POST request to create a project and returns a JSON
 * response with the result and a message.
 * @param {NextApiRequest} req - NextApiRequest object, which represents the incoming HTTP request.
 * @param {NextApiResponse} res - The `res` parameter is an instance of the `NextApiResponse` class,
 * which is used to send the response back to the client. It has methods like `json()` to send a JSON
 * response, `send()` to send a plain text response, and `status()` to set the HTTP status
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const method = req.method

  //post method as we are getting info
  const { netID, processID, comment, status } = req.body
  // first get user's netID ??? from req.body
  const user = await prisma.user.findUnique({
    where: {
      netID: netID,
    },
  })

  let result

  if (req.method === 'POST') {
    result = await createProject(req.body)
    res.json({ result, message: 'project with ${projectId} created' })
  }
}

////////////////////////////////////////////////////////////////////////////////
// admin to create projects
// import { Prisma, PrismaClient } from '@prisma/client'
// const prisma = new PrismaClient({ log: ['query'] })

// import { ok } from "assert";
// import { NextApiRequest, NextApiResponse } from "next";

// // make sure it is admin only
// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//     if(req.method === 'POST'){
//         const body = req.body
//     }

//     res.json({

//     })
// console.log('REQUEST BODY',req.body)

//hard code role id of admin, if user id is admin then allow them to create
//some function which accepts same structure that accepts in the database and creates a similar
//we should get some methods from prisma

//}

// createProject()
//   .then(async () => {
//     await prisma.$disconnect()
//   })
//   .catch(async (e) => {
//     console.error(e)
//     await prisma.$disconnect()
//     process.exit(1)
//   })
