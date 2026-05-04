import type { User, UserRole } from '@prisma/client'

declare module 'h3' {
  interface H3EventContext {
    user: User
    role: UserRole
  }
}
