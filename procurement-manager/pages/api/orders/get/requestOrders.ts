// API to get the orders placed for a request

import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'
import { Vendor, Order } from '@prisma/client'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
      try 
      {
        const requestID = parseInt(req.query.requestID as string)
        const request = await prisma.request.findUnique({
          where: {
            requestID: requestID,
          },
          include: {
            Order: true,
          }
        })
        if (request === null) throw new Error('failed to find request')
        let orders: Order[] = []

        for (const reqOrder of request.Order) {
          const order = await prisma.order.findUnique({
            where: {
              orderID: reqOrder.orderID
            }
          })
          if (order === null) throw new Error('request order not found')
          orders.push(order)
        }
        
        res.status(200).json({ orders: orders })
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
}
