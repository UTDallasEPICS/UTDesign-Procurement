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

  const upload = await prisma.reimbursementUpload.findUnique({
    where: { uploadID },
    include: {
      items: {
        include: {
          reimbursement: true,
        },
      },
    },
  })

  if (!upload || upload.items.length === 0) {
    throw createError({
      statusCode: 404,
      message: 'Receipt not found',
    })
  }

  // Add role-based authorization here before serving the file.
  // Verify that the user is allowed to access this reimbursement.

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
      message: 'Receipt file not found',
    })
  }
})