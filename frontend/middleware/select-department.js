import { useAuthStore } from '@/stores/auth';
import { isGom } from '~/config/departments'

// The page /select_department: the same people as the 'adminmanager' middleware (admin, poweruser, agent type 2, position level 10)
// plus the GOM (position level 15). 'adminmanager' stays as it is: the sales admin pages use it.
export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore();
  authStore.fetchTokenFromLocalStore()
  const user = authStore.state.user

  const allowed = user && (
    ['admin', 'poweruser'].includes(user.role) ||
    user.agent_type == 2 ||
    user.position_level === 10 ||
    isGom(user)
  )

  if (!allowed) {
    return navigateTo('/unauthorized')
  }
})
