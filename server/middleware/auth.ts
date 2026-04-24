import { auth } from '~/server/lib/auth'
import { prisma } from '~/server/utils/prisma'

/**
 * Track 3: Server-side auth guard
 *
 * Runs on every /api/* request.
 * - Skips /api/auth/* (BetterAuth handles its own routes)
 * - Validates session and attaches user + role to event context
 */
export default defineEventHandler(async event => {
  const url = getRequestURL(event)

  // Only protect API routes — let page requests and static assets through
  if (!url.pathname.startsWith('/api/')) return

  // Allow BetterAuth's own routes through (including /api/auth/me)
  if (url.pathname.startsWith('/api/auth')) return

  const session = await auth.api.getSession({ headers: event.headers })

  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  // Load full user record from our DB (includes roleID)
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { role: true },
  })

  if (!user || !user.active) {
    throw createError({ statusCode: 401, statusMessage: 'User not found or inactive' })
  }

  // Attach to event context for use in API route handlers
  event.context.user = user
  event.context.role = user.roleID // 1=Admin, 2=Mentor, 3=Student
})
