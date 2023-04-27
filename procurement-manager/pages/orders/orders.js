import { PrismaClient } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'

const prisma = new PrismaClient()

//Define a new API route handler function for handling GET requests to retrieve all orders:
export default async function handleOrders(req: NextApiRequest, res: NextApiResponse) {
    const orders = await prisma.order.findMany()
    res.status(200).json(orders)
  }
//Define a new API route handler function for handling POST requests to create a new order:
export default async function handleOrders(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {

        //post method as we are getting info
      const { netID, processID, comment, status } = req.body
      // first get user's netID ??? from req.body
     const user = await prisma.user.findUnique({
      where: {
        netID: netID,
      },
    })

    // check for role -- different roles have different functions
    if (user) {
      //user.roleID is admin so update the comment and status given by admin
      if (user.roleID === 1) {
        //if user is admin
      const { dateOrdered, orderNumber, orderDetails, trackingInfo, shippingCost, requestID, adminID } = req.body
  
      const newOrder = await prisma.order.create({
        data: {
          dateOrdered,
          orderNumber,
          orderDetails,
          trackingInfo,
          shippingCost,
          request: { connect: { requestID } },
          admin: { connect: { adminID } }
        }
      })
  
      res.status(201).json(newOrder)
    }
}
    } else {
      res.status(405).json({ message: 'Method not allowed' })
    }
  }
  //Export the API route handlers:
  export { handleOrders }
