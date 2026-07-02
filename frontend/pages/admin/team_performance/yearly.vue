pages/admin/agent_performance/monthly.vue<template>
    <!-- <div class="p-4 bg-gradient-to-r from-blue-50 to-blue-100 min-h-screen  mt-20"> -->
    <div class="mt-20 p-4">
         <!-- Loading Spinner -->

   
    <div v-if="leaderBoardStore.state.loading">
      <spinner></spinner>
    </div>
      <h1 class="text-2xl font-extrabold text-gray-800 mb-3 text-center">Team Yearly Performance  Information</h1>
     <div v-if="leaderBoardStore.state.leaderboard.length === 0"  class="text-red-700 font-bold  text-2xl">
       No Available Data.
     </div>
     
      <!-- Agents Table -->
      <div v-else class="overflow-x-auto shadow-xl rounded-lg">
     
        <table class="w-full table-auto border-collapse bg-white">
          <thead>
            <tr class="bg-gradient-to-r from-blue-200 to-blue-300 text-gray-800">
              <th class="py-2 px-2  border text-center text-xs font-bold ">Team Name</th>
               <th class="py-2 px-2  border text-center text-xs font-bold ">Manager</th>
              <!-- <th class="py-2 px-2 border text-center text-xs font-bold ">Month</th> -->
              <th class="py-2 px-2 border text-center text-xs font-bold ">Year</th>
              <th class="py-2 px-2  border text-center text-xs font-bold ">Rating</th>
              <th class="py-2 px-2  border text-center text-xs font-bold ">Rating Name</th>
              <th class="py-2 px-2  border text-center text-xs font-bold ">Image</th>
              <th class="py-2 px-2 border text-center text-xs font-bold ">Details</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="agent in paginatedAgents"
              :key="agent.id"
              class="even:bg-blue-50 odd:bg-white"
            >
              <td class="py-1 px-2 border text-center text-xs text-gray-700">
                {{ agent.team_name }}
              </td>
              <td class="py-1 px-2 border text-center text-xs text-gray-700">
                {{ agent.team_leader_name }}
              </td>
<!--                                            
              <td class="py-1 px-2 border text-center text-xs text-gray-700">
                {{ agent.month }}
              </td> -->
              <td class="py-1 px-2 border text-center text-xs text-gray-700">
                {{ agent.year }}
              </td> 
              <td class="py-1 px-2 border text-center text-xs text-gray-700 font-bold" :class="setRatingColor(agent)">
                {{ agent.final_ratings }}
              </td>  
              <td class="py-1 px-2 border text-center text-xs text-gray-700 font-bold" :class="setRatingNameColor(agent)">
                {{ agent.ratings_name }}
              </td>                                       
              <td class="py-1 px-2 border text-center text-xs">
                <img
                  :src="updateImageLink(agent.team_image)"
                  alt="Agent Image"
                  class="h-10 w-12 rounded-full mx-auto border border-blue-200"
                />
              </td>
              <td class="py-0.5 px-2 border text-center text-xs">
                <div class="flex justify-center space-x-2" v-if="parseFloat(agent.final_ratings) > 0">
                  <NuxtLink 
                    @click.prevent="SelectedTeamMembers(agent)"
                    class="px-2 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600  disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Team Year Performance Details
                  </NuxtLink>


                </div>
                 <span v-else class="text-red-500 font-bold">NO  Team Yearly Performance Details</span>
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
    middleware: ['auth', 'adminmanager']
  })
  
  import { ref, computed } from 'vue';
  import { onMounted } from 'vue';
  import { parse } from 'vue/compiler-sfc';
  import { setRatingNameColor, setRatingColor } from '@/utils/constants'
  
  //get the current user
  const authStore = useAuthStore()
  authStore.fetchTokenFromLocalStore()
  
  const currentUser = authStore.state.user 

  const router = useRouter()
  const route = useRoute()

  const year_summary = true
  const leaderboardOption = 'team'
  
  
  const leaderBoardStore = useLeaderBoardStore()
  const dataStorage = useDataStore()

   dataStorage.state.team_members_monthly = []
  

  // Method to fetch leaderboard data
const leaderBoardData = (leaderboardOption,query, year_summary) => {
  leaderBoardStore.fetchLeaderboard(leaderboardOption,query, year_summary);
};

  const itemsPerPage = 10;
  const currentPage = ref(1);

  
//   const agents = computed(() => manageSalesAgentStore.state.salesAgents);

  const agents = computed(() => leaderBoardStore.state.leaderboard);

  // const teamMember = computed(() => dataStorage.state.team_members_monthly)
 
  const totalPages = computed(() =>
    Math.ceil(agents.value.length / itemsPerPage)
  )
  
  const paginatedAgents = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return agents.value.slice(start, end);
  });

  //get image url from the .env file
  const config = useRuntimeConfig()

  const updateImageLink = (imageLink) => {
        return `${config.public.imageBaseUrl}${imageLink}`
  }

  const SelectedTeamMembers = (team) => {
   
     navigateTo({path:'/team_performance/year', query: {team_id: team.team_id, year: team.year, leaderboardOption: 'team' }})
  
  }


  onMounted(() => {

    leaderBoardData(leaderboardOption, route.query, year_summary)

  });


  watch(route, (newRoute) => {
  console.log('The route is change. we should react to the change..')
  router.push(newRoute.fullPath)
  leaderBoardData(leaderboardOption, newRoute.query, year_summary)
  
})
  
  
  </script>
  