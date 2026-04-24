/**
 * Track 3: Client-side route guard
 * Protects all pages that require authentication.
 * Role-based redirects for index pages (/orders, /projects).
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const { fetchSession, isLoggedIn, isAdmin, isMentor, isStudent } = useAuth()

  await fetchSession()

  // Public routes that don't need auth
  if (to.path === '/login') {
    if (isLoggedIn.value) return navigateTo('/orders')
    return
  }

  // Require auth for all other routes
  if (!isLoggedIn.value) {
    return navigateTo('/login')
  }

  // Role-based redirect for /orders index
  if (to.path === '/orders') {
    if (isAdmin.value) return navigateTo('/orders/admin')
    if (isMentor.value) return navigateTo('/orders/mentor')
    if (isStudent.value) return navigateTo('/orders/student')
  }

  // Role-based redirect for /projects index
  if (to.path === '/projects') {
    if (isAdmin.value) return navigateTo('/projects/admin')
    if (isMentor.value) return navigateTo('/projects/mentor')
    if (isStudent.value) return navigateTo('/projects/student')
  }

  // Database updates: admin only
  if (to.path.startsWith('/database-updates') && !isAdmin.value) {
    return navigateTo('/orders')
  }

  // Request form and reimbursement: student only
  if ((to.path === '/request-form' || to.path.startsWith('/reimbursement')) && !isStudent.value) {
    return navigateTo('/orders')
  }
})
