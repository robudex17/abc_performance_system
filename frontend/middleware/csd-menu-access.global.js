// Denies the pages of the CSD menu to the people the menu hides them from (position level, role ...).
// The rules are the ones of config/csdMenu.js (the side menu), see composables/useMenuAccess.js.
//   e.g. a level 1, 2, 3 employee can not open /csd/team_performance/monthly or /csd/csd_evaluation by typing the address.
// Only the /csd area is checked here. Admin, poweruser and the others follow the same menu rules.
//
// NOTE: this only guards the pages; the backend routes check who can read / change the data.
//
// IMPORTANT: a GLOBAL middleware is loaded when the app starts: the token is read from the local storage
// (see middleware/department-home.global.js for the reason).
import { jwtDecode } from 'jwt-decode'
import { csdMenu } from '~/config/csdMenu'
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
  if (!isInsideArea(to.path, '/csd')) return

  const user = readUserFromToken()
  if (!user) return                       // not logged in: the 'auth' middleware of the page sends them to /login

  const { canOpenPath } = useMenuAccess()
  if (!canOpenPath(csdMenu, user, to)) {
    return navigateTo('/unauthorized', { replace: true })
  }
})
