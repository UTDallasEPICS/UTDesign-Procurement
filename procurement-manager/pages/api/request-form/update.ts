import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'
import { Decimal } from '@prisma/client/runtime'

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

    if ('orderID' in body) { // order details - optional, so only updated if passed in

      let order = await prisma.order.findUnique({
        where: {
          orderID: parseInt(body.orderID)
        }
      })
      if (!order) throw new Error('Could not find order')

      if ('orderNumber' in body) {
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
                }
              }
            }
          }
        })
      }
      if ('trackingInfo' in body) {
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
                  trackingInfo: String(body.trackingInfo),
                }
              }
            }
          }
        })
      }
      if ('shippingCost' in body) {
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
                  shippingCost: new Decimal(body.shippingCost)
                }
              }
            }
          }
        })
      }
    }
    if ('processID' in body) { 
      let process = await prisma.process.findUnique({
        where: {
          processID: parseInt(body.processID)
        }
      })
      if (!process) throw new Error('Could not find process')
      
      if ('status' in body) { // status - optional
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

    if ('vendorID' in body) { // vendor details - optional
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
                 unitPrice: new Decimal(body.unitPrice),
                 vendorID: parseInt(body.vendorID)
               },
             },
           },
         },
      })
    } 
    else {
      request = await prisma.request.update({ // update with default parameters
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
                 unitPrice: new Decimal(body.unitPrice)
               },
             },
           },
         },
      })
    }
    res.status(200).json({ message: 'Request Form Updated', request: request })
  } catch (err) {
    console.log(err)
    if (err instanceof Error)
      res
        .status(500)
        .json({ message: 'Internal Server Error', error: err.message })
    else res.status(500).json({ message: 'Internal Server Error', error: err })
  }
}
