<template>
  <div class="grid grid-cols-1 gap-4 p-4 mt-20">

    <div v-if="dashBoardStore.state.loading">
      
        <spinner></spinner>
    </div>
    <div v-else>

      <div v-if=" currentUser.login_type == 'standarduser' && data?.length > 0">
              
        <p class="text-gray-800 font-bold text-3xl mb-2 text-center">Agent Yearly Target</p>
               
        <table class="w-full table-auto border-collapse bg-white">
          <thead>
            <tr class="bg-gradient-to-r from-blue-200 to-blue-300 text-gray-800">
              <th class="py-2 px-2  border text-center text-medium font-bold ">ID</th>
              <th class="py-2 px-2  border text-center text-medium font-bold ">Name</th>
                <th class="py-2 px-2  border text-center text-medium font-bold ">Employee Status</th>
               <!-- <th class="py-2 px-2  border text-center text-medium font-bold ">Market</th> -->
               <!-- <th class="py-2 px-2  border text-center text-medium font-bold ">Team</th>
              <th class="py-2 px-2  border text-center text-medium font-bold ">Month</th> -->
              <th class="py-2 px-2  border text-center text-medium font-bold ">Year</th>
              <th class="py-2 px-2  border text-center text-medium font-bold ">Target</th>
              <th class="py-2 px-2  border text-center text-medium font-bold ">Shipok</th>
              <th class="py-2 px-2  border text-center text-medium font-bold ">Percentage(%)</th>
              <th class="py-2 px-2  border text-center text-medium font-bold ">Remaining Units</th>


            </tr>
          </thead>
          <tbody>
            <tr
              v-for="agent in paginatedAgents"
              :key="agent.id"
              class="even:bg-blue-50 odd:bg-white"
            >
              <td class="py-1 px-2 border text-center text-medium text-gray-700">
                {{ agent.id }}
              </td>

              <td class="py-1 px-2 border text-center text-medium text-gray-700">
                  <div class="flex items-center space-x-2">
                            <img
                            v-if="agent && agent.image_link"
                            :src="updateImageLink(agent.image_link)"
                            alt="Agent Image"
                            class="w-9 h-9 rounded-full object-cover shadow"
                            />
                            <span >{{ agent.db_name }}</span>
                  </div>
              </td>
              <td class="py-1 px-2 border text-center text-medium text-gray-700"
                :class="{
                          'text-red-600 font-bold': agent.employee_status === 'Resigned',
                          'text-green-600 font-bold': agent.employee_status === 'Hired' || agent.employee_status === 'Rehired'
                        }"
              >
                {{ agent.employee_status }}
              </td>              

              <td class="py-1 px-2 border text-center text-medium text-gray-700">
                {{ agent.year }}
              </td>               

              <td class="py-1 px-2 border text-center text-medium text-gray-700 font-bold">
                {{ agent.target }}
              </td>  
              <td class="py-1 px-2 border text-center text-medium text-gray-700 font-bold">
                {{ agent.shipok }}
              </td>
              <td class="py-1 px-2 border text-center text-medium text-gray-700 font-bold">
                 {{ getWholeNumberPercentage(agent.target, agent.shipok) }}
              </td>  

              <td class="py-1 px-2 border text-center text-medium text-gray-700 font-bold"
              :class="(agent.target - agent.shipok) >= 0 ? 'text-red-600 border' : 'text-green-600'"
              >
                   {{ agent.target - agent.shipok }}
              </td> 

  

            </tr>
          </tbody>
        </table>  
        
          <!-- Pagination -->
          <div v-if="totalPages > 1" class="mt-4 flex justify-center space-x-4 mb-4">
            <button
              v-for="page in totalPages"
              :key="page"
              class="px-4 py-2 border rounded"
              :class="{
                'bg-blue-500 text-white': currentPage === page,
                'bg-white text-gray-700': currentPage !== page,
              }"
              @click="currentPage = page"
            >
              {{ page }}
            </button>
          </div>        
        </div>
   
            <div v-else>No dashboard or undefined</div>
            <!-- <p class="text-gray-800 font-bold text-4xl mt-5 mb-5 pt-10">New Deposit <span class="text-red-600">({{ trucks }})</span> as of: <span class="text-red-600">( {{ month }} {{ year }})</span></p>
            <div  class="bg-white shadow-md rounded-lg p-4 border border-gray-200">
                <h2 class=" uppercase text-2xl font-semibold text-gray-800 mb-4">All Market</h2>
                <div class="grid grid-cols-1 gap-4">
                    <div class="bg-orange-100 p-6 rounded-lg shadow flex flex-col items-center justify-center h-32">
                    <p class="text-gray-800 font-bold text-7xl">{{ dataOverallDeposit.new_deposit }}</p>
                    <p class="text-gray-600 font-medium text-lg">New Deposit(account)</p>
                    </div>
          
            
                </div>
            </div>               -->
   </div>

    
  </div>
</template>


<script setup>
definePageMeta({
  middleware: ['auth', 'adminmanager']
})

import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { months, getWholeNumberPercentage } from '@/utils/constants'

const authStore = useAuthStore()
authStore.fetchTokenFromLocalStore()

const router = useRouter()
const route = useRoute()
const currentUser = authStore.state.user


  const itemsPerPage = 10;
  const currentPage = ref(1);

  route.query.dashboardoption = 'individual'
  route.query.year_summary = true



// Stores
const dashBoardStore = useDashBoardStore()
const data = computed(() => dashBoardStore.state.dashboard.data)


  const totalPages = computed(() =>
    Math.ceil(data.value.length / itemsPerPage)
  )
  
  const paginatedAgents = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return data.value?.slice(start, end);
  });




const fetchDashboardData = async (query) => {

  await dashBoardStore.fetchDashboard(route.query)
}

  //get image url from the .env file
  const config = useRuntimeConfig()

  const updateImageLink = (imageLink) => {
        return `${config.public.imageBaseUrl}${imageLink}`
  }


onMounted(() => {

 fetchDashboardData(route.query)

})


watch(route, (newRoute) => {
   
    fetchDashboardData(newRoute.query) 
  
})

const rowClass = computed(() => {
  return (item, index) => {
    return index % 2 === 0
      ? "bg-white text-green-800 font-bold"
      : "bg-green-100 text-green-800 font-bold"
  }
})
</script>



<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>