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
    const body = await readBody(event)
    const { type, id } = body

    if (!type) {
      throw createError({
        statusCode: 400,
        message: 'Edit type is required',
      })
    }

    if (!id && type !== 'worksOn') {
      throw createError({
        statusCode: 400,
        message: 'ID is required',
      })
    }

    if (type === 'user') {
      const {
        firstName,
        lastName,
        netID,
        email,
        role,
      } = body

      if (!firstName || !lastName || !email || !role) {
        throw createError({
          statusCode: 400,
          message: 'All required user fields must be provided',
        })
      }

      const user = await prisma.user.update({
        where: {
          id: Number(id),
        },
        data: {
          firstName,
          lastName,
          netID: netID || null,
          email,
          role,
        },
      })

      return {
        ok: true,
        user,
      }
    }

    if (type === 'project') {
      const {
        projectNum,
        projectTitle,
        projectType,
        sponsorCompany,
        startingBudget,
        costCenter,
        additionalInfo,
      } = body

      if (
        !projectNum ||
        !projectTitle ||
        !projectType ||
        !sponsorCompany ||
        startingBudget === undefined ||
        startingBudget === null
      ) {
        throw createError({
          statusCode: 400,
          message: 'All required project fields must be provided',
        })
      }

      const project = await prisma.project.update({
        where: {
          projectID: Number(id),
        },
        data: {
          projectNum,
          projectTitle,
          projectType,
          sponsorCompany,
          startingBudget: Number(startingBudget),
          costCenter: costCenter || null,
          additionalInfo: additionalInfo || null,
        },
      })

      return {
        ok: true,
        project,
      }
    }

    if (type === 'vendor') {
      const {
        vendorName,
        vendorEmail,
        vendorURL,
        isPreferred,
      } = body

      if (!vendorName?.trim()) {
        throw createError({
          statusCode: 400,
          message: 'Vendor name is required',
        })
      }

      const vendor = await prisma.vendor.update({
        where: {
          vendorID: Number(id),
        },
        data: {
          vendorName: vendorName.trim(),
          vendorEmail: vendorEmail?.trim() || null,
          vendorURL: vendorURL?.trim() || null,
          isPreferred: Boolean(isPreferred),
        },
      })

      return {
        ok: true,
        vendor,
      }
    }

    if (type === 'worksOn') {
      const userID = Number(body.userID)
      const projectNum = Number(body.projectNum)

      if (!userID || !projectNum) {
        throw createError({
          statusCode: 400,
          message: 'User ID and project number are required',
        })
      }

      const result = await prisma.worksOn.updateMany({
        where: {
          userID,
          projectNum,
          endDate: null,
        },
        data: {
          endDate: new Date(),
        },
      })

      if (result.count === 0) {
        throw createError({
          statusCode: 404,
          message: 'Active project assignment not found',
        })
      }

      return {
        ok: true,
        message: 'Project unassigned successfully',
      }
    }

    throw createError({
      statusCode: 400,
      message: `Invalid type: ${type}`,
    })
  } catch (err: any) {
    console.error('ADMIN EDIT ERROR:', err)

    if (err?.statusCode) {
      throw err
    }

    throw createError({
      statusCode: 500,
      message: 'Internal server error',
    })
  }
})