import { prisma } from '@/db'

export default async function main() {
  await prisma.role.createMany()
}
