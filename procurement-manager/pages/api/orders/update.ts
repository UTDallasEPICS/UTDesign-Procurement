import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'PUT') {
    const { dateOrdered, orderNumber, orderDetails, trackingInfo, shippingCost, requestID } = req.body;

    try {
      const updatedOrder: any = await prisma.order.updateMany({
        where: { orderNumber: orderNumber },
        data: {
          dateOrdered: new Date(dateOrdered),
          orderDetails: orderDetails,
          trackingInfo: trackingInfo,
          shippingCost: shippingCost,
          requestID: requestID,
          orderNumber: orderNumber
        },
      });

      res.status(200).json({ message: 'Order updated successfully', updatedOrder });
    } catch (error) {
      console.error('Error updating order:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}
