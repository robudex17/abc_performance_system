// The pages of the Leadership Individual Performance (/leadership/leadership_evaluation): only the heads who evaluate the leaders:
//   the GOM (position level 15), the CSD & Collection Manager (10) and the assistant managers (9).
// The Quality Analyst (level 9) has no subordinates: nothing to evaluate. Admin and poweruser do not evaluate.
// NOTE: this only guards the page; the backend checks who can evaluate whom (the head of the employee, or the GOM for the manager).
import { isQaStaff } from '~/config/departments'

const EVALUATOR_LEVELS = [15, 10, 9]

export default defineNuxtRouteMiddleware(() => {
  if (import.meta.env.SSR) return

  const authStore = useAuthStore()
  authStore.fetchTokenFromLocalStore()
  const user = authStore.state.user

  if (!user || !EVALUATOR_LEVELS.includes(Number(user.position_level)) || isQaStaff(user)) {
    return navigateTo('/unauthorized')
  }
})
