// Only the CSD & Collections Quality Analyst / Trainer: used by the QA feedback page (pages/csd/feedback_by_qa.vue).
// NOTE: this only guards the page; the backend routes (middleware/qa_access.js) check the same position.
import { isQaStaff } from '~/config/departments'

export default defineNuxtRouteMiddleware(() => {
  if (import.meta.env.SSR) return

  const authStore = useAuthStore()
  authStore.fetchTokenFromLocalStore()

  if (!authStore.state.user || !isQaStaff(authStore.state.user)) {
    return navigateTo('/unauthorized')
  }
})
