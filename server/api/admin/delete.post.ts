import { ROLES } from '~/shared/constants/roles'
import { prisma } from '~/server/utils/prisma'

/** POST /api/admin/delete — hard delete user, project, or vendor */
export default defineEventHandler(async event => {
  if (event.context.role !== ROLES.ADMIN) throw createError({ statusCode: 403, message: 'Admin only' })

  try {
    const { type, id } = await readBody(event)

    if (type === 'user') {
      await prisma.user.delete({ where: { id: Number(id) } })
    } else if (type === 'project') {
      await prisma.project.delete({ where: { projectID: Number(id) } })
    } else if (type === 'vendor') {
      const itemCount = await prisma.requestItem.count({ where: { vendorID: Number(id) } })
      const reimbCount = await prisma.reimbursementItem.count({ where: { vendorID: Number(id) } })
      if (itemCount + reimbCount > 0) {
        throw createError({ statusCode: 400, message: 'Cannot delete a vendor that is referenced by order items. Set its status to DENIED instead.' })
      }
      await prisma.vendor.delete({ where: { vendorID: Number(id) } })
    } else {
      throw createError({ statusCode: 400, message: 'Invalid type' })
    }

    return { ok: true }
  } catch (err: unknown) {
    if ((err as { statusCode?: number }).statusCode) throw err
    throw createError({ statusCode: 500, message: 'Internal server error' })
  }
})
