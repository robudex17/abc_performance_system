import { useAuthStore } from '@/stores/auth';

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();
  authStore.fetchTokenFromLocalStore()

  

  if(to.fullPath === '/feedback/feedback_by_sales?feedback_type=lm_by_um' && (authStore.state.user.agent_type !=2 && authStore.state.user?.role !== 'admin' &&  authStore.state.user?.role !== 'poweruser')){
      alert('Access Denied')
      return navigateTo('/unauthorized'); 
  }

    if(to.fullPath === '/feedback/feedback_by_sales?feedback_type=um_by_lm' && (authStore.state.user.agent_type !=1 && authStore.state.user?.role !== 'admin' && authStore.state.user?.role !== 'poweruser')){
      alert('Access Denied')
      return navigateTo('/unauthorized'); 
  }

    if(to.fullPath === '/feedback/feedback_by_sales?feedback_type=agent_by_lm' && (authStore.state.user.agent_type !=1 && authStore.state.user?.role !== 'admin' && authStore.state.user?.role !== 'poweruser')){
      alert('Access Denied')
      return navigateTo('/unauthorized'); 
  }

  
  if(to.fullPath === '/feedback/feedback_by_sales?feedback_type=lm_by_agent' && (authStore.state.user.agent_type !=0 && authStore.state.user?.role !== 'admin' && authStore.state.user?.role !== 'poweruser')){
      alert('Access Denied')
      return navigateTo('/unauthorized'); 
  }




});
