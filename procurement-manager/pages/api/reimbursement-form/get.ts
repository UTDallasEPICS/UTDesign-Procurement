/**
* This endpoint gives the projects and reimbursements associated with a user.
*/
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'
import {Reimbursement} from ".prisma/client";
import { Project, Status, Process } from "@prisma/client";
export default async function handler(
req: NextApiRequest,
res: NextApiResponse
) {

    try {
        if (req.method !== 'POST') throw new Error('Invalid method')
        const { netID } = req.body
        const user = await prisma.user.findUnique({
        where: { netID: netID },
        })
        if (!user) throw new Error('user not found')
        let projects: Project[]

        if (user.roleID === 1) {
            projects = await prisma.project.findMany() // for admin it is all projects
        }
        else {
            projects = await prisma.project.findMany({
                where: { 
                    WorksOn: 
                        { some: 
                            { 
                                userID: user.userID,
                                endDate: null
                            } 
                        } 
                    },
            })
        }

        let listOfReimbursements :Reimbursement[][] = []
        for(let i = 0; i < projects.length; i++){
            const reimbursements: ((Reimbursement & { Process: Process[]})[]) = await prisma.reimbursement.findMany({
            where:{
                projectID : projects[i].projectID
            },
            include: {
                Process: true
            }
        })
            // filters based on the status and user's roleID
            let filteredReimbursements: Reimbursement[]
            // admin can see APPROVED
            if (user.roleID === 1) {
                filteredReimbursements = reimbursements.filter(
                    (reimbursement) => reimbursement.Process[0].status === Status.APPROVED
                )
            }
            // mentor can see UNDER_REVIEW
            else if (user.roleID === 2) {
                filteredReimbursements = reimbursements.filter(
                    (reimbursement) => reimbursement.Process[0].status === Status.UNDER_REVIEW
                )
            }
            // Students can see all
            else {
                filteredReimbursements = reimbursements
            }
            listOfReimbursements.push(filteredReimbursements)
        }
        res.status(200).json({ projects, listOfReimbursements })
        if (!user) throw new Error('User not found')
    } catch (error) {
        if (error instanceof Error) res.status(500).json({ message: error.message })
    }
}