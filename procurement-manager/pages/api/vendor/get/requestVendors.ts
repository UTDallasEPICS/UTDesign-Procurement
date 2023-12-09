// API to get the list of vendors for items in a request

import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'
import { Prisma, Vendor } from '@prisma/client'

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
            RequestItem: true,
          }
        })
        if (request === null) throw new Error('failed to find request')
        let vendors: Vendor[] = []

        for (const item of request.RequestItem) {
          const vendor = await prisma.vendor.findUnique({
            where: {
              vendorID: item.vendorID,
            }
          })
          if (vendor === null) throw new Error('item vendor not found')
          vendors.push(vendor)
        }
        
        res.status(200).json({ vendors: vendors })
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
