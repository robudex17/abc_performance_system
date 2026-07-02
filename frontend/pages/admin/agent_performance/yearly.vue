<template>
  <!-- <div class="p-6 bg-gradient-to-r from-blue-50 to-blue-100 min-h-screen  mt-20"> -->
  <div class="mt-20  p-4">

       <!-- Loading Spinner -->
  <div v-if="leaderBoardStore.state.loading">
    <spinner></spinner>
  </div>
  
    <h1 class="text-2xl font-extrabold text-gray-800 mb-2 text-center">Sales Agents Yearly Performance  Information</h1>
   <div v-if="leaderBoardStore.state.leaderboard.length === 0"  class="text-red-700 font-bold  text-5xl">
     No Available Data.
   </div>
   
    <!-- Agents Table -->
    <div v-else class="overflow-x-auto shadow-xl rounded-lg">
      <table class="w-full table-auto border-collapse bg-white">
        <thead>
          <tr class="bg-gradient-to-r from-blue-200 to-blue-300 text-gray-800">
            <th class="py-2 px-1  border text-center text-xs font-bold">ID</th>
            <th class="py-2 px-1  border text-center text-xs font-bold">Name</th>
            <th class="py-2 px-1  border text-center text-xs font-bold">Year</th>
            <th class="py-2 px-1  border text-center text-xs font-bold">Target</th>
            <th class="py-2 px-1  border text-center text-xs font-bold">Shipok</th>
            <th class="py-2 px-1  border text-center text-xs font-bold">Percentage(%)</th>
            <th class="py-2 px-1  border text-center text-xs font-bold">Rating</th>
            <th class="py-2 px-1 border text-center text-xs font-bold">Rating Name</th>
            <th class="py-2 px-1 border text-center text-xs font-bold">Image</th>
             <div class="flex items-center justify-center gap-2">
                  <span>Details</span>

                  <div class="flex-shrink-0">
                    <export-to-excel-component
                      v-if="isAdmin && agents.length > 0"
                      :exportUrl="exportUrl"
                      :exportFileName="exportFileName"
                      :query="query"
                      :token="token"
                      class=" !text-white !text-[10px] !px-2 !py-1 !rounded !hover:bg-green-600 !transition-all !duration-200"
                    >
                    </export-to-excel-component>
                  </div>
              </div>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="agent in paginatedAgents"
            :key="agent.id"
            class="even:bg-blue-50 odd:bg-white"
          >
            <td class="py-1 px-2 border text-center text-xs text-gray-700">
              {{ agent.id }}
            </td>
            <td class="py-1 px-2 border text-center text-xs text-gray-700">
              {{ agent.db_name }}
            </td>

            <td class="py-1 px-2 border text-center text-xs text-gray-700">
              {{ agent.year }}
            </td> 
            <td class="py-1 px-2 border text-center text-xs text-gray-700">
              {{ agent.target }}
            </td> 
            <td class="py-1 px-2 border text-center text-xs text-gray-700">
              {{ agent.shipok }}
            </td> 
            <td class="py-1 px-2 border text-center text-xs text-gray-700 font-bold">
              {{ agent.shipok_percent }}
            </td>                         
            <td class="py-1 px-2 border text-center text-xs text-gray-700 font-bold " :class="setRatingColor(agent)">
              {{ agent.final_ratings }}
            </td>  
            <td class="py-1 px-2 border text-center text-xs text-gray-700 font-bold" :class="setRatingNameColor(agent)">
              {{ agent.ratings_name }}
            </td>                                       
            <td class="py-1 px-1 border text-center text-xs">
              <img
                :src="updateImageLink(agent.image_link)"
                alt="Agent Image"
                class="h-10 w-10 rounded-full mx-auto border border-blue-200"
              />
            </td>
            <td class="py-1 px-1 border text-center text-xs">
              <div v-if="parseFloat(agent.final_ratings) <= 0" class="flex justify-center space-x-2 text-red-500 font-bold" >NO  Yearly Performance Details</div>
              <div v-else class="flex justify-center" >
                <NuxtLink 
                  :to="{
                    path: `/agent_performance/year?`, query: { agent_type: agent.agent_type, fullyear: true , agent_id: agent.id, year:agent.year, withTrucks: true}
                    
                  }"
                  class="px-2 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600  disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Yearly Performance Details
                </NuxtLink>


              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="mt-4 flex justify-center space-x-4">
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
</template>

<script setup>

definePageMeta({
  middleware: ['auth', 'manager']
})

import { ref, computed } from 'vue';
import { onMounted } from 'vue';
import API from '~/utils/api'
import {  setRatingColor, setRatingNameColor} from '@/utils/constants'

//get the current user
const authStore = useAuthStore()
authStore.fetchTokenFromLocalStore()

const currentUser = authStore.state.user 
const token = authStore.state.token

const router = useRouter()
const route = useRoute()
const query = ref("")


// query.year_summary = true

const agentYear = ref([])
const leaderBoardStore = useLeaderBoardStore()


 const year_summary = true
 const isAdmin = ref(false)
 const leaderboardOption = 'all'
 const year = ref("")
 const exportUrl = API.export.leaderboardYearly



// Method to fetch leaderboard data
const leaderBoardData = async (leaderboardOption,query, year_summary) => {

  leaderBoardStore.fetchLeaderboard(leaderboardOption ,query, year_summary);
};

const itemsPerPage = 10;
const currentPage = ref(1);

 year.value = route.query.year ||  new Date().getFullYear()
 route.query.leaderboardOption = leaderboardOption

 query.value = route.query

const agents = computed(() => leaderBoardStore.state.leaderboard);

const totalPages = computed(() =>
  Math.ceil(agents.value.length / itemsPerPage)
)

const paginatedAgents = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return agents.value.slice(start, end);
});


if (currentUser.role == 'poweruser'  || currentUser.role == 'admin'){
    isAdmin.value = true
   
}

const exportFileName = computed(()=> {
  return `agents-${year.value}-yearly-performance.xlsx`
  
})


//get image url from the .env file
const config = useRuntimeConfig()

const updateImageLink = (imageLink) => {
        return `${config.public.imageBaseUrl}${imageLink}`
  }



 // Fetch leaderboard data on mount
 onMounted( async() => {
  
    await leaderBoardData(leaderboardOption,route.query, year_summary);
    
  })


watch(route, (newRoute) => {
  console.log('The route is change. we should react to the change..')
  year.value = newRoute.query.year
  newRoute.query.leaderboardOption = leaderboardOption
  query.value = newRoute.query
  router.push(newRoute.fullPath)
  leaderBoardData(leaderboardOption,newRoute.query, year_summary)

})


</script>
