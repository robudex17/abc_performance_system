<template>
<div class="relative min-h-screen overflow-hidden bg-gray-950 text-white">
 
  <!-- Background -->
  <div class="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>

  <!-- Glow -->
  <div class="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl"></div>
  <div class="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-3xl"></div>

  <!-- CONTENT -->
  <div class="relative z-10 p-8">

    <!-- TOP BAR -->
    <div class="flex justify-between items-center mb-6">

      <!-- LEFT: Welcome -->
      <div class="text-lg font-semibold text-white">
        Welcome, {{ currentUser?.firstname || 'User' }}
      </div>

      <!-- RIGHT: User + Logout -->
      <div class="flex items-center gap-4">

        <!-- USER CARD -->
        <div class="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-md">
          <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold">
                  <img 
                    :src="currentUser.image_link" 
                    alt="User Profile" 
                    class="w-10 h-10 rounded-full border-2 border-gray-300"
                />
          </div>
          <!-- <span class="text-sm text-white">
             CSD & Collections Quality Analyst/ Trainer
          </span> -->
        </div>

        <!-- LOGOUT -->
        <button
          @click="logout"
          class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition"
        >
          Logout
        </button>

      </div>
    </div>

    <!-- HEADER -->
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold mb-2 tracking-wide">
        ABC PERFORMANCE MANAGEMENT SYSTEM
      </h1>
      <p class="text-gray-300">
        Choose a department to continue
      </p>
    </div>

    <!-- GRID -->
    <div class="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">

      <!-- CARD -->
      <div
        v-for="dept in departments"
        :key="dept.id"
        @click="selectDepartment(dept)"
        class="group relative rounded-2xl overflow-hidden cursor-pointer transition transform hover:-translate-y-2 hover:scale-[1.02]"
      >

        <!-- Glass Background -->
        <div class="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl"></div>

        <!-- IMAGE (WHITE AREA) -->
        <div class="relative z-10 h-56 bg-white rounded-t-2xl flex items-center justify-center p-4">
          <img
            :src="dept.image ? dept.image : 'https://source.unsplash.com/400x400/?office'"
            class="w-full h-full object-contain"
          />
        </div>

        <!-- TEXT -->
        <div class="relative z-10 p-5 text-center">
          <h2 class="text-lg font-semibold text-white group-hover:text-blue-300 transition">
            {{ dept.name }}
          </h2>
          <p class="text-sm text-gray-300">
            {{ dept.description }}
          </p>
        </div>

        <!-- Hover Glow -->
        <div class="absolute inset-0 rounded-2xl ring-1 ring-white/10 group-hover:ring-blue-400/50 transition"></div>

      </div>

    </div>

  </div>
</div>
</template>

<script setup>
definePageMeta({
  layout: 'custom',
  middleware: ['auth', 'adminmanager']
})

import { useRouter } from 'vue-router'

const router = useRouter()


const departmentsStore = useDepartmentStore()

const departments= computed(() => departmentsStore.state.departments)


const fetchDepartments = () => {
  departmentsStore.fetchDepartments(null, {department_status: 1})

}


//get the current user
const authStore = useAuthStore()
authStore.fetchTokenFromLocalStore() 
const currentUser = authStore.state.user 




const config = useRuntimeConfig()
const apiUrl = config.public.apiUrl


//SALES i WILL ROUTE IT TO '/' TEMPORARILY, BUT I WILL CHANGE IT TO '/sales' LATER ONCE I CREATE THE SALES PAGE
const selectDepartment = (dept) => {


  // Sales goes to root, everything else follows convention
  const targetRoute = dept.code === 'sales'
    ? '/'
    : `/${dept.code}`

  router.push(targetRoute)
}


 const logout = () => {
          const confirmation = window.confirm("Are you sure you want to logout?");
          if (!confirmation) {
                    return; // Exit if the user cancels the deletion
          }
          localStorage.removeItem('jwt')
          
          router.push('/login')
          location.reload()
        
      }

onMounted(() => {
  fetchDepartments()
})


</script>