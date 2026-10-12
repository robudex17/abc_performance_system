// Access check for /feedback/feedback_by_nonesales (none-sales departments).
//   by_member -> the member rates his/her immediate head
//   by_head   -> the head rates his/her members
// Allowed position levels are the same as the sidebar menu (config/csdMenu.js).
// NOTE: this only guards the page; the backend still has to check who can read/write.
const ALLOWED_LEVELS = {
  by_member: [9, 8, 3, 1],
  by_head: [10, 9, 8],
}

export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.env.SSR) return

  const authStore = useAuthStore()
  authStore.fetchTokenFromLocalStore()

  const user = authStore.state.user
  // the list page has it in the query, the form page in the path (/feedback_by_nonesales/:feedback_type)
  const allowedLevels = ALLOWED_LEVELS[to.params.feedback_type || to.query.feedback_type]

  const allowed =
    user &&
    user.role !== 'admin' &&
    allowedLevels &&
    allowedLevels.includes(Number(user.position_level))

  if (!allowed) {
    alert('Access Denied')
    return navigateTo('/unauthorized')
  }
})
