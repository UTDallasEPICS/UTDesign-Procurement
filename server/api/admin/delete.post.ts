import { ROLES } from '~~/shared/constants/roles'
import prisma from '~~/server/utils/prisma'

export default defineEventHandler(async event => {
  if (event.context.role !== ROLES.ADMIN) {
    throw createError({
      statusCode: 403,
      message: 'Admin only',
    })
  }

  try {
    const { type, id } = await readBody(event)

    console.log('DELETE REQUEST:', { type, id })

    if (!type || id === undefined || id === null) {
      throw createError({
        statusCode: 400,
        message: 'type and id are required',
      })
    }

    if (type === 'user') {
      await prisma.user.delete({
        where: {
          id: Number(id),
        },
      })
    } else if (type === 'project') {
      await prisma.project.delete({
        where: {
          projectID: Number(id),
        },
      })
    } else if (type === 'vendor') {
      const itemCount = await prisma.requestItem.count({
        where: {
          vendorID: Number(id),
        },
      })

      const reimbCount = await prisma.reimbursementItem.count({
        where: {
          vendorID: Number(id),
        },
      })

      if (itemCount + reimbCount > 0) {
        throw createError({
          statusCode: 400,
          message:
            'Cannot delete a vendor that is referenced by order items. Set its status to DENIED instead.',
        })
      }

      await prisma.vendor.delete({
        where: {
          vendorID: Number(id),
        },
      })
    } else {
      throw createError({
        statusCode: 400,
        message: `Invalid type: ${type}`,
      })
    }

    return {
      ok: true,
    }
  } catch (err: unknown) {
    console.error('DELETE ERROR:', err)

    if (
      err &&
      typeof err === 'object' &&
      'statusCode' in err &&
      typeof (err as { statusCode?: number }).statusCode === 'number'
    ) {
      throw err
    }

    const prismaError = err as {
      code?: string
      message?: string
      meta?: unknown
    }

    throw createError({
      statusCode: 500,
      message: prismaError.message || 'Internal server error',
      data: {
        code: prismaError.code,
        meta: prismaError.meta,
      },
    })
  }
})