import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async event => {
  if (event.context.role !== 1) throw createError({ statusCode: 403, message: 'Admin only' })
  const { projectID } = await readBody(event)
  await prisma.project.update({
    where: { projectID: Number(projectID) },
    data: { deactivationDate: new Date() },
  })
  return { ok: true }
})
