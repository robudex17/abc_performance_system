<template>
    <!-- <div class="p-4 bg-gradient-to-r from-blue-50 to-blue-100 min-h-screen  mt-20"> -->
    <div class="mt-20 p-4">
         <!-- Loading Spinner -->
    <div v-if="leaderBoardStore.state.loading">
      <spinner></spinner>
    </div>
     
     <div v-if="leaderBoardStore.state.leaderboard.length === 0"  class="text-red-700 font-bold  text-2xl">
       No Available Data.
     </div>
     
      <!-- Agents Table -->
      <div v-else-if="currentUser.login_type == 'standarduser' || currentUser.agent_type == 2 || currentUser.agent_type == 1"   class="overflow-x-auto shadow-xl rounded-lg">
         <!-- <export-to-excel-component  v-if=" isAdmin  && agents.length > 0" 
         :exportUrl="exportUrl"
         :exportFileName="exportFileName"
         :query="route.query"
         :token="token"
        ></export-to-excel-component>        -->
        <h1 class="text-2xl font-extrabold text-gray-800 mb-3 text-center">Sales Agents Monthly Performance  Information</h1>
        <table class="w-full table-auto border-collapse bg-white">
          <thead>
            <tr class="bg-gradient-to-r from-blue-200 to-blue-300 text-gray-800">
              <th class="py-2 px-2  border text-center text-xs font-bold ">ID</th>
              <th class="py-2 px-2  border text-center text-xs font-bold ">Name</th>
              <th class="py-2 px-2  border text-center text-xs font-bold ">Employee Status</th>
              <th class="py-2 px-2  border text-center text-xs font-bold ">Position</th>
               <th class="py-2 px-2  border text-center text-xs font-bold ">Manager</th>
               <th class="py-2 px-2  border text-center text-xs font-bold ">Market</th>
               <th class="py-2 px-2  border text-center text-xs font-bold ">Team</th>
              <th class="py-2 px-2 border text-center text-xs font-bold ">Month</th>
              <th class="py-2 px-2 border text-center text-xs font-bold ">Year</th>
              <th class="py-2 px-2  border text-center text-xs font-bold ">Rating</th>
              <th class="py-2 px-2  border text-center text-xs font-bold ">Rating Name</th>
              <th class="py-2 px-2  border text-center text-xs font-bold ">Image</th>
              <th class="py-2 px-2 border text-center text-xs font-bold whitespace-nowrap min-w-[120px]">
                <div class="flex items-center justify-center gap-2">
                  <span>Details</span>

                  <div class="flex-shrink-0">
                    <export-to-excel-component
                      v-if="isAdmin && agents.length > 0"
                      :exportUrl="exportUrl"
                      :exportFileName="exportFileName"
                      :query="query"
                      :token="token"
                      :incomplete="incomplete"
                      class=" !text-white !text-[10px] !px-2 !py-1 !rounded !hover:bg-green-600 !transition-all !duration-200"
                    >
                    </export-to-excel-component>
                  </div>
                </div>
              </th>

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
              <td class="py-1 px-2 border text-center text-xs text-gray-700"
              :class="agent.employee_status == 'Hired' || agent.employee_status=='Rehired' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'"
              >
                {{ agent.employee_status }}
              </td>     
              <td class="py-1 px-2 border text-center text-xs text-gray-700">
                {{ agent.agent_role }}
              </td>  
              <td class="py-1 px-2 border text-center text-xs text-gray-700">
                {{ agent.manager_dbname }}
              </td>               
              <td class="py-1 px-2 border text-center text-xs text-gray-700">
                {{ agent.market_name }}
              </td> 
              <td class="py-1 px-2 border text-center text-xs text-gray-700">
                {{ agent?.team_name }}
              </td>                                                  
              <td class="py-1 px-2 border text-center text-xs text-gray-700">
                {{ agent.month }}
              </td>
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
                  :src="updateImageLink(agent.image_link)"
                  alt="Agent Image"
                  class="h-10 w-12 rounded-full mx-auto border border-blue-200"
                />
              </td>
              <td class="py-0.5 px-2 border text-center text-xs">
                <div class="flex justify-center space-x-2" v-if="parseFloat(agent.final_ratings) > 0">
                  <NuxtLink 
                    :to="{
                      path: `/agent_performance/month`, query: { agent_type: agent.agent_type, agent_id: agent.id, month:agent.month, year:agent.year, withTrucks: true}
                      
                    }"
                    class="px-2 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600  disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Monthly Performance Details
                  </NuxtLink>


                </div>
                 <span v-else class="text-red-500 font-bold">NO  Monthly Performance Details</span>
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
      <!-- <div v-else-if="currentUser.agent_type == 1" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <div
              v-for="(agent, index) in leaderBoardStore.state.leaderboard"
              :key="index"
              class="bg-gray-800 text-white border rounded-lg shadow-lg overflow-hidden"
            >
              <div class="flex flex-col items-center p-4">
                  <div
                    class="px-3 py-1 m-2 text-xl font-semibold"
                    :class="agent.tag ? 'px-4 py-1 text-sm font-bold uppercase tracking-widest bg-purple-600/20 text-purple-400 rounded-full border border-purple-500' : 'py-5'"
                  >
                    {{ agent.tag }}
                </div>
                <img
                  v-if="agent.image_link"
                  :src="updateImageLink(agent.image_link)"
                  alt="Agent Image"
                  class="w-20 h-20 rounded-full object-cover mb-4"
                />
                <div v-else class="w-20 h-20 bg-gray-300 rounded-full mb-4 flex items-center justify-center text-white">
                  <span class="text-xl">{{ agent.db_name }}</span>
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
      </div> -->


  <!-- Modal for Agent Details -->
  <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div class="bg-gray-800 text-white p-6 rounded-lg w-full md:w-2/3 lg:w-1/2 xl:w-1/3 h-auto overflow-auto">
      <div class="flex flex-col items-center">
      
        <img
          v-if="selectedAgent && selectedAgent.image_link"
          :src="updateImageLink(selectedAgent.image_link)"
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
               <td class="px-4 py-2 font-bold border bg-gray-900 text-red-500 text-center"
               
               >{{ selectedAgent.deduction }}</td>
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
  
  definePageMeta({
    middleware: ['auth', 'manager']
  })
  
  import { ref, computed } from 'vue';
  import { onMounted } from 'vue';

 import API from '~/utils/api'
  import { months, getStarClass, setRatingColor, setRatingNameColor} from '@/utils/constants'
  
  //get the current user
  const authStore = useAuthStore()
  authStore.fetchTokenFromLocalStore()
  
  const currentUser = authStore.state.user 
  const token = authStore.state.token
  const showModal = ref(false)

  const router = useRouter()
  const route = useRoute()

   const query = ref({})
   const selectedAgent = reactive({});

  
  const year_summary = false
  const leaderboardOption = 'all'
  const isAdmin = ref(false)
  const month = ref("")
  const year = ref("")
  const isCardView = ref(true)
  

  const leaderBoardStore = useLeaderBoardStore()
  

  // Method to fetch leaderboard data
