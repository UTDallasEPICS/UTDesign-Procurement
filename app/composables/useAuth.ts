import { createAuthClient } from 'better-auth/vue'
import { ROLES, type Role } from '~~/shared/constants/roles'

let _authClient: ReturnType<typeof createAuthClient> | null = null

function getAuthClient() {
  if (!_authClient) {
    _authClient = createAuthClient({ baseURL: '' })
  }
  return _authClient
}

export const useAuth = () => {
  const authClient = getAuthClient()
  const session = useState<{
    user: { email: string; name?: string; netID?: string | null } | null
    role?: Role
  } | null>('auth:session', () => null)

  const user = computed(() => session.value?.user ?? null)
  const role = computed(() => session.value?.role ?? null)
  const isAdmin = computed(() => role.value === ROLES.ADMIN)
  const isMentor = computed(() => role.value === ROLES.MENTOR)
  const isStudent = computed(() => role.value === ROLES.STUDENT)
  const isLoggedIn = computed(() => !!user.value)

  async function fetchSession() {
    try {
      const data = await $fetch<{
        user: { email: string; name?: string; netID?: string | null }
        role: Role
      } | null>('/api/auth/me')
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

  return { session, user, role, isAdmin, isMentor, isStudent, isLoggedIn, fetchSession, signOut, authClient }
}
