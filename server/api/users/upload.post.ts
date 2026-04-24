import path from 'path'
import fs from 'fs'
import { prisma } from '~~/server/utils/prisma'
import { auth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({
    headers: event.headers,
  })

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const form = await readMultipartFormData(event)

  if (!form) {
    throw createError({ statusCode: 400, statusMessage: 'No form data' })
  }

  const file = form.find((i) => i.name === 'file')

  if (!file || !file.data) {
    throw createError({ statusCode: 400, statusMessage: 'File missing' })
  }

  const dirPath = path.join(
    process.env.UPLOAD_STORAGE_PATH || 'public/images',
    'users',
    session.user.id,
    'images'
  )

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }

  const randomImageId = crypto.randomUUID()

  const filePath = path.join(dirPath, randomImageId)

  if (fs.existsSync(filePath)) {
    throw createError({ statusCode: 400, message: 'Image already exists.' })
  }

  await fs.writeFile(filePath, file.data, (err) => {
    if (err) throw err
  })

  // Store the generated image ID in the database as required
  const addedImage = await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      image: path.join('users', session.user.id, 'images', randomImageId),
    },
  })

  console.log(addedImage)

  setResponseStatus(event, 201)

  return {
    message: 'Added profile picture to logged in user.',
  }
})
