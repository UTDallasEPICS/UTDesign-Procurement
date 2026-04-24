import { createAuthClient } from 'better-auth/vue'

/**
 * Track 3: BetterAuth client + composable
 * authClient is created lazily so useRuntimeConfig() runs inside a Nuxt context.
 */
let _authClient: ReturnType<typeof createAuthClient> | null = null

function getAuthClient() {
  if (!_authClient) {
    // baseURL defaults to current origin — works for same-domain Nuxt setup
    _authClient = createAuthClient({ baseURL: '' })
  }
  return _authClient
}

export const useAuth = () => {
  const authClient = getAuthClient()
  const session = useState<{
    user: { email: string; name?: string } | null
    roleID?: number
    role?: string
  } | null>('auth:session', () => null)

  const user = computed(() => session.value?.user ?? null)
  const roleID = computed(() => session.value?.roleID ?? null)
  const isAdmin = computed(() => roleID.value === 1)
  const isMentor = computed(() => roleID.value === 2)
  const isStudent = computed(() => roleID.value === 3)
  const isLoggedIn = computed(() => !!user.value)

  async function fetchSession() {
    try {
      const data = await $fetch<{ user: { email: string }; roleID: number; role: string } | null>(
        '/api/auth/me',
      )
      session.value = data
    } catch {
      session.value = null
    }
  }

  async function signOut() {
    await authClient.signOut()
    session.value = null
    await navigateTo('/login')
  }

  return { session, user, roleID, isAdmin, isMentor, isStudent, isLoggedIn, fetchSession, signOut, authClient }
}
