// API to get the orders placed for a request

import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'
import { Prisma, Vendor, Order } from '@prisma/client'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    if (req.method === 'DELETE') { // Check if the HTTP method is DELETE
        const { orderNumber } = req.body;
        console.log("Order number to delete:", orderNumber);
        
        try {
          // Use PrismaClient to find all orders with the given orderNumber
          const existingOrders: any[] = await prisma.order.findMany({
            where: {
              orderNumber: orderNumber as string, // Ensure orderNumber is of type string
            },
          });
      
          if (existingOrders.length === 0) {
            return res.status(404).json({ message: 'Orders not found with the specified order number' });
          }
      
          // Delete all orders with the specified orderNumber
          await prisma.order.deleteMany({
            where: {
              orderNumber: orderNumber as string, // Ensure orderNumber is of type string
            },
          });
      
          // Send a success response back to the client
          res.status(200).json({ message: 'Orders deleted successfully' });
        } catch (error) {
          console.error('Error deleting orders:', error);
          res.status(500).json({ message: 'Internal server error' });
        }
      } else {
        // Send a "Method not allowed" response for unsupported HTTP methods
        res.status(405).json({ message: 'Method not allowed' })
      }
}
