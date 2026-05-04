import { auth } from '~/server/lib/auth'
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async event => {
  const url = getRequestURL(event)

  if (!url.pathname.startsWith('/api/')) return
  if (url.pathname.startsWith('/api/auth')) return

  const session = await auth.api.getSession({ headers: event.headers })

  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user || !user.active) {
    throw createError({ statusCode: 401, statusMessage: 'User not found or inactive' })
  }

  event.context.user = user
  event.context.role = user.role // 'ADMIN' | 'MENTOR' | 'STUDENT'
})
