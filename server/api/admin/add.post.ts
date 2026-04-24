import { prisma } from '~/server/utils/prisma'
import { validateEmailAndReturnNetID } from '~/server/utils/netid'
import { authClient } from '~/composables/useAuth'

/**
 * POST /api/admin/add
 * Admin adds a new user or project.
 */
export default defineEventHandler(async event => {
  if (event.context.role !== 1) throw createError({ statusCode: 403, message: 'Admin only' })

  const body = await readBody(event)
  const { type } = body

  if (type === 'user') {
    const { email, firstName, lastName, roleID, projectNum } = body

    // Validate UTD email and extract netID
    const netID = validateEmailAndReturnNetID(email)

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        firstName,
        lastName,
        netID,
        roleID: Number(roleID),
        active: true,
      },
    })

    // Optionally assign to a project
    if (projectNum) {
      const project = await prisma.project.findUnique({ where: { projectNum } })
      if (project) {
        await prisma.worksOn.create({
          data: {
            userID: user.id,
            projectID: project.projectID,
            startDate: new Date(),
          },
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
})
