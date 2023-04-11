/* 
  This file makes only one instance of the prisma client to run throughout the whole project
  when using Prisma, make sure to do:
  import { prisma } from '@/db'
*/

import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
