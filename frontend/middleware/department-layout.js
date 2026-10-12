// For pages shared by every department (e.g. none-sales feedback, employee details):
// pick the layout (sidebar + navbar) from ?department_code of the page, or else from the
// logged in user's department (the admin is not in the department he is managing).
// A department without its own layout keeps the default one.
// Add a new department here once its layout exists in /layouts.
const DEPARTMENT_LAYOUTS = {
  csd: 'csd',
  collection: 'collection',
}

export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.env.SSR) return

  const authStore = useAuthStore()
  authStore.fetchTokenFromLocalStore()

  const departmentCode = String(to.query.department_code || authStore.state.user?.department_code || '').toLowerCase()
  const layout = DEPARTMENT_LAYOUTS[departmentCode]

  if (layout) {
    setPageLayout(layout)
  }
})
