// Denies the pages of the CSD and Collection menus to the people the menu hides them from (position level, role ...).
// The rules are the ones of the menus (config/csdMenu.js, config/collectionMenu.js), see composables/useMenuAccess.js.
//   e.g. a level 1, 2, 3 employee can not open /csd/team_performance/monthly or /collection/collection_evaluation by typing the address.
// Only the /csd and /collection areas are checked here. Admin, poweruser and the others follow the same menu rules.
//
// NOTE: this only guards the pages; the backend routes check who can read / change the data.
//
// IMPORTANT: a GLOBAL middleware is loaded when the app starts: the token is read from the local storage
// (see middleware/department-home.global.js for the reason).
import { jwtDecode } from 'jwt-decode'
import { DEPARTMENT_VIEWS, departmentViewOfPath } from '~/config/departmentViews'
import { isInsideArea } from '~/config/departments'

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
  if (!Object.values(DEPARTMENT_VIEWS).some(view => isInsideArea(to.path, view.base))) return

  const user = readUserFromToken()
  if (!user) return                       // not logged in: the 'auth' middleware of the page sends them to /login

  const { canOpenPath } = useMenuAccess()
  if (!canOpenPath(departmentViewOfPath(to.path).menu, user, to)) {
    return navigateTo('/unauthorized', { replace: true })
  }
})
