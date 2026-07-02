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
        <button  v-if="(leaderboardOption != 'team' && leaderboardOption != 'new deposit'  && leaderboardOption != 'shipok percentage' ) && 
         (currentUser.login_type == 'standarduser' || currentUser.agent_type == 2)"
          @click="toggleView" 
          class="bg-blue-600 text-white py-1 px-2 rounded-lg hover:bg-blue-700 transition duration-300"
        >
        <font-awesome-icon :icon="['fas', isCardView ? 'toggle-off' : 'toggle-on']" />
          Toggle to {{ isCardView ? 'Table' : 'Card' }} View
        </button>
        <export-to-excel-component  v-if=" isAdmin && !isCardView && leaderBoardStore.state.leaderboard.length && (leaderboardOption != 'team'  || leaderboardOption != 'new deposit')" class="ml-2"
         :exportUrl="exportUrl"
         :exportFileName="exportFileName"
         :query="query"
         :token="token"
         :incomplete="incomplete"
        ></export-to-excel-component>
      </div>
      
      <div class="text-red-700 font-bold  text-5xl" v-if="leaderBoardStore.state.error">{{ leaderBoardStore.state.error }}</div>
      <div v-else-if="leaderBoardStore.state.leaderboard.length === 0" class="text-red-700 font-bold  text-5xl">
        No Available Data.
      </div>
      <div v-else>
        <!-- CARD VIEW -->
          
           <div v-if="isCardView && leaderboardOption == 'team'"  class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <div
              v-for="(team, index) in leaderBoardStore.state.leaderboard"
              :key="index"
              class="bg-gray-800 text-white border rounded-lg shadow-lg overflow-hidden"
            >
              <div class="flex flex-col items-center justify-center text-center p-4">
                <div
                  class="px-3 py-1 m-2 text-xl font-semibold"
                  :class="team.tag ? 'px-4 py-1 text-sm font-bold uppercase tracking-widest bg-purple-600/20 text-purple-400 rounded-full border border-purple-500' : 'py-5'"
                >
                  {{ team.tag }}
                </div>

                <img
                  v-if="team.team_image"
                  :src="team.team_image"
                  alt="Team Image"
                  class="w-20 h-20 rounded-full object-cover mb-4"
                />
                <div v-else class="w-20 h-20 bg-gray-300 rounded-full mb-4 flex items-center justify-center text-white">
                  <span class="text-lg pb-2">{{ team.team_name || '' }}</span>
                </div>

                <div class="text-center flex flex-col items-center">
                  <h2 class="text-lg font-semibold">{{ team.team_name }}</h2>
                  <p class="text-sm font-bold p-2" :class="setRatingNameColor(team)">
                    {{ team.ratings_name }}
                  </p>

                  <div class="flex items-center justify-center mt-3">
                    <template v-for="i in 5" :key="i">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        :class="getStarClass(team.final_ratings, i)"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path
                          d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2
                          9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                        />
                      </svg>
                    </template>
                  </div>

                  <p class="text-xl font-bold mt-2">{{ team.final_ratings }}</p>
                  <p class="text-xl font-bold mt-2">{{ team.month }}</p>
                  <p class="text-xl font-bold mt-2">{{ team.year }}</p>
                </div>

                <button
                  @click="showTeamDetails(team)"
                  class="mt-3 text-green-300 hover:text-green-500 font-semibold hover:underline hover:scale-105 transition duration-300"
                >
                  Performance Details
                </button>
              </div>

            </div>            
            
          </div>  
          <div
            v-else-if="isCardView && leaderboardOption == 'new deposit'"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4"
          >
            <div
              v-for="(agent, index) in leaderBoardStore.state.leaderboard"
              :key="index"
              class="bg-gray-800 text-white border border-gray-700 rounded-2xl shadow-lg overflow-hidden transition transform hover:scale-105 hover:shadow-2xl"
            >
              <div class="flex flex-col items-center justify-center text-center p-6 space-y-3">

                <!-- Tag -->
                <div
                
                  :class="agent.tag != '' ? 'px-4 py-1 text-sm font-bold uppercase tracking-widest bg-purple-600/20 text-purple-400 rounded-full border border-purple-500' : 'py-4'"
                >
                  {{ agent.tag }}
                </div>

                <!-- Agent Image -->
                <img
                  v-if="agent.image_link"
                  :src="agent.image_link"
                  alt="Agent Image"
                  class="w-24 h-24 rounded-full object-cover border-2 border-gray-600 shadow-md"
                />
                <div
                  v-else
                  class="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center text-white border border-gray-600"
                >
                  <span class="text-xl font-semibold">{{ agent.db_name?.charAt(0).toUpperCase() }}</span>
                </div>

                <!-- Agent Info -->
                <div class="text-center">
                  <h2 class="text-lg font-bold text-white">{{ agent.db_name }}</h2>

                  <div class="my-3">
                    <h1 class="text-6xl font-extrabold text-blue-400">{{ agent.new_deposit_count }}</h1>
                    <p class="text-sm tracking-wide text-gray-400">New Deposits</p>
                  </div>

                  <div class="flex justify-center gap-3 mt-2 text-sm">
                    <p class="font-semibold text-green-400">{{ agent.month }}</p>
                    <p class="font-semibold text-yellow-400">{{ agent.year }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

                    <div
            v-else-if="isCardView && leaderboardOption == 'shipok percentage'"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4"
          >
            <div
              v-for="(agent, index) in leaderBoardStore.state.leaderboard"
              :key="index"
              class="bg-gray-800 text-white border border-gray-700 rounded-2xl shadow-lg overflow-hidden transition transform hover:scale-105 hover:shadow-2xl"
            >
              <div class="flex flex-col items-center justify-center text-center p-6 space-y-3">

                <!-- Tag -->
                <div
                
                  :class="agent.tag != '' ? 'px-4 py-1 text-sm font-bold uppercase tracking-widest bg-purple-600/20 text-purple-400 rounded-full border border-purple-500' : 'py-4'"
                >
                  {{ agent.tag }}
                </div>

                <!-- Agent Image -->
                <img
                  v-if="agent.image_link"
                  :src="agent.image_link"
                  alt="Agent Image"
                  class="w-24 h-24 rounded-full object-cover border-2 border-gray-600 shadow-md"
                />
                <div
                  v-else
                  class="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center text-white border border-gray-600"
                >
                  <span class="text-xl font-semibold">{{ agent.db_name?.charAt(0).toUpperCase() }}</span>
                </div>

                <!-- Agent Info -->
                <div class="text-center">
                  <h2 class="text-lg font-bold text-white">{{ agent.db_name }}</h2>

                  <div class="my-3">
                    <h1 class="text-4xl font-extrabold text-blue-400">{{ agent.shipok_percent }}%</h1>
                    <p class="text-sm tracking-wide text-gray-400">Shipok Percentage</p>
                  </div>

                  <div class="flex justify-center gap-3 mt-2 text-sm">
                    <p class="font-semibold text-green-400">{{ agent.month }}</p>
                    <p class="font-semibold text-yellow-400">{{ agent.year }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
            
          <div v-else-if="isCardView" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                  :src="agent.image_link"
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
          </div>

          <div v-else class="overflow-x-auto shadow-xl rounded-lg">
              <leader-board-table-view :agents="leaderBoardStore.state.leaderboard"></leader-board-table-view>
          
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

<!-- Modal for Team Details -->
<div
  v-if="showModalForTeam"
  class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
>
  <div
    class="bg-gray-800 text-white p-8 rounded-2xl w-full md:w-2/3 lg:w-1/2 xl:w-1/3 max-h-[90vh] overflow-y-auto shadow-2xl"
  >
    <!-- Modal Content -->
    <div class="flex flex-col items-center text-center">
      <!-- Image Section -->
      <img
        v-if="selectedTeam && selectedTeam.team_image"
        :src="electedTeam.team_image"
        alt="Team Image"
        class="w-40 h-40 rounded-full object-cover mb-4 border-4 border-gray-700 shadow-md"
      />
      <div
        v-else
        class="w-40 h-40 bg-gray-600 rounded-full mb-4 flex items-center justify-center text-white shadow-md"
      >
        <span class="text-4xl font-bold">{{
          selectedTeam ? selectedTeam.team_name : ""
        }}</span>
      </div>

      <!-- Team Info -->
      <div class="flex flex-col items-center">
        <h3 class="text-3xl font-semibold mb-2">
          {{ selectedTeam ? selectedTeam.team_name : "No Team Selected" }}
        </h3>
        <p
          class="text-lg font-bold mb-2"
          :class="setRatingNameColor(selectedTeam)"
        >
          {{ selectedTeam ? selectedTeam.ratings_name : "" }}
        </p>

        <!-- Rating Stars -->
        <div class="flex items-center justify-center mt-2 mb-3">
          <template v-for="i in 5" :key="i">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              :class="getStarClass(
                selectedTeam ? selectedTeam.final_ratings : 0,
                i
              )"
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 
                9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
              />
            </svg>
          </template>
        </div>

        <p class="text-3xl font-bold mt-1">
          {{ selectedTeam ? selectedTeam.final_ratings : "" }}
        </p>

        <p class="text-lg font-semibold mt-3">
          Month Of:
          <span class="font-normal">{{
            selectedTeam ? selectedTeam.month : ""
          }}</span>
        </p>
        <p class="text-lg font-semibold">
          Year:
          <span class="font-normal">{{
            selectedTeam ? selectedTeam.year : ""
          }}</span>
        </p>
      </div>

      <!-- Tables Section -->
      <div class="mt-6 w-full overflow-x-auto">
        <!-- Team Members Table -->
        <table
          class="min-w-full table-auto border-collapse border border-gray-700 text-center"
        >
          <thead>
            <tr class="bg-gray-700">
              <th class="px-4 py-2 border border-gray-600">Team Members</th>
              <th class="px-4 py-2 border border-gray-600">Market</th>
              <th class="px-4 py-2 border border-gray-600">Rating</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="member in selectedTeam.teams"
              :key="member.id"
              class="bg-gray-900 hover:bg-gray-700 transition"
            >
              <td class="border border-gray-700 px-2 py-2">
                <div class="flex items-center justify-left space-x-2">
                  <img
                    v-if="member && member.image_link"
                    :src="member.image_link"
                    alt="Agent Image"
                    class="w-10 h-10 rounded-full object-cover border border-gray-600"
                  />
                  <span class="font-medium">{{ member.db_name }}</span>
                  <span
                    v-if="member.agent_type == 1"
                    class="text-blue-400 font-bold"
                    >- LM</span
                  >
                </div>
              </td>
              <td class="px-4 py-2 border border-gray-700 font-semibold">
                {{ member.market_name.toUpperCase() }}
              </td>
              <td class="px-4 py-2 border border-gray-700 font-semibold">
                {{ member.final_ratings }}
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Team Target Table -->
        <table
          class="min-w-full table-auto mt-6 border-collapse border border-gray-700 text-center"
        >
          <thead>
            <tr class="bg-gray-700">
              <th class="px-4 py-2 border border-gray-600">Team Target</th>
              <th class="px-4 py-2 border border-gray-600">Team ShipOK</th>
              <th class="px-4 py-2 border border-gray-600">Percentage (%)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="selectedTeam" class="bg-gray-900">
              <td class="px-4 py-2 font-bold text-green-400 border border-gray-700">
                {{ selectedTeam.target }}
              </td>
              <td class="px-4 py-2 font-bold text-green-400 border border-gray-700">
                {{ selectedTeam.shipok }}
              </td>
              <td class="px-4 py-2 font-bold text-green-400 border border-gray-700">
                {{ selectedTeam.shipok_percent }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Close Button -->
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
import { months, setRatingNameColor,getStarClass } from '@/utils/constants'

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


const config = useRuntimeConfig()
const apiUrl = config.public.apiUrl


const leaderBoardStore = useLeaderBoardStore();
const selectedAgent = reactive({});
const selectedTeam = reactive({});
const showModal = ref(false);
const showModalForTeam = ref(false)
const isCardView = ref(true)

const year_summary = false
const all = false


const route = useRoute()


const router = useRouter()
const query = ref({})
// const { setRatingNameColor } = useRatingColor()
const month = ref("")
const year = ref("")

const leaderboardOption = ref("")



if (currentUser.login_type == 'standarduser' && (currentUser.role == 'admin' || currentUser.role == 'poweruser')){
    isAdmin.value = true
   
  }


  month.value = route.query.month ||  months[new Date().getMonth()]
  year.value = route.query.year ||  new Date().getFullYear()



const exportUrl = API.export.leaderboard
const exportFileName = computed(()=> {
  return `salesleaderboard-${month.value}-${year.value}.xlsx`
})


 const incomplete = computed(() => {
     // true = has unsubmitted agents
     
     return leaderBoardStore.state.leaderboard.some(agent => agent.submitted === 0)
   })


// Method to fetch leaderboard data
const leaderBoardData = (leaderboardOption,query, year_summary) => {
  leaderBoardStore.fetchLeaderboard(false ,route.query, year_summary);
};

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
  if(currentUser.login_type !== 'standarduser' && currentUser.agent_type !== 2){
    alert('Not Allowed to shift views')
    return
  }
  isCardView.value = !isCardView.value
}




//watch for the route change

watch(route, (newRoute) => {
  console.log('The route is change. we should react to the change..')

  router.push(newRoute.fullPath)
  leaderBoardData(false,newRoute.query, year_summary)
  query.value = newRoute.query
  month.value = newRoute.query.month
  year.value = newRoute.query.year
  leaderboardOption.value =  newRoute.query.leaderboardOption

  if(leaderboardOption.value == 'team' || leaderboardOption.value == 'new deposit'){
    isCardView.value = true
  }
  
})



// Fetch leaderboard data on mount
onMounted(() => {
  leaderBoardData(all,query.value, year_summary);
  
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