const leaderBoardData = (leaderboardOption, query, year_summary) => {
  leaderBoardStore.fetchLeaderboard(leaderboardOption, query, year_summary);
};

  const itemsPerPage = 10;
  const currentPage = ref(1);

  
//   const agents = computed(() => manageSalesAgentStore.state.salesAgents);

  const agents = computed(() => leaderBoardStore.state.leaderboard);



  const incomplete = computed(() => {
     // true = has unsubmitted agents
     return agents.value.some(agent => agent.submitted === 0)
   })



   // Show the details of the selected agent
const showAgentDetails = (agent) => {
  

      switch(currentUser.agent_type){ 
      case 0:
         if(currentUser.login_id !== agent.id){
            alert('You are not allowed to view other agents details. Please contact your administrator.')
            showModal.value = false
            return;
         } else {
            Object.assign(selectedAgent, agent);
            showModal.value = true; // Show the modal
         }
        break;
      case 1:
        if(currentUser.team_id !== agent.team_id){
            alert('You are not allowed to view other teams agents details. Please contact your administrator.')
            return;
         } else {
            Object.assign(selectedAgent, agent);
            showModal.value = true; // Show the modal
         }
        break;
      default:
          Object.assign(selectedAgent, agent);
          showModal.value = true; // Show the modal
          break;
    }

    


};


// Close the modal
const closeModal = () => {
  showModal.value = false; // Hide the modal
};

//Toggle the view mode between card and table

const  toggleView = () => {
  if(currentUser.login_type !== 'standarduser' && currentUser.agent_type !== 2){
    alert('Not Allowed to shift views')
    return
  }
  isCardView.value = !isCardView.value
}


 
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

  const exportUrl = API.export.leaderboard

  month.value = route.query.month ||  months[new Date().getMonth()]
  year.value = route.query.year ||  new Date().getFullYear()
  
  route.query.leaderboardOption = 'all'

  query.value = route.query



if (currentUser.role == 'poweruser' || currentUser.role == 'admin'){
    isAdmin.value = true
   
  }


const exportFileName = computed(()=> {
  return `agents-${month.value}-${year.value}-performance.xlsx`
})



  onMounted(() => {

    leaderBoardData(leaderboardOption,route.query, year_summary)

  });


watch(route, (newRoute) => {
  console.log('Route changed, updating leaderboard data...')
  
  const newQuery = { ...newRoute.query, leaderboardOption: 'all' }

  leaderBoardData(leaderboardOption, newQuery, year_summary)
  month.value = newQuery.month
  year.value = newQuery.year
  query.value = newQuery
})



  
  </script>
  