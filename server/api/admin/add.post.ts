import { prisma } from '~/server/utils/prisma'
import { validateEmailAndReturnNetID } from '~/server/utils/netid'
import type { UserRole } from '@prisma/client'

/** POST /api/admin/add — admin creates a new user or project */
export default defineEventHandler(async event => {
  if (event.context.role !== 'ADMIN') throw createError({ statusCode: 403, message: 'Admin only' })

  const body = await readBody(event)
  const { type } = body

  try {
    if (type === 'user') {
      const { email, firstName, lastName, role, projectNum } = body

      const netID = validateEmailAndReturnNetID(email)

      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          firstName,
          lastName,
          netID,
          role: role as UserRole,
          active: true,
        },
      })

      if (projectNum) {
        const project = await prisma.project.findUnique({ where: { projectNum } })
        if (project) {
          await prisma.worksOn.create({
            data: { userID: user.id, projectID: project.projectID, startDate: new Date() },
          })
        }
      }

      return user
    }

    if (type === 'project') {
      const { projectTitle, projectNum, startingBudget, projectType, sponsorCompany, costCenter, additionalInfo } = body

      return prisma.project.create({
        data: {
          projectTitle,
          projectNum,
          startingBudget: Number(startingBudget),
          projectType,
          sponsorCompany,
          costCenter: costCenter ?? null,
          additionalInfo: additionalInfo ?? null,
          activationDate: new Date(),
        },
      })
    }

    throw createError({ statusCode: 400, message: 'Invalid type' })
  } catch (err: unknown) {
    if ((err as { statusCode?: number }).statusCode) throw err
    throw createError({ statusCode: 500, message: 'Internal server error' })
  }
})
