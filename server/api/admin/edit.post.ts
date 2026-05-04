import { prisma } from '~/server/utils/prisma'

/** POST /api/admin/edit — edit a field on user, project, or vendor */
export default defineEventHandler(async event => {
  if (event.context.role !== 'ADMIN') throw createError({ statusCode: 403, message: 'Admin only' })

  try {
    const { type, id, field, value } = await readBody(event)

    if (type === 'user') {
      await prisma.user.update({ where: { id: Number(id) }, data: { [field]: value } })
    } else if (type === 'project') {
      await prisma.project.update({ where: { projectID: Number(id) }, data: { [field]: value } })
    } else if (type === 'vendor') {
      await prisma.vendor.update({ where: { vendorID: Number(id) }, data: { [field]: value } })
    } else {
      throw createError({ statusCode: 400, message: 'Invalid type' })
    }

    return { ok: true }
  } catch (err: unknown) {
    if ((err as { statusCode?: number }).statusCode) throw err
    throw createError({ statusCode: 500, message: 'Internal server error' })
  }
})
