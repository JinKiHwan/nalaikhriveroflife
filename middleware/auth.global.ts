export default defineNuxtRouteMiddleware((to, from) => {
  // ⚠️ [QA 모드] 인증 가드 임시 비활성화 - QA 완료 후 활성화 필요
  // TODO: QA 완료 후 아래 return 구문 삭제
  return

  // Only evaluate auth state on the client side since Firebase Auth runs client-side
  if (process.client) {
    const { isAuthenticated, userRole } = useAuth()

    // 1. If user is NOT logged in and not going to /login, force redirect to /login
    if (!isAuthenticated.value && to.path !== '/login') {
      return navigateTo('/login')
    }

    // 2. If user IS logged in and trying to go to /login, redirect to home /
    if (isAuthenticated.value && to.path === '/login') {
      return navigateTo('/')
    }

    // 3. Admin Route protection
    if (to.path.startsWith('/admin')) {
      if (userRole.value !== 'master') {
        console.warn('Unauthorized admin access attempt:', userRole.value)
        return navigateTo('/')
      }
    }

    // 4. Teachers Room Route protection
    if (to.path.startsWith('/teachers-room')) {
      if (userRole.value !== 'teacher' && userRole.value !== 'master') {
        console.warn('Unauthorized teachers-room access attempt:', userRole.value)
        return navigateTo('/')
      }
    }
  }
})
