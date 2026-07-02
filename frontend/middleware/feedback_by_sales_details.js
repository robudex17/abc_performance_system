import { useAuthStore } from '@/stores/auth';

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();
  authStore.fetchTokenFromLocalStore()


  if(!to.query.who_give_feedback_id){
      alert('Access Denied')
      return navigateTo('/unauthorized'); 
  }

  if(Number(to.query.who_give_feedback_id) !== Number(authStore.state.user.login_id) && authStore.state.user?.role !== 'admin' && authStore.state.user?.role !== 'poweruser'){
      alert('Access Denied')
      return navigateTo('/unauthorized'); 
  }



});
