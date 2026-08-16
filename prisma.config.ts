import path from 'node:path'
import type { PrismaConfig } from 'prisma'
import dotenv from 'dotenv'

dotenv.config()

export default {
  schema: "prisma/schema.prisma",
  migrations: {
    path: path.join('prisma', 'migrations'),
    seed: 'tsx ./prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL || 'file:./prisma/dev.db',
  },
} satisfies PrismaConfig
