// Only the admin role (not poweruser): used by the details page of the none-sales employees.
// NOTE: this only guards the page; the backend routes check the role too.
export default defineNuxtRouteMiddleware(() => {
  if (import.meta.env.SSR) return

  const authStore = useAuthStore()
  authStore.fetchTokenFromLocalStore()

  if (!authStore.state.user || authStore.state.user.role !== 'admin') {
    return navigateTo('/unauthorized')
  }
})
