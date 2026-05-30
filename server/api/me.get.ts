import { auth } from '../utils/auth'
import { isAdmin } from '../utils/roles'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    isAdmin: isAdmin(session.user.email),
  }
})
