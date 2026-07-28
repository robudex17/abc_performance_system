<template>
    <div class="min-h-screen bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center">
      <div class="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <!-- Logo -->
        <div class="flex justify-center mb-6">
          <img src="~/assets/img/sbtlogo.png" alt="Logo" class="w-32 h-auto" />
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
  
          <button
            type="submit"
            class="w-full py-2 px-4 text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-md"
          >
            Login
          </button>
        </form>
        <!-- Form End -->
  
        <div class="text-center mt-4">
          <p class="text-sm text-gray-600  font-bold">
            SBT PHILIPPINES SALES APP
          </p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref,onMounted } from 'vue'

const authStore = useAuthStore() 


  
  // Define reactive form data
  const username = ref('')
  const password = ref('')

 
  
  // Dummy login function to simulate the form submission
  const login = async () => {
    console.log('Logging in with:', username.value, password.value)
    // Here, you can implement your login logic (e.g., API request)
     await authStore.login(username.value, password.value)
  }

  onMounted(() => {

  })
  </script>
  
  <style scoped>
  /* Custom styles for the layout can be added if needed */
  </style>
  