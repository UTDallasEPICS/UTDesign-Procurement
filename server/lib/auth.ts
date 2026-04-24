import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from '~/server/utils/prisma'

/**
 * Track 3: BetterAuth Instance
 *
 * Currently configured with email + password for development.
 * UTD SSO via Microsoft Azure AD is stubbed below — enable it
 * once UTD OIT provides the clientId, clientSecret, and tenantId.
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'sqlite' }),

  // Use dedicated Auth* tables so our app User model (Int PK) stays separate
  user: { modelName: 'authUser' },
  session: { modelName: 'authSession', expiresIn: 3600 },
  account: { modelName: 'authAccount' },

  emailAndPassword: {
    enabled: true,
    // Students/mentors/admins log in with their @utdallas.edu email + a password
    // set during account creation (seed or admin creation flow)
  },

  // ── UTD SSO (Microsoft Azure AD) ─────────────────────────────────────────
  // Uncomment and fill in when UTD OIT provides credentials:
  //
  // socialProviders: {
  //   microsoft: {
  //     clientId: process.env.MICROSOFT_CLIENT_ID!,
  //     clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
  //     tenantId: process.env.MICROSOFT_TENANT_ID!,
  //   },
  // },
  // ─────────────────────────────────────────────────────────────────────────

  advanced: {
    database: {
      generateId: () => crypto.randomUUID(),
    },
  },
})

export type Auth = typeof auth
