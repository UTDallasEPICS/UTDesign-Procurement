import { authClient } from '../utils/auth-client'

export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/auth') return

  const { data: session } = await authClient.useSession(useFetch)

  if (!session.value?.session) {
    return navigateTo('/auth')
  }

  if (to.path.startsWith('/admin')) {
    const me = await $fetch('/api/me').catch(() => null)
    if (!me || !(me as any).isAdmin) {
      return navigateTo('/')
    }
  }
})
