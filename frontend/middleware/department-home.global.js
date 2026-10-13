// Keeps the staff of a department inside their own department. Runs on every page change.
//
//  - A CSD employee who opens the sales root (/sbtph_performance_system/) goes back to /csd.
//    The same for every department that has a home page (collection, purchasing, ...).
//  - A department employee who opens the area of another department (/collection while in csd) goes back home.
//  - A sales agent who opens a department area goes back to the sales root.
//  - Admin and the top managers (canSwitchDepartment) are free: they pick the department in /select_department.
//
// NOTE: this only guides the browser; the backend routes still have to check who can read / change the data.
//
// IMPORTANT: a GLOBAL middleware is loaded when the app starts. Do not use useAuthStore() here: the auth store
// imports utils/api.js, which calls useRuntimeConfig() at the top of the file, and that crashes the whole app
// (white screen) when it runs before the Nuxt app exists. The token is read from the local storage instead.
import { jwtDecode } from 'jwt-decode'
import { canSwitchDepartment, getDepartmentHome, DEPARTMENT_PREFIXES, isInsideArea } from '~/config/departments'

// same token the auth store keeps (localStorage 'jwt'); null when not logged in or the token is not readable
const readUserFromToken = () => {
  try {
    const token = localStorage.getItem('jwt')
    return token ? jwtDecode(token) : null
  } catch (error) {
    return null
  }
}

export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.env.SSR) return

  const user = readUserFromToken()
  if (!user) return                       // not logged in: the 'auth' middleware of the page sends them to /login
  if (canSwitchDepartment(user)) return

  const home = getDepartmentHome(user)

  // department staff: only their own area (and the shared pages: feedback, login, ...)
  if (home) {
    // never send somebody to a home page that does not exist yet (it, hradmin, uploading ...)
    if (useRouter().resolve(home).matched.length === 0) return

    const inSalesRoot = to.path === '/'
    const inOtherDepartment = DEPARTMENT_PREFIXES.some(prefix => prefix !== home && isInsideArea(to.path, prefix))

    if (inSalesRoot || inOtherDepartment) {
      return navigateTo(home, { replace: true })
    }
    return
  }

  // sales agents stay out of the department areas
  if (user.login_type === 'salesagentuser' && DEPARTMENT_PREFIXES.some(prefix => isInsideArea(to.path, prefix))) {
    return navigateTo('/', { replace: true })
  }
})
