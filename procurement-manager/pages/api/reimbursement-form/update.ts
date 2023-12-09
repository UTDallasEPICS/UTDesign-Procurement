import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'
import { Prisma } from '@prisma/client'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const body = req.body
    let reimbursement

    const oldReimbursementForm = await prisma.reimbursement.findUnique({
      where: {
        reimbursementID: parseInt(body.reimbursementID),
      },
    })
    if (!oldReimbursementForm) throw new Error('Could not find that reimbursement form')

    if ('processID' in body) { 
      let process = await prisma.process.findUnique({
        where: {
          processID: parseInt(body.processID)
        }
      })
      if (!process) throw new Error('Could not find process')

      if ('status' in body) {
        reimbursement = await prisma.reimbursement.update({
          where: {
            reimbursementID: oldReimbursementForm.reimbursementID,
          },
          data: {
            Process: {
              update: {
                where: {
                  processID: parseInt(body.processID)
                },
                data: {
                  status: body.status
                }
              }
            }
          },
        })
      }
    }
    let reimbursementItem = await prisma.reimbursementItem.findUnique({
      where: {
        itemID: parseInt(body.itemID)
      }
    })
    if (!reimbursementItem) throw new Error('Could not find reimbursement item')

    if ('vendorName' in body)
    {
      let vendor = await prisma.vendor.findFirst({
        where: {
          vendorName: String(body.vendorName)
        }
      })
      if (vendor === null) throw new Error('could not find vendor')

      reimbursement = await prisma.reimbursement.update({ 
        where: {
          reimbursementID: oldReimbursementForm.reimbursementID
        },
          data: {
            ReimbursementItem: {
              update: {
                where: {
                  itemID: parseInt(body.itemID),
                },
                data: {
                  vendorID: vendor.vendorID
                },
              },
            },
          },
      })
    }

    // for now is optional since need to add expense field to reimbursement schema
    if ('totalExpenses' in body) 
    {
        /*
      // Find the project to get the total expenses
      let project = await prisma.project.findUnique({
        where: { projectID: parseInt(body.projectID) },
      })
      // Remove the old request expenses before adding the updated expenses to project
      let updateExpense = await prisma.project.update({
        where: { projectID: parseInt(body.projectID) },
        data: {
          totalExpenses: Prisma.Decimal.sub(
            project?.totalExpenses === undefined
              ? oldReqExpense
              : project.totalExpenses,
            oldReqExpense
          ),
        },
      })
      project = await prisma.project.findUnique({
        where: { projectID: parseInt(body.projectID) },
      })
      console.log('removed old  - project expenses: ', project?.totalExpenses)
      
      // update with default required params and expenses
      request = await prisma.request.update({ 
        where: {
          requestID: oldRequestForm.requestID,
        },
          data: {
            RequestItem: {
              update: {
                where: {
                  itemID: parseInt(body.itemID),
                },
                data: {
                  description: String(body.description),
                  url: String(body.url),
                  partNumber: String(body.partNumber),
                  quantity: parseInt(body.quantity),
                  unitPrice: new Prisma.Decimal(body.unitPrice),
                },
              },
            },
            expense: new Prisma.Decimal(body.totalExpenses)
          },
      })
      request = await prisma.request.findUnique({
        where: {
          requestID: oldRequestForm.requestID
        }
      })
      if (request === null) throw new Error('request not found')
      console.log('new request expense: ', request.expense)

      // add updated request expenses to project
      updateExpense = await prisma.project.update({
        where: { projectID: parseInt(body.projectID) },
        data: {
          totalExpenses: Prisma.Decimal.add(
            project?.totalExpenses === undefined ? 0 : project.totalExpenses,
            request.expense
          ),
        },
      })
      project = await prisma.project.findUnique({
        where: { projectID: parseInt(body.projectID) },
      })
      console.log('added new - project expenses: ', project?.totalExpenses)
      */
    }
    else
    {
      // update with default required params
      reimbursement = await prisma.reimbursement.update({ 
        where: {
          reimbursementID: oldReimbursementForm.reimbursementID
        },
          data: {
            ReimbursementItem: {
              update: {
                where: {
                  itemID: parseInt(body.itemID),
                },
                data: {
                    receiptDate: new Date(body.receiptDate),
                    description: String(body.description),
                    receiptTotal: Number(body.receiptTotal)
                },
              },
            },
          },
      })
    }
    
    res.status(200).json({ message: 'Reimbursement Form Updated', reimbursement: reimbursement })
  } catch (error) {
    console.log(error)
    if (error instanceof Error)
    res.status(500).json({
        message: error.message,
        error: error,
    })
    else res.status(500).send(error)
  }
}
