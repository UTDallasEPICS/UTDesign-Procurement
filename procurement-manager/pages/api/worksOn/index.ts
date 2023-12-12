import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    /* This code is defining a handler function for a Next.js API route that handles both GET and POST
      requests. */
    /* This code block is handling a GET request to retrieve all worksOn entries  from the database using Prisma's
    `findMany` method. If the request is successful, it sends a JSON response with the worksOn data and a
    status code of 200 (indicating that the request was successful). If there is an error, it sends a
    JSON response with an error message and a status code of 500 (indicating that there was a server
    error). */
    if (req.method === 'GET') {
        try{
            const WorksOns = await prisma.worksOn.findMany() // get all works on entries in database
            res.status(200).json(WorksOns)
        }
        catch(error) {
            res.status(500).json({ error: 'failed to fetch worksOn entries' })
        }
    }
    else if (req.method === 'POST') { //This code block is handling a POST request to create a worksOn entry
        const {netID, projectNum} = req.body // to create new worksOn entry you require a specific user and project
        try {
            const worksOn = await prisma.worksOn.create({
                data: {
                  user: { connect: { netID: netID } },
                  project: { connect: { projectNum: projectNum } },
                  startDate: new Date(), // since starting at the time admin creates user, user is a current project user
                },
              })
              res.status(201).json({ worksOn })
        }
        catch (error) {
            console.log(error)
            if (error instanceof Error)
            res.status(500).json({
                message: error.message,
                error: error,
            })
            else res.status(500).send(error)
        }  
    }
    else {
        res.status(400).json({ error: 'Invalid method' })
    }
}