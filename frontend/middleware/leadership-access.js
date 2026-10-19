// The pages of the Leadership Individual Performance (/leadership/leadership_evaluation): only the heads who evaluate the leaders:
//   the GOM (position level 15), the CSD & Collection Manager and the Purchasing Manager (10), the assistant managers (9) and the
//   Purchasing Team Leaders (8), who evaluate the assistant team leaders of their team.
// Admin and poweruser only VIEW one evaluation (the page with ?evaluator_id), they do not evaluate.
// The Quality Analyst (level 9) has no subordinates: nothing to evaluate. Admin and poweruser do not evaluate.
// NOTE: this only guards the page; the backend checks who can evaluate whom (the head of the employee, or the GOM for the manager).
import { isQaStaff, isGom } from '~/config/departments'

const EVALUATOR_LEVELS = [15, 10, 9, 8]
const VIEWER_ROLES = ['admin', 'poweruser']
const LIST_PATH = '/leadership/leadership_evaluation'

// Evaluators: the list and the form. Admin and poweruser: only the page of one evaluation (the link of the Leadership Performance in the
// CSD Evaluation, with ?evaluator_id), to VIEW it; never the list. Everybody else: denied.
export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.env.SSR) return

  const authStore = useAuthStore()
  authStore.fetchTokenFromLocalStore()
  const user = authStore.state.user

  if (!user) return navigateTo('/unauthorized')

  // the GOM evaluates, whatever his login role is (poweruser to view the sales pages): he is not a viewer
  if (VIEWER_ROLES.includes(user.role) && !isGom(user)) {
    const isListPage = to.path.replace(/\/+$/, '') === LIST_PATH
    if (isListPage || !to.query.evaluator_id) return navigateTo('/unauthorized')
    return
  }

  if (!EVALUATOR_LEVELS.includes(Number(user.position_level)) || isQaStaff(user)) {
    return navigateTo('/unauthorized')
  }
})
