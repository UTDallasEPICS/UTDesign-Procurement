//pulls up info abt projects from database
//req= GET

import { Prisma, PrismaClient } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
    const method = req.method;
  let  id = req.query?.projectNum;
    
    const prisma = new PrismaClient();
    let result;
    if(req.method === 'GET'){
         result = await prisma.project.findUnique({
            where: {
                projectID: Number(id),
            },
          })
          res.json({result, message: 'message'})
    }
    
}
  