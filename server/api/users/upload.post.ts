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

  const parts = await readMultipartFormData(event)

  if (!parts || parts.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No file uploaded' })
  }

  const filePart = parts.find((p) => p.name === 'file')

  if (!filePart || !filePart.data) {
    throw createError({ statusCode: 400, statusMessage: 'File field missing' })
  }

  const storageDir = process.env.UPLOAD_STORAGE_PATH || path.join(process.cwd(), 'public', 'images')

  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true })
  }

  const userId = session.user.id
  const fileName = `${userId}_${Date.now()}`
  const filePath = path.join(storageDir, fileName)

  fs.writeFileSync(filePath, filePart.data)

  await prisma.user.update({
    where: { id: userId },
    data: { image: fileName },
  })

  return { success: true }
})
