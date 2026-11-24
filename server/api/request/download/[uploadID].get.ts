import prisma from '~~/server/utils/prisma'
import { readFile, access } from 'node:fs/promises'
import { basename, resolve } from 'node:path'

export default defineEventHandler(async event => {
  const user = event.context.user
  const uploadID = Number(getRouterParam(event, 'uploadID'))

  if (!Number.isInteger(uploadID) || uploadID <= 0) {
    throw createError({
      statusCode: 400,
      message: 'Invalid upload ID',
    })
  }

  const upload = await prisma.requestUpload.findUnique({
    where: { uploadID },
    include: {
      request: {
        include: {
          student: true,
          project: true,
        },
      },
    },
  })

  if (!upload || !upload.request) {
    throw createError({
      statusCode: 404,
      message: 'Attachment not found',
    })
  }

  const request = upload.request

  // Verify user permissions
  if (
    user.role !== 'ADMIN' &&
    user.role !== 'STUDENT' &&
    user.role !== 'MENTOR'
  ) {
    throw createError({
      statusCode: 403,
      message: 'Access denied',
    })
  }

  if (user.role === 'STUDENT' && request.studentID !== user.id) {
    throw createError({
      statusCode: 403,
      message: 'Access denied',
    })
  }

  if (user.role === 'MENTOR') {
    const worksOn = await prisma.worksOn.findFirst({
      where: {
        userID: user.id,
        projectID: request.projectID,
        endDate: null,
      },
    })

    if (!worksOn) {
      throw createError({
        statusCode: 403,
        message: 'Access denied',
      })
    }
  }

  const filePath = resolve(upload.attachmentPath)

  try {
    await access(filePath)
    const file = await readFile(filePath)

    setHeader(
      event,
      'Content-Disposition',
      `attachment; filename="${basename(upload.attachmentName)}"`,
    )

    setHeader(event, 'Content-Type', 'application/octet-stream')

    return file
  } catch {
    throw createError({
      statusCode: 404,
      message: 'Attachment file not found',
    })
  }
})