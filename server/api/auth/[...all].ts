import { auth } from '~~/server/lib/auth'

/**
 * Track 3: BetterAuth HTTP handler
 * Catches all /api/auth/* routes and delegates to BetterAuth.
 */
export default defineEventHandler(event => {
  return auth.handler(toWebRequest(event))
})
