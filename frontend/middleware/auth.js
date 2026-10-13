
import { canSwitchDepartment, getDepartmentHome } from '~/config/departments'

export default defineNuxtRouteMiddleware((to, from) => {
  if (!import.meta.env.SSR) {                     // Runs only on the client
    // const token = localStorage.getItem('jwt')

    const authStore = useAuthStore()
    authStore.fetchTokenFromLocalStore()
  
    if (!authStore.state.token && to.path !== '/login') {
      console.log('Redirecting to /login...')
      return navigateTo('/login')
    } 
    
    if (authStore.state.token && to.path === '/login') {
      console.log('User already logged in')

      // admin and the top managers choose the department, the department staff go to their own department,
      // everybody else (sales) goes to the sales root (config/departments.js)
      const user = authStore.state.user
      if (canSwitchDepartment(user)) {
        return navigateTo('/select_department')
      }
      return navigateTo(getDepartmentHome(user) ?? '/')
    }
  } else {
    console.log('Running on the server')
  }
  
  
})


  