import fs from 'node:fs'
import path from 'node:path'
import { auth } from '~~/server/utils/auth'
import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({
    headers: event.headers,
  })

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const userId = getRouterParam(event, 'id')

  if (!userId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing userId' })
  }

  const record = await prisma.user.findUnique({
    where: { id: userId },
    select: { image: true },
  })

  const imageName = record?.image

  if (!imageName) {
    throw createError({ statusCode: 404, statusMessage: 'No profile image' })
  }

  const storageDir = process.env.UPLOAD_STORAGE_PATH || path.join(process.cwd(), 'public', 'images')
  const filePath = path.join(storageDir, imageName)

  if (!fs.existsSync(filePath)) {
    throw createError({ statusCode: 404, statusMessage: 'File not found' })
  }

  setHeader(event, 'Content-Type', 'application/octet-stream')

  return sendStream(event, fs.createReadStream(filePath))
})
