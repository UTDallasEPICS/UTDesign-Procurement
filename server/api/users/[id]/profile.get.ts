import fs from 'node:fs'
import path from 'node:path'

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
    where: {
      id: userId,
    },
    select: {
      image: true,
    },
  })

  const imagePath = record?.image

  const filePath = path.join(process.env.UPLOAD_STORAGE_PATH || 'public/images', imagePath || 'null')

  if (!fs.existsSync(filePath)) {
    throw createError({ statusCode: 404, statusMessage: 'File not found' })
  }

  const fileStream = fs.createReadStream(filePath)

  // Set content type based on file extension
  // const ext = path.extname(filePath).toLowerCase()

  // Defaults to octet stream as file types are NOT saved
  // const mime =
  //   ext === ".png" ? "image/png" :
  //   ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" :
  //   ext === ".gif" ? "image/gif" :
  //   ext === ".webp" ? "image/webp" :
  //   "application/octet-stream"

  setHeader(event, 'Content-Type', 'application/octet-stream')

  return sendStream(event, fileStream)
})
