// API to update fields in request like process, vendor, reimbursement item, and update project expenses

import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'
import { Prisma } from '@prisma/client'

// used for type checking items and orders passed in so that each attribute is valid
interface Item {
  itemID: number
  receiptDate: Date
  description: string
  receiptTotal: number
  vendorName: string
}

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

    // TODO:: update multiple reimbursement items and orders instead of 1 by passing in objects and validating using interfaces similar to reimbursement-form/index API

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
                  // TODO:: use type checking (could allow admin to pass in status string like "approved" and create status using Status.APPROVED, etc. for different ones)
                  status: body.status
                }
              }
            }
          },
        })
      }
    }
    
    const items = req.body.items
    // makes sure each property in item matches the reimbursement item type before updating
    items.forEach(async (item: Item) => {
      await updateItem(item)
    })

    // total expenses not included for now since need expense field in reimbursement, then implement update similar to request-form/update API
    
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

/**
 * This function first checks if the item vendor and itemID are valid and then updates the data fields for the reimbursement item
 * @param item item from reimbursement item array passed in to API (after type checking)
 */
async function updateItem(item: Item)
{
  try
  {
    let vendor = await prisma.vendor.findFirst({
      where: 
      {
        vendorName: item.vendorName
      }
    })
    if (!vendor) throw new Error('invalid vendor for item')
    
    const reimbursementItem = await prisma.reimbursementItem.findUnique({
      where: {
        itemID: item.itemID
      }
    })
    if (!reimbursementItem) throw new Error('reimbursement item not found')

    const newItem = await prisma.reimbursementItem.update({
      where: {
        itemID: reimbursementItem.itemID,
      },
      data: {
        itemID: item.itemID,
        receiptDate: item.receiptDate,
        description: item.description,
        receiptTotal: new Prisma.Decimal(item.receiptTotal),
        vendorID: vendor.vendorID
      }
    })
  }
  catch(error) {
    console.log(error)
    if (error instanceof Error)
      console.log(error.message)
  }
}
