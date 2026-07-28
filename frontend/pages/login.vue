<template>
  <div class="min-h-screen bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center">
    <!-- Apply transition when login is successful -->
    <transition name="fade">
      <div v-if="loginSuccess" class="login-success-message">
        <p>Login Successful!</p>
      </div>
    </transition>

    <div class="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
      <!-- Logo -->
      <div class="flex justify-center mb-6">
        <img src="~/assets/img/abc_company_logo.png" alt="Logo" class="w-32 h-auto" />
      </div>

      <!-- Form Start -->
      <h2 class="text-3xl font-semibold text-center text-gray-900 mb-6">Login</h2>

      <form @submit.prevent="login" class="space-y-6">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
          <input
            v-model="username"
            type="text"
            id="username"
            class="mt-1 block w-full px-4 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your username"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <input
            v-model="password"
            type="password"
            id="password"
            class="mt-1 block w-full px-4 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your password"
          />
        </div>

        <!-- Role Dropdown -->
        <div>
          <label for="role" class="block text-sm font-medium text-gray-700">Login As</label>
          <select
            v-model="loginType"
            id="role"
            class="mt-1 block w-full px-4 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
          <!-- NOTE to myself:
             I will use option value = 'employee' for all the staff  except for the sales related roles and postions
             But later I will  replace the option value = 'employee'  expcept for the standarduser  this standuser option are still need to be replace
             later. My main goal for this is to make  this flexible as possible. 

             Right now, I will just add all the positon to staticly for the dropdown, but later I will make this dynamic by fetching the role and position from the backend.
          -->
           <!-- For now all standarduser is consider admin -->
            <option value="standarduser">Admin</option>
            <!-- <option value="standarduser">Power User</option> -->
            <option value="unitmanager">Unit Manager</option>
            <option value="lm">Local Manager</option>
            <option value="salesagent">Sales Agent</option>
            <option value="employee">CSD & Collections Manager</option>
            <option value="employee">CSD Assistant Manager</option>
            <option value="employee">Collection Assistant Manager</option>
            <option value="employee">CSD & Collections Quality Analyst/ Trainer</option>
            <option value="employee">CSD Team Leader</option>
            <option value="employee">Collection Team Leader</option>
            <option value="employee">CSD Agent</option>
            <option value="employee">Collection Agent</option>
             
          </select>
        </div>

        <button
          type="submit"
          class="w-full py-2 px-4 text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-md"
        >
          Login
        </button>
      </form>
      <!-- Form End -->

      <div class="text-center mt-4">
        <p class="text-sm text-gray-600 font-bold">
          ABC PERFORMANCE MANAGEMENT SYSTEM
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'



const router = useRouter()
const authStore = useAuthStore() 

definePageMeta({
  layout: 'custom' ,// This tells Nuxt to use the 'custom' layout for this page
  middleware: ['auth'] 
})

// Define reactive form data
const username = ref('')
const password = ref('')
const loginType = ref('standarduser') // Default role selection
const loginSuccess = ref(false)


const login = async () => {
  if (username.value === "" || password.value === "") {
    alert('Username and Password should not be empty')
    return
  }

  // Send role along with login
  await authStore.login(username.value, password.value, loginType.value)

  if(authStore.state.user?.role == 'user' && loginType.value != 'salesagent' ){
    alert(`You are not allowed to login as  ${loginType.value}`)
    return
  }

  
  if(authStore.state.user?.role == 'manager' && authStore.state.user?.agent_type == 1 && loginType.value != 'lm'){
    alert(`You are not allowed to login as  ${loginType.value}`)
    return
  }

  if(authStore.state.user?.role == 'manager' && authStore.state.user?.agent_type == 2 && loginType.value != 'unitmanager'){
    alert(`You are not allowed to login as  ${loginType.value}`)
    return
  }

  

  
  // if (authStore.state.user?.role == 'user' && authStore.state.token){
  //   alert('Login is Successful for user')
  //   router.push('/')
  //   return
  // }

  //  if (authStore.state.token) {
  //   alert("Login is Successful")
    
  //   router.push('/')
  //   return
  // }

  // if(authStore.state.token) {
  //   alert("Login is Successful")
  //   if(authStore.state.user?.role == 'admin' || (authStore.state.user?.role == 'manager' && authStore.state.user?.level == 5 )){
  //      router.push('/select_department')
  //   } else if (['csd', 'collection', 'purchasing', 'hradmin', 'it', 'uploading'].includes(authStore.state.user?.department_code)) {
  //     router.push(`/${authStore.state.user?.department_code}`)
  //   }
  //   // for now sales will go to legacy route ..
  //   else {
  //     router.push('/')
  //   }
  // }


  if (authStore.state.token) {
    alert("Login is Successful")

    const user = authStore.state.user

    // ✅ STEP 1: Who can select department
    if (
      user.role === 'admin' ||
      (user.role === 'manager' && user.level >= 5)
    ) {
      return router.push('/select_department')
    }

    // ✅ STEP 2: Department routing
    const departmentRoutes = {
      csd: '/csd',
      collection: '/collection',
      purchasing: '/purchasing',
      hradmin: '/hr',
      it: '/it',
      uploading: '/uploading'
    }

    if (departmentRoutes[user.department_code]) {
      return router.push(departmentRoutes[user.department_code])
    }

    // ✅ STEP 3: fallback (sales legacy)
    return router.push('/')
}


  if (authStore.state.error) {
    alert(authStore.state.error)
    return
  }



  loginSuccess.value = true
  authStore.fetchTokenFromLocalStore()

  // if (authStore.state.token) {
  //   alert("Login is Successful")
  //   router.push('/')
  //   return
  // }
}

onMounted(() => {
  if (authStore.state.token) {
    authStore.fetchTokenFromLocalStore()
    if (authStore.state.token) {
      router.push('/')
    }
  }
})
</script>

<style scoped>
.login-success-message {
  background-color: #4caf50;
  color: white;
  padding: 10px;
  border-radius: 5px;
  text-align: center;
  font-size: 16px;
  margin-top: 10px;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 10s ease-in-out, transform 10s ease-out;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
