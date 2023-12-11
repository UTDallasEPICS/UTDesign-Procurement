import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'
import { Prisma } from '@prisma/client'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed')
      return
    }
    
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

    // update with default required params, and total expenses not included for now since need expense field in reimbursement
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
