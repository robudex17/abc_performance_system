<template>
    <div>
    <div class="p-4 mt-20">
      <!-- Loading Spinner -->
     
      <div v-if="leaderBoardStore.state.loading">
        <spinner></spinner>
      </div>
      
      <!-- Leaderboard View -->
      <div v-else>
            <!-- Toggle Button for Card/Table View -->
        <div class="mb-4 flex justify-end">
          <button v-if="!isAdmin"
            @click="toggleView" 
            class="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition duration-300"
          >
          <font-awesome-icon :icon="['fas', isCardView ? 'toggle-off' : 'toggle-on']" />
            Toggle to {{ isCardView ? 'Table' : 'Card' }} View
          </button>
          <export-to-excel-component  v-if="isAdmin" class="ml-2"
            :exportUrl="exportUrl"
            :exportFileName="exportFileName"
            :query="query"
            :token="token"
            :submitted="agent.submitted"
        ></export-to-excel-component>          
        </div>
        
        <div class="text-red-700 font-bold  text-5xl" v-if="leaderBoardStore.state.error">{{ leaderBoardStore.state.error }}</div>
        <div v-else-if=" !agent" class="text-red-700 font-bold  text-5xl">
          No Available Data.
        </div>
        <div v-else>
          <!-- CARD VIEW -->
          <div v-if="isCardView" class="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 gap-6">
            <div
           
            class="bg-gray-800 text-white border rounded-lg shadow-lg overflow-hidden"
          >
            <div class="flex flex-col items-center p-4">
              <img
                v-if="agent.image_link"
                :src="agent.image_link"
                alt="Agent Image"
                class="w-20 h-20 rounded-full object-cover mb-4"
              />
              <div v-else class="w-20 h-20 bg-gray-300 rounded-full mb-4 flex items-center justify-center text-white">
                <span class="text-xl">{{ agent?.db_name }}</span>
              </div>
              <div class="text-center">
                <h3 class="text-lg font-semibold">{{ agent.db_name }}</h3>
                <p class="text-sm  font-bold" :class="setRatingNameColor(agent)" >{{ agent.ratings_name }}</p>
  
                <div class="flex items-center mt-2">
                  <template v-for="i in 5" :key="i">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      :class="getStarClass(agent.final_ratings, i)"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                  </template>
                </div>
  
                <p class="text-xl font-bold mt-2">{{ agent.final_ratings }}</p>
                <p class="text-xl font-bold mt-2">{{ agent.month }}</p>
                <p class="text-xl font-bold mt-2">{{ agent.year }}</p>
              </div>
              <button
                @click="showAgentDetails(agent)"
                class="text-green-300 hover:text-green-500 font-semibold hover:underline hover:scale-105 transition duration-300"
              >
                Performance Details
              </button>
            </div>
          </div>
          </div>
                <!-- Table View -->
        <div v-else class="overflow-x-auto shadow-xl rounded-lg">
          <!-- <h1 class="text-2xl font-bold mb-4 text-center">Performance Monthy Summary </h1> -->
          <h1 class="text-2xl font-bold mb-2 text-center"> {{agent.month}} {{agent.year}} Monthly Performance: <span :class="setRatingNameColor(agent)">{{ agent.final_ratings }}</span> / <span :class="setRatingNameColor(agent)">{{ agent.ratings_name }}</span> </h1>
          <leader-board-table-view :agents="[agent]"></leader-board-table-view>
          <!-- <agentDetails class="p-4 mt-5" :fullyear="false"/> -->
          <sales-metrcis-summary
           :agents="[agent]"
          ></sales-metrcis-summary>
      </div>
        </div>
      </div>
    </div>
  
  <!-- Modal for Agent Details -->
  <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div class="bg-gray-800 text-white p-6 rounded-lg w-full md:w-2/3 lg:w-1/2 xl:w-1/3 h-auto overflow-auto">
      <div class="flex flex-col items-center">
      
        <img
          v-if="selectedAgent && selectedAgent.image_link"
          :src="selectedAgent.image_link"
          alt="Agent Image"
          class="w-40 h-40 rounded-full object-cover mb-4"
        />
        <div v-else class="w-40 h-40 bg-gray-300 rounded-full mb-4 flex items-center justify-center text-white">
          <span class="text-4xl">{{ selectedAgent ? selectedAgent.db_name : '' }}</span>
        </div>
        <div class="text-center">
          <h3 class="text-3xl font-semibold">{{ selectedAgent ? selectedAgent.db_name : 'No agent selected' }}</h3>
          <h3 class="text-xl font-semibold">AgentID: {{ selectedAgent ? selectedAgent.id : 'Agent has no ID' }}</h3>
          <p class="text-lg  font-bold" :class="setRatingNameColor(selectedAgent)">{{ selectedAgent ? selectedAgent.ratings_name : '' }}</p>

          <div class="flex items-center mt-2">
            <template v-for="i in 5" :key="i">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                :class="getStarClass(selectedAgent ? selectedAgent.final_ratings : 0, i)"
                width="35"
                height="30"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
            </template>
          </div>

          <p class="text-3xl font-bold mt-2">{{ selectedAgent ? selectedAgent.final_ratings : '' }}</p>
         
        </div>
        <p class="text-lg font-bold mt-2">Month Of: {{ selectedAgent ? selectedAgent.month : '' }}</p>
        <p class="text-lg font-bold mt-2">Year: {{ selectedAgent ? selectedAgent.year : '' }}</p>
        <div class="mt-6 w-full overflow-x-auto">
           <table class="min-w-full table-auto">
            <thead>
              <tr>
                <th class="px-4 py-2 border bg-gray-800 text-white text-lef">Employee Status</th>
                <th class="px-4 py-2 border bg-gray-800 text-white text-lef">Market</th>
                <th class="px-4 py-2 border bg-gray-800 text-white text-lef">Team</th>
              </tr>
            </thead>
            <tbody>
                 <td class="px-4 py-2 font-semibold border text-center bg-gray-900"><span :class="selectedAgent.employee_status=== 'Hired' ? 'text-green-500 font-bold' : 'text-red-500 font-bold' ">{{ selectedAgent ? selectedAgent.employee_status : '' }}</span></td> 
               <td class="px-4 py-2 font-semibold border bg-gray-900 text-gray-100 text-center">{{ selectedAgent ? selectedAgent.market_name.toUpperCase() : '' }}</td> 
               <td class="px-4 py-2 font-semibold border bg-gray-900 text-gray-100 text-center">{{ selectedAgent ? selectedAgent.team_name.toUpperCase() : '' }}</td>
            </tbody>
          </table>

            
        </div>
        <!-- Table for Additional Information -->
        <div class="mt-6 w-full overflow-x-auto">
          <table class="min-w-full table-auto">
            <thead>
              <tr>
                <th class="px-4 py-2 border bg-gray-800 text-white text-lef">Metric</th>
                <th class="px-4 py-2 border bg-gray-800 text-white text-lef">Score</th>
                <th class="px-4 py-2 border bg-gray-800 text-white text-lef">Rating</th>
              </tr>
            </thead>
            <tbody>

              <tr v-if="selectedAgent">
                
                <td class="px-4 py-2 font-semibold border bg-gray-900 text-gray-100">Performance(80%)</td>
                <td class="px-4 py-2 font-semibold border bg-gray-900 text-gray-100 text-center">{{ selectedAgent.shipok_score }}</td>
                <td class="px-4 py-2 font-semibold border bg-gray-900 text-gray-100 text-center">{{ selectedAgent.performance_rating }}</td>
              </tr>

              <tr v-if="selectedAgent">
                <td class="px-4 py-2 font-semibold border bg-gray-900 text-gray-100">
                  Absence (5%)
                </td>

                <td
                  v-for="(value, index) in [selectedAgent.absence_score, selectedAgent.absence_rating]"
                  :key="index"
                  class="px-4 py-2 font-semibold border bg-gray-900 text-center"
                  :class="selectedAgent.submitted == 1 ? 'text-gray-100' : 'text-red-400'"
                >
                  {{ selectedAgent.submitted == 1 ? value : 'NO DATA' }}
                </td>
              </tr>
              <tr v-if="selectedAgent">
                <td class="px-4 py-2 font-semibold border bg-gray-900 text-gray-100">
                  Tardiness (5%)
                </td>
                <td
                  v-for="(value, index) in [selectedAgent.tardiness_score, selectedAgent.tardiness_rating]"
                  :key="index"
                  class="px-4 py-2 font-semibold border bg-gray-900 text-center"
                  :class="selectedAgent.submitted == 1 ? 'text-gray-100' : 'text-red-400'"
                >
                  {{ selectedAgent.submitted == 1 ? value : 'NO DATA' }}
                </td>
              </tr>

              <tr v-if="selectedAgent">
                <td class="px-4 py-2 font-semibold border bg-gray-900 text-gray-100">
                  Memo (5%)
                </td>
                <td
                  v-for="(value, index) in [selectedAgent.memo_score, selectedAgent.memo_rating]"
                  :key="index"
                  class="px-4 py-2 font-semibold border bg-gray-900 text-center"
                  :class="selectedAgent.submitted == 1 ? 'text-gray-100' : 'text-red-400'"
                >
                  {{ selectedAgent.submitted == 1 ? value : 'NO DATA' }}
                </td>
              </tr>

              <tr v-if="selectedAgent">
                <td class="px-4 py-2 font-semibold border bg-gray-900 text-gray-100">
                  Feedback (5%)
                </td>
                <td
                  v-for="(value, index) in [selectedAgent.feedback_score, selectedAgent.feedback_rating]"
                  :key="index"
                  class="px-4 py-2 font-semibold border bg-gray-900 text-center"
                  :class="selectedAgent.submitted == 1 ? 'text-gray-100' : 'text-red-400'"
                >
                  {{ selectedAgent.submitted == 1 ? value : 'NO DATA' }}
                </td>
              </tr>

            <tr v-if="selectedAgent">
               <td class="px-4 py-2 font-semibold border bg-gray-900 text-gray-100">New Deposit(10%)</td> 
               <td class="px-4 py-2 font-semibold border bg-gray-900 text-gray-100 text-center">{{ selectedAgent.deposit_score }}</td> 
               <td class="px-4 py-2 font-semibold border bg-gray-900 text-gray-100 text-center">{{ selectedAgent.additional_points }}</td>
            </tr>

            <tr v-if="selectedAgent && selectedAgent.deduction > 0">
               <td class="px-4 py-2 font-bold border bg-gray-900 text-red-500">Deduction</td> 
               <td class="px-4 py-2 font-bold border bg-gray-900 text-red-500 text-center">0</td> 
               <td class="px-4 py-2 font-bold border bg-gray-900 text-red-500 text-center">{{ selectedAgent.deduction }}</td>
            </tr>


            </tbody>
          </table>
          <table class="min-w-full table-auto mt-6">
            <thead>
              <tr>
                <th class="px-4 py-2 border bg-gray-800 text-white text-lef">Target(Unit)</th>
                <th class="px-4 py-2 border bg-gray-800 text-white text-lef">ShipOk(Unit)</th>
                <th class="px-4 py-2 border bg-gray-800 text-white text-lef">Percentage(%)</th>

              </tr>
            </thead>
            <tbody>
              <tr v-if="selectedAgent">
                <td class="px-4 py-2 font-bold border bg-gray-900 text-green-500 text-center">{{ selectedAgent.target }}</td>
                <td class="px-4 py-2 font-bold border bg-gray-900 text-green-500 text-center">{{ selectedAgent.shipok }}</td>
                <td class="px-4 py-2 font-bold border bg-gray-900 text-green-500 text-center">{{ selectedAgent.shipok_percent }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <button
          @click="closeModal"
          class="mt-6 text-blue-300 hover:text-blue-500 font-semibold hover:underline hover:scale-105 transition duration-300"
        >
          Close
        </button>
      </div>
    </div>
  </div>  
    </div>
  </template>
  
  <script setup>
  import { useLeaderBoardStore } from '../stores/sales_leaderboard';
  import { onMounted, reactive,ref, watch } from 'vue';

  import API from '~/utils/api'
   import { months, getStarClass } from '@/utils/constants'

  
  definePageMeta({
    middleware: ['auth'] 
  })
  
  //get the current user
  const authStore = useAuthStore()
  authStore.fetchTokenFromLocalStore()
  
  const currentUser = authStore.state.user 
  const token = authStore.state.token
  const isAdmin = ref(false) 

  //  import AgentDetails from '../../pages/admin/agent/[agent_id]/details.vue'

  const config = useRuntimeConfig()


  const leaderBoardStore = useLeaderBoardStore();
  const selectedAgent = reactive({});
  const showModal = ref(false);
  const isCardView = ref(true)
  const query = ref({})

  if (currentUser.role == 'poweruser' || currentUser.role == 'admin'){
    isAdmin.value = true
    isCardView.value = false
  }

  
  const route = useRoute()
  const router = useRouter()
  
  const { setRatingNameColor } = useRatingColor()
  
  query.value = route.query 

  const exportUrl = API.export.agent_peformance
  // const leaderboardOption = 'agent'

  const exportFileName = computed(()=> {
  return `${agent.value.db_name}-monthly-performance-${query.value.month}-${query.value.year}.xlsx`
})


  // if the user is standuser and it is admin It will use the agentId for the query (query.agent_id) so that able view all agent performance details
  // in the case of salesagent user,  which he/she can view only his/her performance details agentId is equal to currentUser login_id
  let agentId;
   if (query.value.agent_id) {
    if ( (currentUser.role == 'poweruser')  || (currentUser.role == 'admin')  || (currentUser.login_type='salesagentuser' && currentUser.agent_type == 2 ) || (currentUser.login_type='salesagentuser' && currentUser.agent_type == 1 )){
       agentId = query.value.agent_id
       
    }else{
       agentId = currentUser.id
       query.value.agent_id = agentId
    }
  }else {
    agentId = currentUser.login_id
    query.value.agent_id = agentId
  }

  

  const agent = computed(() => {
    const foundAgent = leaderBoardStore.state.leaderboard.find(agent => agent.id == agentId)
    if(foundAgent){
        return foundAgent
    }else{
        return { target: 0}
    }
  })


  // Method to fetch leaderboard data
  const leaderBoardData = async( all,query) => {
    await leaderBoardStore.fetchLeaderboard(false,query);
  };
  
  // Show the details of the selected agent
  const showAgentDetails = (agent) => {
    // selectedAgent.value = agent;
    Object.assign(selectedAgent, agent);
    showModal.value = true; // Show the modal
  };
  
  // Close the modal
  const closeModal = () => {
    showModal.value = false; // Hide the modal
  };
  
  //Toggle the view mode between card and table
  
  const  toggleView = () => {
    isCardView.value = !isCardView.value
  }
  
  //watch for the route change
  
  watch(route, (newRoute) => {
    console.log('The route is change. we should react to the change..')
    router.push(newRoute.fullPath)
    // newRoute.query.agent_id = agentId
    leaderBoardData(false,newRoute.query)
   
    query.value = newRoute.query
  })
  
  
  
  // Fetch leaderboard data on mount
  onMounted( async() => {
    await leaderBoardData(false,query.value);
    
  });
    

  </script>
  
  <style scoped>
  /* Modal container adjustments */
  @media (min-width: 768px) {
    .modal {
      width: 75%;
    }
  }
  
  @media (min-width: 1024px) {
    .modal {
      width: 50%;
    }
  }
  
  /* Modal content */
  .bg-gray-800 {
    max-height: 80vh; /* Set the maximum height to 80% of the viewport height */
    overflow-y: auto;  /* Allow vertical scrolling if content exceeds max height */
  }
  
  
  </style>