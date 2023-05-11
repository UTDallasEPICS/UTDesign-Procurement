/**
 * This is a module that exports two API route handler functions for retrieving all orders and creating
 * a new order, using PrismaClient and Next.js.
 * @param NextApiRequest - NextApiRequest is an interface that defines the shape of the incoming HTTP
 * request object in Next.js API routes. It includes properties such as headers, query parameters, and
 * the request body.
 * @param NextApiResponse - NextApiResponse is a type definition for the response object in Next.js API
 * routes. It provides a set of methods and properties that can be used to send a response back to the
 * client, such as setting the status code, headers, and sending JSON data.
 */
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'

//Define a new API route handler function for handling GET requests to retrieve all orders:
/**
 * This function handles orders by retrieving them from a database and returning them as a JSON
 * response.
 * @param NextApiRequest - NextApiRequest is an interface provided by the Next.js framework that
 * represents the incoming HTTP request in an API route. It contains properties such as the HTTP
 * method, headers, query parameters, and request body.
 * @param NextApiResponse - NextApiResponse is an interface that defines the response object that will
 * be sent back to the client in a Next.js API route. It includes methods for setting the HTTP status
 * code, headers, and body of the response.
 */
export default async function handleOrders(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const orders = await prisma.order.findMany()
    res.status(200).json(orders)
  }
  //}
  //Define a new API route handler function for handling POST requests to create a new order:
  /* This code defines an API route handler function for handling POST requests to create a new order. It
first checks if the HTTP method is POST, then extracts the necessary data from the request body
(netID, processID, comment, and status). It then uses the PrismaClient to find a user with the given
netID and checks their roleID. If the user is an admin, it extracts additional data from the request
body (dateOrdered, orderNumber, orderDetails, trackingInfo, shippingCost, requestID, and adminID)
and creates a new order in the database using the PrismaClient. Finally, it sends a response back to
the client with the newly created order as JSON data. */
  //export default async function handleOrders(req: NextApiRequest, res: NextApiResponse) {
  else if (req.method === 'POST') {
    //post method as we are getting info
    const { netID, processID, comment, status } = req.body
    // first get user's netID ??? from req.body
    const user = await prisma.user.findUnique({
      where: {
        netID: netID,
      },
    })

    // check for role -- different roles have different functions
    /* This code block checks if the user making the request is an admin by checking their roleID. If
    the user is an admin, it extracts additional data from the request body (dateOrdered,
    orderNumber, orderDetails, trackingInfo, shippingCost, requestID, and adminID) and creates a new
    order in the database using the PrismaClient. Finally, it sends a response back to the client
    with the newly created order as JSON data. If the user is not an admin or the HTTP method is not
    POST, it sends a "Method not allowed" response with a status code of 405. */
    if (user) {
      //user.roleID is admin so update the comment and status given by admin
      if (user.roleID === 1) {
        //if user is admin
        const {
          dateOrdered,
          orderNumber,
          orderDetails,
          trackingInfo,
          shippingCost,
          requestID,
          adminID,
        } = req.body

        const newOrder = await prisma.order.create({
          data: {
            dateOrdered,
            orderNumber,
            orderDetails,
            trackingInfo,
            shippingCost,
            request: { connect: { requestID } },
            admin: { connect: { netID } },
          },
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
