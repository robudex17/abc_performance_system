
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

      // Redirect based on role
      if (authStore.state.user?.role === 'admin'  || authStore.state.user?.role !== 'poweruser' || authStore.state.user?.role === 'manager') {
        console.log('Redirecting admin to /admin')
        // return navigateTo('/')
        return navigateTo('/select_department')
      } else if (authStore.state.user?.role === 'user') {
        console.log('Redirecting user to /user-home')
        return navigateTo('/')
      } else {
        console.log('Redirecting to default home page')
        return navigateTo('/')
      }
    }
  } else {
    console.log('Running on the server')
  }
  
  
})


  