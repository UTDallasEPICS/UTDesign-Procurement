# File Upload and Serving APIs

This guide covers how to create authenticated file upload and serving endpoints in Nuxt using Better Auth for session management.

## Upload API

### File: `server/api/users/upload.post.ts`

```typescript
import path from 'path'
import fs from 'fs'
import { prisma } from '~~/server/utils/prisma'
import { auth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  // Get authenticated session from Better Auth
  const session = await auth.api.getSession({
    headers: event.headers,
  })

  // Ensure user is authenticated
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  // Read multipart form data
  const form = await readMultipartFormData(event)
  if (!form) {
    throw createError({ statusCode: 400, statusMessage: 'No form data' })
  }

  // Extract file from form data
  const file = form.find((i) => i.name === 'file')
  if (!file || !file.data) {
    throw createError({ statusCode: 400, statusMessage: 'File missing' })
  }

  // Create user-specific directory structure
  const dirPath = path.join(
    process.env.UPLOAD_STORAGE_PATH || 'public/images',
    'users',
    session.user.id,
    'images'
  )

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }

  // Generate unique filename
  const randomImageId = crypto.randomUUID()
  const filePath = path.join(dirPath, randomImageId)

  // Write file to disk
  await fs.writeFile(filePath, file.data)

  // Update database with image path
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      image: path.join('users', session.user.id, 'images', randomImageId),
    },
  })

  setResponseStatus(event, 201)
  return { message: 'Profile picture uploaded successfully' }
})
```

## Serving API

### File: `server/api/users/[id]/profile.get.ts`

```typescript
import fs from 'node:fs'
import path from 'node:path'

export default defineEventHandler(async (event) => {
  // Get user ID from route parameter
  const userId = getRouterParam(event, 'id')
  if (!userId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing userId' })
  }

  // Fetch image path from database
  const record = await prisma.user.findUnique({
    where: { id: userId },
    select: { image: true },
  })

  const imagePath = record?.image
  if (!imagePath) {
    throw createError({ statusCode: 404, statusMessage: 'No image found' })
  }

  // Construct full file path
  const filePath = path.join(process.env.UPLOAD_STORAGE_PATH || 'public/images', imagePath)

  // Verify file exists
  if (!fs.existsSync(filePath)) {
    throw createError({ statusCode: 404, statusMessage: 'File not found' })
  }

  // Create and return file stream
  const fileStream = fs.createReadStream(filePath)
  setHeader(event, 'Content-Type', 'application/octet-stream')
  return sendStream(event, fileStream)
})
```

## Authentication Pattern

The critical authentication pattern using Better Auth:

```typescript
// Get session from request headers
const session = await auth.api.getSession({
  headers: event.headers,
})

// Validate session exists
if (!session) {
  throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
}

// Access user data
const userId = session.user.id
const userEmail = session.user.email
```

See the [Better Auth doc](better_auth.md) and [Better Auth documentation](https://www.better-auth.com/docs/basic-usage) for more information.

## Environment Variables

Set the upload storage path in your environment (and use this as the base path for ALL uploads):

```bash
UPLOAD_STORAGE_PATH=/path/to/your/storage
# Defaults to: public/images
```

## Frontend File Validation

### File Input with Accept Attribute

```vue
<input
  type="file"
  accept="image/*"
  class="block w-full cursor-pointer text-sm text-gray-500"
  @change="handleImageUpload"
/>
```

### JavaScript Validation Function

```typescript
function handleImageUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files as FileList

  if (!files || files.length === 0) return

  const file = files[0]

  // Validate file type
  if (!file?.type.startsWith('image/')) {
    // Handle invalid file type (show error message, reset input, etc.)
    return
  }

  // Optional: Validate file size (e.g., 5MB limit)
  const maxSize = 5 * 1024 * 1024 // 5MB in bytes
  if (file.size > maxSize) {
    // Handle file too large
    return
  }

  // Set selected file and create preview
  selectedFile.value = file

  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}
```

### Enhanced Validation with Specific Types

```typescript
// More restrictive file type validation
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

if (!allowedTypes.includes(file.type)) {
  throw new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.')
}

// Size validation with user feedback
if (file.size > 5 * 1024 * 1024) {
  throw new Error('File too large. Maximum size is 5MB.')
}
```

## Security Considerations

- Always validate session before processing uploads
- Use UUID for filenames to prevent collisions
- Store relative paths in database, not full filesystem paths
- Implement both client-side file type validation
- Implement size limits for uploaded files on client side if necessary
