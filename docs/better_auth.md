# Better Auth Setup and Usage

This guide covers Better Auth implementation for email OTP authentication in Nuxt applications.

## Basic Setup

### 1. Install Dependencies

```bash
npm install better-auth @prisma/adapter-better-sqlite3 nodemailer
npm install -D prisma @types/nodemailer
```

### 2. Environment Variables

```bash
# Generate a Better Auth Secret
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000
```

### 3. Database Configuration

Update `prisma/schema.prisma` with Better Auth models:

```prisma
generator client {
  provider = "prisma-client"
  output   = "./generated"
}

datasource db {
  provider = "sqlite"
}

model User {
  id            String    @id
  name          String
  email         String
  emailVerified Boolean   @default(false)
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  sessions      Session[]
  accounts      Account[]

  @@unique([email])
  @@map("user")
}

model Session {
  id        String   @id
  expiresAt DateTime
  token     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("session")
}

model Account {
  id                String  @id
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("account")
}

model Verification {
  id        String   @id @default(cuid())
  identifier String
  value     String
  expiresAt DateTime
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([identifier, value])
  @@map("verification")
}
```

### 4. Server Auth Configuration

Create `server/utils/auth.ts`:

```typescript
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from './prisma'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'sqlite',
  }),
})
```

### 5. API Route Handler

Create `server/api/auth/[...all].ts`:

```typescript
import { auth } from '~~/server/utils/auth'

export default auth.handler
```

### 6. Client Auth Configuration

Create `app/utils/auth-client.ts`:

```typescript
import { createAuthClient } from 'better-auth/vue'

export const authClient = createAuthClient()
```

## Email OTP Setup

### 1. Add Email OTP Plugin

Update `server/utils/auth.ts`:

```typescript
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from './prisma'
import { emailOTP } from 'better-auth/plugins/email-otp'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'sqlite',
  }),
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Your OTP Code',
          html: `<p>Your OTP code is: <strong>${otp}</strong></p>`,
        })
      },
    }),
  ],
})
```

### 2. Update Client Configuration

Update `app/utils/auth-client.ts`:

```typescript
import { createAuthClient } from 'better-auth/vue'
import { emailOTPClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  plugins: [emailOTPClient()],
})
```

### 3. Environment Variables

Update `.env` file:

```bash
# The credentials of the OTP SENDING account
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
```

## Authentication Flow Implementation

### Email OTP Authentication Pattern

Send OTP to user:

```typescript
const { data, error } = await authClient.emailOtp.sendVerificationOtp({
  email: 'user@example.com',
  type: 'sign-in',
})
```

Verify OTP and sign in:

```typescript
const { data, error } = await authClient.signIn.emailOtp({
  email: 'user@example.com',
  otp: '123456',
})
```

### Server-side Session Validation

```typescript
const session = await auth.api.getSession({
  headers: event.headers,
})

if (!session) {
  throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
}

// Use session.user.id for database operations
```

### Client-side Session Management

```typescript
const { data: session } = await authClient.useSession(useFetch)

if (session.value) {
  // User is authenticated
  console.log(session.value.user.id)
}
```

## Route Protection

### Global Middleware

Create `app/middleware/auth.global.ts`:

```typescript
import { authClient } from '../utils/auth-client'

export default defineNuxtRouteMiddleware(async (to) => {
  const { data: session } = await authClient.useSession(useFetch)

  if (session.value) {
    if (to.path === '/auth') {
      return navigateTo('/')
    }
  } else {
    if (to.path !== '/auth') {
      return navigateTo('/auth')
    }
  }
})
```

### Sign Out Implementation

```typescript
await authClient.signOut()
await navigateTo('/auth')
```

## Advanced Usage Patterns

### Form Validation with Zod

Create dynamic schemas for multi-step authentication:

```typescript
import { z } from 'zod'

const schema = computed(() => {
  if (!isEmailSent.value) {
    return z.object({
      email: z.string().email('Invalid email'),
    })
  } else {
    return z.object({
      email: z.string().email('Invalid email'),
      otp: z.array(z.string()).length(6, 'Must be 6 digits'),
    })
  }
})
```

Handle form submission with typed validation:

```typescript
async function handleSubmit(event: FormSubmitEvent<any>) {
  if (!isEmailSent.value) {
    const { data, error } = await authClient.emailOtp.sendVerificationOtp({
      email: state.email,
      type: 'sign-in',
    })

    if (error) {
      toast.add({ title: 'Error', description: error.message, color: 'error' })
    } else {
      isEmailSent.value = true
      toast.add({ title: 'Success', description: 'OTP sent to your email', color: 'success' })
    }
  } else {
    const { data, error } = await authClient.signIn.emailOtp({
      email: state.email,
      otp: state.otp.join(''),
    })

    if (error) {
      toast.add({ title: 'Error', description: error.message, color: 'error' })
    } else {
      await navigateTo('/', { external: true })
    }
  }
}
```

### 6-Digit OTP Input Component

Create reactive OTP state and input:

```typescript
const state = reactive({
  email: '',
  otp: [] as string[],
})
```

Render individual digit inputs:

```vue
<template>
  <div class="flex gap-2" v-if="isEmailSent">
    <UInput
      v-for="(digit, index) in 6"
      :key="index"
      v-model="state.otp[index]"
      type="text"
      maxlength="1"
      class="w-12 text-center"
      @input="handleOtpInput(index, $event)"
    />
  </div>
</template>
```

Handle OTP input navigation:

```typescript
function handleOtpInput(index: number, event: Event) {
  const input = event.target as HTMLInputElement
  const value = input.value

  // Auto-focus next input
  if (value && index < 5) {
    const nextInput = input.parentElement?.children[index + 1] as HTMLInputElement
    nextInput?.focus()
  }
}
```

### User Profile Management Integration

Combine authentication with user features:

```typescript
// Protected route requiring authentication
export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({
    headers: event.headers,
  })

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  // Use authenticated user ID for user-specific operations
  const userProfile = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  return userProfile
})
```

File upload with session validation:

```typescript
export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({
    headers: event.headers,
  })

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  // Process file upload for authenticated user
  const form = await readMultipartFormData(event)
  const file = form?.find((i) => i.name === 'file')

  // Store file in user-specific directory
  const userDir = path.join('uploads', session.user.id)
  // ... file processing logic
})
```

### Toast Notifications for Auth Feedback

Set up toast notifications:

```typescript
const toast = useToast()
```

Provide feedback during authentication flow:

```typescript
// Success notification
toast.add({
  title: 'Success',
  description: 'OTP sent to your email',
  color: 'success',
})

// Error notification
toast.add({
  title: 'Error',
  description: error.message,
  color: 'error',
})
```

### Public API with Optional Authentication

Create APIs that work for both authenticated and unauthenticated users:

```typescript
export default defineEventHandler(async (event) => {
  // Optional session check
  const session = await auth.api.getSession({
    headers: event.headers,
  })

  if (session) {
    // Authenticated user gets full profile
    return await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { sessions: true, accounts: true },
    })
  } else {
    // Public user gets limited data
    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
      },
    })
  }
})
```

Conditional data access based on authentication:

```typescript
export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({
    headers: event.headers,
  })

  const userId = getRouterParam(event, 'id')

  // Users can only access their own full profile
  if (session?.user.id !== userId) {
    return {
      id: userId,
      name: 'Restricted User',
      // Limited public information
    }
  }

  // Full profile for own user
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      sessions: true,
      accounts: true,
      // Add other sensitive fields
    },
  })
})
```

