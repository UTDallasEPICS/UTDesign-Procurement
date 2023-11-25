// API to get all the current users of a project, returns both works on entries and users

import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'
import { Prisma, Project, WorksOn, User } from '@prisma/client'
import axios from 'axios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    if (req.method === 'POST') {
        try{
            const { firstName, lastName } = req.body

            const user = await prisma.user.findFirst({
                where: {
                    firstName: firstName,
                    lastName: lastName,
                }
            })
            if (user === null) throw new Error("Invalid user")

            res.status(200).json({ user })
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