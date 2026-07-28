<template>
  <div>
  <div class="p-4 mt-20">
    <!-- Loading Spinner -->
    <div v-if="leaderBoardStore.state.loading">
      <spinner></spinner>
    </div>

    <!-- Leaderboard View -->
   
    <div >
          <!-- Toggle Button for Card/Table View -->
      <div class="mb-4 flex justify-end">
        <button 
          @click="toggleView" 
          class="bg-blue-600 text-white py-1 px-2 rounded-lg hover:bg-blue-700 transition duration-300"
        >
        <font-awesome-icon :icon="['fas', isCardView ? 'toggle-off' : 'toggle-on']" />
          Toggle to {{ isCardView ? 'Table' : 'Card' }} View
        </button>
        <!-- <export-to-excel-component  v-if=" isAdmin && !isCardView && leaderBoardStore.state.leaderboard.length && leaderboardOption != 'team'" class="ml-2"
         :exportUrl="exportUrl"
         :exportFileName="exportFileName"
         :query="query"
         :token="token"
        ></export-to-excel-component> -->
      </div>
<!--       
      <div class="text-red-700 font-bold  text-5xl" v-if="leaderBoardStore.state.error">{{ leaderBoardStore.state.error }}</div> -->
      <div v-if="teams.length === 0" class="text-red-700 font-bold  text-5xl">
        No Available Data.
      </div>
      <div v-else>
        <!-- CARD VIEW -->
          
           <div v-if="isCardView && route.query.leaderboardOption == 'overall'"  class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <div
              v-for="(team, index) in teams"
              :key="index"
              class="bg-gray-800 text-white border rounded-lg shadow-lg overflow-hidden"
            >
              <div class="flex flex-col items-center p-4">
                  <div
                    class="px-3 py-1 m-2 text-xl font-semibold"
                    :class="team.tag ? 'font-bold  text-purple-400' : 'py-5'"
                  >
                    {{ team.tag }}
                </div>
                <img
                  v-if="team.team_image"
                  :src="updateImageLink(team.team_image)"
                  alt="Team Image"
                  class="w-20 h-20 rounded-full object-cover mb-4"
                />
                <div v-else class="w-20 h-20 bg-gray-300 rounded-full mb-4 flex items-center justify-center text-white">
                  <span class="text-xl">{{ team.team_name || '' }}</span>
                </div>
                <div class="text-center">
                  <h3 class="text-lg font-semibold">{{ team.team_name }}</h3>
                  <p class="text-sm  font-bold" :class="setRatingNameColor(team)" >{{ team.ratings_name }}</p>

                  <div class="flex items-center mt-2 ">
                    <template v-for="i in 5" :key="i">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        :class="getStarClass(team.final_ratings, i)"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                      </svg>
                    </template>
                  </div>

                  <p class="text-xl font-bold mt-2">{{ team.final_ratings }}</p>
                  <p class="text-xl font-bold mt-2">{{ team.month }}</p>
                  <p class="text-xl font-bold mt-2">{{ team.year }}</p>
                </div>
                <button
                  @click="showTeamDetails(team)"
                  class="text-green-300 hover:text-green-500 font-semibold hover:underline hover:scale-105 transition duration-300"
                >
                  Performance Details
                </button>
              </div>
            </div>            
            
          </div>    


          <div v-else class="overflow-x-auto shadow-xl rounded-lg">
              <leader-board-table-view-team :agents="teams" viewType="overall" :isMonthhy="false"
                title="Overall Yearly Performance  Information"
                 memberTitle="Team  Information"
              ></leader-board-table-view-team>
          
          </div>
      </div>
    </div>
  </div>



  <!-- Modal for Team Details -->
  <div v-if="showModalForTeam" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div class="bg-gray-800 text-white p-6 rounded-lg w-full md:w-2/3 lg:w-1/2 xl:w-1/3 h-auto overflow-auto">
      <div class="flex flex-col items-center">
      
        <img
          v-if="selectedTeam && selectedTeam.team_image"
          :src="updateImageLink(selectedTeam.team_image)"
          alt="Agent Image"
          class="w-40 h-40 rounded-full object-cover mb-4"
        />
        <div v-else class="w-40 h-40 bg-gray-300 rounded-full mb-4 flex items-center justify-center text-white">
          <span class="text-4xl">{{ selectedTeam ? selectedTeam.team_name : '' }}</span>
        </div>
        <div class="text-center">
          <h3 class="text-3xl font-semibold">{{ selectedTeam ? selectedTeam.team_name : 'No Team selected' }}</h3>
          <!-- <h3 class="text-xl font-semibold">AgentID: {{ selectedAge ? selectedAgent.id : 'Agent has no ID' }}</h3> -->
          <p class="text-lg  font-bold" :class="setRatingNameColor(selectedTeam)">{{ selectedTeam ? selectedTeam.ratings_name : '' }}</p>

          <div class="flex items-center mt-2">
            <template v-for="i in 5" :key="i">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                :class="getStarClass(selectedTeam ? selectedTeam.final_ratings : 0, i)"
                width="30"
                height="35"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
            </template>
          </div>

          <p class="text-3xl font-bold mt-2">{{ selectedTeam ? selectedTeam.final_ratings : '' }}</p>
         
        </div>
        <p class="text-lg font-bold mt-2">Month Of: {{ selectedTeam ? selectedTeam.month : '' }}</p>
        <p class="text-lg font-bold mt-2">Year: {{ selectedTeam ? selectedTeam.year : '' }}</p>
        <!-- Table for Additional Information -->
        <div class="mt-6 w-full overflow-x-auto">
          <table class="min-w-full table-auto border-collapse border border-gray-700">
            <thead>
              <tr>
                <th class="px-2 py-2 border bg-gray-800 text-white text-center">Team</th>
                <th class="px-2 py-2 border bg-gray-800 text-white text-center">Manager</th>
                <th class="px-4 py-2 border bg-gray-800 text-white text-center">Rating</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="member in selectedTeam.teams" :key="member.id">
                <td class="border px-4 py-2">
                  <div class="flex items-center space-x-2">
                    <img
                      v-if="member && member.team_image"
                      :src="updateImageLink(member.team_image)"
                      alt="Agent Image"
                      class="w-10 h-10 rounded-full object-cover"
                    />
                    <span>{{ member.team_name }}</span> 
                  </div>
                </td>
                <td class="px-4 py-2 font-semibold border bg-gray-900 text-gray-100 text-center">
                  {{ member.team_leader_name.toUpperCase() }}
                </td>                
                <td class="px-4 py-2 font-semibold border bg-gray-900 text-gray-100 text-center">
                  {{ member.final_ratings }}
                </td>
              </tr>
            </tbody>
          </table>
                  
          <table class="min-w-full table-auto mt-6">
            <thead>
              <tr>
                <th class="px-4 py-2 border bg-gray-800 text-white text-lef">Overall Target</th>
                <th class="px-4 py-2 border bg-gray-800 text-white text-lef">Overall ShipOK</th>
                <th class="px-4 py-2 border bg-gray-800 text-white text-lef">Percentage(%)</th>

              </tr>
            </thead>
            <tbody>
              <tr v-if="selectedAgent">
                <td class="px-4 py-2 font-bold border bg-gray-900 text-green-500 text-center">{{ selectedTeam.target }}</td>
                <td class="px-4 py-2 font-bold border bg-gray-900 text-green-500 text-center">{{ selectedTeam.shipok }}</td>
                <td class="px-4 py-2 font-bold border bg-gray-900 text-green-500 text-center">{{ selectedTeam.shipok_percent }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <button
          @click="closeModalForTeam"
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
import { onMounted, reactive,ref, watch, computed  } from 'vue';

import API from '~/utils/api'

definePageMeta({
  middleware: ['auth'] 
})

//get the current user
const authStore = useAuthStore()
authStore.fetchTokenFromLocalStore()
const isAdmin = ref(false)

const currentUser = authStore.state.user 
const token = authStore.state.token

const leaderBoardStore = useLeaderBoardStore();
const route = useRoute()
const router = useRouter()



const teams = computed(() => leaderBoardStore.state.leaderboard) 



const config = useRuntimeConfig()
const apiUrl = config.public.apiUrl

const updateImageLink = (imageLink) => {
        return `${config.public.imageBaseUrl}${imageLink}`
}



const selectedAgent = reactive({});
const selectedTeam = reactive({});
const showModal = ref(false);
const showModalForTeam = ref(false)
const isCardView = ref(true)

const month = ref("")
const year = ref("")

const year_summary = true
const leaderboardOption = 'overall'



const { setRatingNameColor } = useRatingColor()




if (currentUser.login_type == 'standarduser' && currentUser.role == 'admin'){
    isAdmin.value = true
    
 }

//  if(currentUser.login_type == 'salesagent' && currentUser.agent_type == 1){
//       route.query.team_id = currentUser.team_id
//  }


 const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
         ]



  month.value = route.query.month ||  months[new Date().getMonth()]
  year.value = route.query.year ||  new Date().getFullYear()



