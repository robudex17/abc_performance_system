import { useAuthStore } from '@/stores/auth';

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();
  authStore.fetchTokenFromLocalStore()



  if (!authStore.state.user || ( authStore.state.user?.role !== 'admin' && authStore.state.user?.role !== 'poweruser' &&  authStore.state.user.agent_type != 1 && authStore.state.user.agent_type != 2) ) {
    alert('its true')
    return navigateTo('/unauthorized'); // Redirect if not admin
  }else{
    console.log('The role is not a useer?')

  }
});
