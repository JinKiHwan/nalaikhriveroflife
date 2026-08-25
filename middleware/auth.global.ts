export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  const {
    isAuthenticated,
    isApproved,
    isMaster,
    isAdmin,
    isTeacher,
    waitForAuthReady,
    logout,
  } = useAuth()

  await waitForAuthReady()

  const isPublicRoute = to.path === '/login' || to.path === '/register'

  if (isPublicRoute) {
    if (isAuthenticated.value && isApproved.value) return navigateTo('/', { replace: true })
    if (isAuthenticated.value && !isApproved.value) await logout()
    return
  }

  if (!isAuthenticated.value || !isApproved.value) {
    if (isAuthenticated.value) await logout()
    return navigateTo('/login', { replace: true })
  }

  if (to.path.startsWith('/admin') && !isAdmin.value) {
    return navigateTo('/', { replace: true })
  }

  if (to.path.startsWith('/teachers-room') && !isTeacher.value) {
    return navigateTo('/', { replace: true })
  }
})