const exportUrl = API.export.leaderboard
const exportFileName = computed(()=> {
  return `salesleaderboard-${month.value.month}-${year.value.year}.xlsx`
})




// Show the details of the selected agent
const showTeamDetails = (team) => {
  // selectedAgent.value = agent;
  Object.assign(selectedTeam, team);
  showModalForTeam.value = true; // Show the modal
};


// Close the modal
const closeModal = () => {
  showModal.value = false; // Hide the modal
};

// Close the modal
const closeModalForTeam = () => {
  showModalForTeam.value = false; // Hide the modal
};


//Toggle the view mode between card and table

const  toggleView = () => {
  isCardView.value = !isCardView.value
}



watch(route, async(oldRoute, newRoute) => {
 
  console.log('The route is change. we should react to the change..')
  
   
     router.push(newRoute.fullPath)
    await leaderBoardStore.fetchLeaderboard(leaderboardOption, newRoute.query, year_summary);
    
     console.log('the leadeobard is', leaderBoardStore.state.leaderboard )
     

    //   leaderBoardStore.state.leaderboard.filter(agent => agent.team_id == newRoute.query.team_id)

    
   
  
})


// Fetch leaderboard data on mount
onMounted( async() => {
 
   await leaderBoardStore.fetchLeaderboard(leaderboardOption, route.query, year_summary);
   
  
});






    



// Star rating calculation
const getStarClass = (rating, index) => {
  const fullStar = 'text-yellow-500';
  const halfStar = 'text-yellow-300';
  const emptyStar = 'text-gray-300';

  const decimalPart = rating - Math.floor(rating);
  if (index <= Math.floor(rating)) {
    return fullStar;
  } else if (index - 1 < decimalPart) {
    return halfStar;
  } else {
    return emptyStar;
  }
};
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