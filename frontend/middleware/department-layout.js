// For pages shared by every department (e.g. none-sales feedback, employee details, leadership evaluation) and for the pages
// that CSD and Collection share (pages/csd opened under /collection with an alias):
// pick the layout (sidebar + navbar) from the url (/collection/... is Collection, /csd/... is CSD), else from ?department_code
// of the page, else from the logged in user's department (the admin is not in the department he is managing).
// A department without its own layout keeps the default one.
// Add a new department here once its layout exists in /layouts.
import { isInsideArea } from '~/config/departments'

const DEPARTMENT_LAYOUTS = {
  csd: 'csd',
  collection: 'collection',
  purchasing: 'purchasing',
}

export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.env.SSR) return

  const authStore = useAuthStore()
  authStore.fetchTokenFromLocalStore()

  const departmentOfThePath = Object.keys(DEPARTMENT_LAYOUTS).find(code => isInsideArea(to.path, `/${code}`))
  const departmentCode = departmentOfThePath
    || String(to.query.department_code || authStore.state.user?.department_code || '').toLowerCase()
  const layout = DEPARTMENT_LAYOUTS[departmentCode]

  if (layout) {
    setPageLayout(layout)
  }
})
