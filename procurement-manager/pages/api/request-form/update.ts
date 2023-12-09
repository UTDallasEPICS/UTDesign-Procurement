import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'
import { Prisma } from '@prisma/client'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const body = req.body
    let request

    const oldRequestForm = await prisma.request.findUnique({
      where: {
        requestID: parseInt(body.requestID),
      },
    })
    if (!oldRequestForm) throw new Error('Could not find that request form')
    const oldReqExpense = oldRequestForm.expense
    console.log('old request expense: ', oldReqExpense)

    if ('orderID' in body) { // order details - optional, so only updated if passed in

      let order = await prisma.order.findUnique({
        where: {
          orderID: parseInt(body.orderID)
        }
      })
      if (!order) throw new Error('Could not find order')

      request = await prisma.request.update({
        where: {
          requestID: oldRequestForm.requestID
        },
        data: {
          Order: {
            update: {
              where: {
                orderID: parseInt(body.orderID)
              },
              data: {
                orderNumber: String(body.orderNumber),
                trackingInfo: String(body.trackingInfo),
                shippingCost: new Prisma.Decimal(body.shippingCost)
              }
            }
          }
        }
      })
    }
    if ('processID' in body) { 
      let process = await prisma.process.findUnique({
        where: {
          processID: parseInt(body.processID)
        }
      })
      if (!process) throw new Error('Could not find process')

      if ('status' in body) {
        request = await prisma.request.update({
          where: {
            requestID: oldRequestForm.requestID,
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
    let requestItem = await prisma.requestItem.findUnique({
      where: {
        itemID: parseInt(body.itemID)
      }
    })
    if (!requestItem) throw new Error('Could not find request item')

    if ('vendorName' in body)
    {
      let vendor = await prisma.vendor.findFirst({
        where: {
          vendorName: String(body.vendorName)
        }
      })
      if (vendor === null) throw new Error('could not find vendor')

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
                  vendorID: vendor.vendorID
                },
              },
            },
          },
      })
    }

    // for now is optional since need to add update order in project page
    if ('totalExpenses' in body) 
    {
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
    }
    else
    {
      // update with default required params
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
          },
      })
    }
    
    res.status(200).json({ message: 'Request Form Updated', request: request })
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
