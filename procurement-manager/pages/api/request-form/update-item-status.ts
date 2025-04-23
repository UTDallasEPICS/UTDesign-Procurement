// pages/api/request-form/update-item-status.ts

import { Prisma, Status } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' })
    }

    const { itemID, status } = req.body

    if (!itemID || !status) {
      return res.status(400).json({ error: 'Missing itemID or status' })
    }

    const updatedItem = await prisma.requestItem.update({
      where: { itemID },
      data: { status },
    })

    res.status(200).json({
      message: `Request item ${itemID} status updated to ${status}`,
      updatedItem,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to update item status' })
  }
}
