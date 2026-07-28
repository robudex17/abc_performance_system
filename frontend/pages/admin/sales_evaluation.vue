<template>
  <!-- <div class=" bg-gradient-to-r from-blue-50 to-blue-100 min-h-screen p-4 mt-20"> -->
  <div class="p-4 mt-20">
    <!-- Loading Spinner -->
    <!-- <div v-if="useFeedbackStore.state.loading">
      <spinner></spinner>
    </div> -->
 
    <div >

        <h1 class="text-3xl font-extrabold text-gray-800 mb-6 text-center">SALES AGENTS EVALUATION</h1>
        <!-- Agents Table -->
        <div class="overflow-x-auto shadow-xl rounded-lg">
          <table class="w-full table-auto border-collapse bg-white">
            <!-- Table Head -->
                <thead>
                <tr class="bg-gradient-to-r from-blue-200 to-blue-300 text-gray-800">
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">ID</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Name</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Employee Status</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Market</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Team</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Month</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Year</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Target</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">ShipOk</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">New Deposit</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Absences</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Tardiness</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Memo</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Feedback (Admin)</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Feedback (QA)</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Feedback (AGENTS)</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Feedback (LM)</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Feedback (UM)</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Deduction</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Actions</th>
                </tr>
                </thead>
            <!-- Table Body -->
                <tbody>
                <tr
                    v-for="(agent, index) in paginatedAgents"
                    :key="index"
                    class="even:bg-blue-50 odd:bg-white hover:bg-blue-100 transition-colors"
                >
                    <!-- ID -->
                    <td class="py-0.5 px-4 text-center text-xs text-gray-700 border">
                    {{ agent.id }}
                    </td>

                     <!-- Name with Avatar -->
                    <td class="py-0.5 pr-12 text-left text-xs font-medium text-green-900 border">
                        <div class="flex items-center space-x-2">
                            <img
                            v-if="agent && agent.image_link"
                            :src="agent.image_link"
                            alt="Agent Image"
                            class="w-9 h-9 rounded-full object-cover shadow"
                            />
                            <span >{{ agent.db_name }}</span>
                        </div>
                    </td>
                    
                    <!-- Market, Month, Year, Target, ShipOk -->
                    <td class="py-0.5 px-4 text-left text-xs  border"
                         :class="{
                          'text-red-600 font-bold': agent.employee_status === 'Resigned',
                          'text-green-600 font-bold': agent.employee_status === 'Hired' || agent.employee_status === 'Rehired'
                        }" 
                    >
                     {{ agent.employee_status }}
                    </td>
                    <td class="py-0.5 px-4 text-left text-xs font-medium text-gray-700 border">
                     {{ agent.market_name }}
                    </td>  
                    <td class="py-0.5 px-4 text-left text-xs font-medium text-gray-700 border">
                     {{ agent.team_name }}
                    </td>                                     
                    <td class="py-0.5 px-4 text-left text-xs font-medium text-gray-700 border">
                    {{ agent.eval_month }}
                    </td>
                    <td class="py-0.5 px-4 text-left text-xs font-medium text-gray-700 border">
                    {{ agent.eval_year }}
                    </td>
                    <td class="py-0.5 px-4 text-left text-xs font-medium text-gray-700 border">
                      
                     <!-- <span v-if="agent.agent_type ==2"> {{ agent.target }} </span> -->
                      <button  @click="openMetricsTypeModal({ employee_status: agent.employee_status, submitted: agent.submitted,agent_id: agent.id, agent_dbname:agent.db_name, month: agent.eval_month, year: agent.eval_year, target: agent.target, shipok: agent.shipok, agent_type: agent.agent_type, team_id:agent.team_id,  image_link: agent.image_link,metrics_type: 'targetShipok' })" >
                        {{ agent.target }} 
                      </button>
                    </td>
                    <td class="py-0.5 px-4 text-left text-xs font-medium text-gray-700 border">
                      <!-- <span v-if="agent.agent_type ==2"> {{ agent.shipok }} </span> -->
                      <button   @click="openMetricsTypeModal({employee_status: agent.employee_status, submitted: agent.submitted,agent_id: agent.id, agent_dbname:agent.db_name, month: agent.eval_month, year: agent.eval_year, target: agent.target, shipok: agent.shipok, agent_type: agent.agent_type, team_id:agent.team_id,  image_link: agent.image_link, metrics_type: 'targetShipok' })" >
                        {{ agent.shipok }} 
                      </button>
              
                    </td>

                    <td class="py-0.5 px-4 text-left text-xs font-medium text-gray-700 border">
                      <!-- <span v-if="agent.agent_type ==2"> {{ agent.shipok }} </span> -->
                      <button   @click="openMetricsTypeModal({employee_status: agent.employee_status, submitted: agent.submitted,agent_id: agent.id, month: agent.eval_month, year: agent.eval_year, total_new_deposit: agent.total_new_deposit, agent_type: agent.agent_type, metrics_type: 'newDeposit' })" >
                        {{ agent.total_new_deposit }} 
                      </button>
              
                    </td>
                    <td class="py-0.5 px-4 text-center text-xs font-medium text-gray-700 border">
                    
                      <button   @click="openMetricsTypeModal({employee_status: agent.employee_status,submitted: agent.submitted,agent_id: agent.id, month: agent.eval_month, year: agent.eval_year, total_absences:  agent.total_absences, agent_type: agent.agent_type, metrics_type: 'absence' })" >
                      {{ agent.total_absences }}
                      </button>                    
                    </td>
                    <td class="py-0.5 px-4 text-center text-xs font-medium text-gray-700 border">
                   
                      <button   @click="openMetricsTypeModal({employee_status: agent.employee_status,submitted: agent.submitted,agent_id: agent.id, month: agent.eval_month, year: agent.eval_year, total_tardiness:  agent.total_tardiness, agent_type: agent.agent_type,  metrics_type: 'tardiness' })" >
                      {{ agent.total_tardiness }}

                      </button>                      
                    </td>
                    <td class="py-0.5 px-4 text-center text-xs font-medium text-gray-700 border">
        
                      <button   @click="openMetricsTypeModal({employee_status: agent.employee_status,submitted: agent.submitted,agent_id: agent.id, month: agent.eval_month, year: agent.eval_year, total_memo:  agent.total_memo, agent_type: agent.agent_type, metrics_type: 'memo' })" >
                      {{ agent.total_memo }}

                      </button>                       
                    </td>

                    <!-- Feedback Columns -->
                    <td
                    class="py-0.5 px-4 text-center text-xs border"
                    :class="{ 'text-red-500 font-bold': agent.feedback_admin === 'No Feedback', 'text-green-900 font-medium': agent.feedback_admin !== 'No Feedback' }"
                    >
                    

                      <button   @click="openMetricsTypeModal({employee_status: agent.employee_status,submitted: agent.submitted,agent_id: agent.id, agent_dbname:agent.db_name, month: agent.eval_month, year: agent.eval_year, feedback:  agent.feedback_admin, agent_type: agent.agent_type, metrics_type: 'feedback_admin' })" >
                       {{ agent.feedback_admin }}

                      </button>                    
                    </td>
                    <td
                    class="py-0.5 px-4 text-center text-xs border"
                    :class="{ 'text-red-500 font-bold': agent.feedback_qa === 'No Feedback', 'text-green-900 font-medium': agent.feedback_qa !== 'No Feedback' }"
                    >
                   
                      <button   @click="openMetricsTypeModal({employee_status: agent.employee_status,submitted: agent.submitted,agent_id: agent.id,  agent_dbname:agent.db_name,month: agent.eval_month, year: agent.eval_year, feedback:  agent.feedback_qa, agent_type: agent.agent_type, metrics_type: 'feedback_qa' })" >
                        {{ agent.feedback_qa }}

                      </button> 
                    </td>
                     <td
                    class="py-0.5 px-4 text-center text-xs border font-medium text-blue-700"
                    
                    >
                    
                    <button v-if="agent.ave_feedback_by_agents != null"  @click="openModal( agent.feedback_by_agents)" >
                        {{ agent.ave_feedback_by_agents }}
                    </button>
                    </td>
                    <td
                    class="py-0.5 px-4 text-center text-xs border font-medium text-blue-700"
                  
                    >
                    

                    <button v-if="agent.ave_feedback_by_lm != null"  @click="openModal( agent.feedback_by_lm )" >
                       {{ agent.ave_feedback_by_lm }}
                    </button>
                    </td>
                    <td
                    class="py-0.5 px-4 text-center text-xs border font-medium text-blue-700"
                   
                    >

                    <button v-if="agent.ave_feedback_by_um != null"  @click="openModal( agent.feedback_by_um )" >
                        {{ agent.ave_feedback_by_um }}
                    </button>                    
                    </td>
                    <td class="py-0.5 px-4 text-center text-xs border  text-blue-700"
                     :class="Number(agent.deduction) > 0 ? 'text-red-600 font-bold' : 'font-medium'"
                    >

                     <button   @click="openMetricsTypeModal({employee_status: agent.employee_status,submitted: agent.submitted,agent_id: agent.id, month: agent.eval_month, year: agent.eval_year, deduction:  agent.deduction, agent_type: agent.agent_type, metrics_type: 'deduction' })" >
                      {{ agent.deduction }}

                      </button>     
                    </td>
                   
                    <!-- Actions -->
                    <td class="py-0.5 px-4 text-center border" >
                    <div class="flex justify-center space-x-2" v-if="agent.agent_type == 2">

                  <!-- Submit All button -->
                            <button
                              v-if="!submittedAll"
                              @click="submitAllSalesEvaluation"
                              :disabled="!canSubmitAll || !agent.ready_to_submit"
                              :class="[
                                'py-0.5 px-3 rounded-lg flex items-center gap-2 text-sm',
                                canSubmitAll
                                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                                  : 'bg-gray-400 text-white cursor-not-allowed'
                              ]"
                            >
                              Submit
                            </button>

                            <!-- Submitted All button (disabled + gray) -->
                            <button
                              v-else
                              disabled
                              class="bg-gray-400 text-white cursor-not-allowed text-sm rounded-lg px-3"
                            >
                              Submitted 
                            </button>

                            <!-- Review All button (purple) -->
                            <button
                              v-if="submittedAll"
                              @click="reviewAllSalesEvaluation"
                              class="bg-purple-500 text-white py-0.5 px-3 rounded-lg hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                            >
                              Review 
                            </button>

                    </div>

                        <div class="flex justify-center space-x-2" v-else>

                        <!-- Submit / Submitted Button -->
                        <button
                          @click="submitSalesEvaluation(agent)"
                        :disabled="!agent.ready_to_submit || agent.submitted == 1"
                        :class="[
                            'py-0.5 px-3 rounded-lg flex items-center gap-2 text-sm',
                            agent.submitted == 1
                            ? 'bg-gray-400 text-white cursor-not-allowed' // Already submitted
                            : agent.ready_to_submit
                                ? 'bg-green-500 text-white hover:bg-green-600' // Ready to submit
                                : 'bg-gray-400 text-white cursor-not-allowed'   // Not ready
                        ]"
                        >
                        {{ agent.submitted == 1 ? 'Submitted' : 'Submit' }}
                        </button>

                        <!-- Review Button -->
                        <button
                        v-if="agent.submitted == 1"
                        @click="reviewSalesEvaluation(agent)"
                        class="bg-purple-500 text-white py-0.5 px-3 rounded-lg hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                        >
                        Review
                        </button>

                    </div>                    
                    </td>


                </tr>
                </tbody>     
          </table>

    <sales-evaluation-component
      :showModal="showModalMetricsType"
      :metricsType="metricsType"
      :modalType="modalMeticsType"
      :agentData="selectedData"
      :modalMeticsTypeMessage="modalMeticsTypeMessage"
      @passClose="resetValues"
      @passAddDataAgent="addDataAgent"
       @passEditDataAgent="editDataAgent"
      @passDeleteDataAgent="deleteDataAgent"
    ></sales-evaluation-component>

      <!-- Modal -->
      <div 
        v-if="showModal" 
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-11/12 md:w-3/4 lg:w-2/3 xl:w-3/4 overflow-hidden">
          
          <!-- Header -->
          <div class="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
            <h2 class="text-lg font-bold">
              {{ modalType === 'qa' ? 'QA Feedback Details' : 'Update/Delete Feedback' }}
            </h2>
            <button 
              @click="closeModal" 
              class="text-white hover:text-gray-200 transition"
            >
              ✕
            </button>
          </div>

          <!-- Body -->
          <div class="bg-gray-50 p-6 max-h-[70vh] overflow-y-auto overflow-x-hidden">
            <table class="min-w-full table-fixed border-collapse">
              <thead>
                <tr class="bg-gray-200 text-gray-700" v-if="modalData.length > 0">
                  <th class="w-1/4 px-4 py-2 text-left font-semibold">Feedback By</th>
                  <th class="w-1/6 px-4 py-2 text-left font-semibold">Month</th>
                  <th class="w-1/6 px-4 py-2 text-left font-semibold">Year</th>
                  <th class="w-1/6 px-4 py-2 text-left font-semibold">Feedback Score</th>
                </tr>
             
              </thead>
              <tbody v-if="modalData.length > 0">
                <tr 
                  v-for="data in modalData" 
                  :key="data.who_give_feedback_id" 
                  class="border-b hover:bg-gray-100 transition"
                >
                  <!-- Feedback By -->
                  <td class="px-4 py-3 flex items-center space-x-3">
                    <img
                      v-if="data && data.image_link"
                      :src="data.image_link"
                      alt="Agent Image"
                      class="w-10 h-10 rounded-full object-cover border"
                    />
                    <span class="font-medium text-gray-800">
                      {{ data.who_give_feedback_name }}
                    </span>
                  </td>

                  <!-- Month -->
                  <td class="px-4 py-3 font-semibold">{{ data.month }}</td>

                  <!-- Year -->
                  <td class="px-4 py-3 font-semibold">{{ data.year }}</td>

                  <!-- Score -->
                <td class="border px-4 py-2 text-center">
                  <span
                    v-if="parseFloat(data.feedback_score) > 0"
                    class="text-gray-800 font-medium"
                  >
                    {{ data.feedback_score }}
                  </span>
                  <span
                    v-else
                    class="text-gray-400 italic font-semibold"
                  >
                    No Feedback Yet
                  </span>
                </td>

       
                </tr>
              </tbody>
 
            </table>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 bg-gray-100 text-right">
            <button
              @click="closeModal"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 hover:scale-105 transition duration-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>

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

                <!-- Centered Submit All Button -->
        <div class="flex justify-center items-center my-6 space-x-4">
          <!-- Submit All button -->
          <button
            v-if="!submittedAll"
            @click="submitAllSalesEvaluation"
            :disabled="!canSubmitAll"
            :class="[
              'py-2 px-6 rounded-lg text-lg font-semibold transition-colors',
              canSubmitAll
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-400 text-white cursor-not-allowed'
            ]"
          >
            Submit All
          </button>

          <!-- Submitted All button (disabled + gray) -->
          <button
            v-else
            disabled
            class="py-2 px-6 rounded-lg text-lg font-semibold bg-gray-400 text-white cursor-default"
          >
            Submitted All
          </button>

          <!-- Review All button (purple) -->
          <button
            v-if="submittedAll"
            @click="reviewAllSalesEvaluation"
            class="py-2 px-6 rounded-lg text-lg font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-colors"
          >
            Review All
          </button>
        </div>




    </div>
  </div>
</template>
  
  <script setup>
  
  definePageMeta({
    middleware: ['auth', 'adminmanager']
  })
  
  import { ref, computed } from 'vue';
  import { onMounted } from 'vue';

  import { months, monthMap } from '@/utils/constants'

   
  const router = useRouter();
  const route = useRoute();
  

  
  //get the current user
    const authStore = useAuthStore()
    authStore.fetchTokenFromLocalStore()
  
    const currentUser = authStore.state.user 

    const showModal = ref(false)

    const showModalMetricsType = ref(false);
    const modalMeticsType = ref('add');
    const  modalMeticsTypeMessage = ref([])

    const selectedData = ref({})
    const metricsType = ref("")


    const modalData = ref("")


    const itemsPerPage = 10;
    const currentPage = ref(1);
    const isModalOpen = ref(false);
    const isModalOpenForLogin = ref(false)
    const  enablePasswordRecovery = ref(false)
    const editMode = ref(false); // Toggle between Add and Edit mode
    const editLoginMode = ref(false); // Toggle between Add and Edit mode for login
    const imagePreview = ref(null);


  const useFeedbackStore  = feedbackStore()

   const useManageSalesStore = useManageSalesAgentStore();
      
  const fetchTeamTargetShipok = (teamId) => {
     const teamTargetShipok =  agents.value.filter(agent => agent.team_id == teamId)
    
     const team  = {

       team_id : teamId, 
       team_target: 0,
       team_shipok: 0
     }

     teamTargetShipok.forEach(agent => {
        if(agent.agent_type ==1){
          team.team_image =  agent.image_link
          team.team_name = agent.team_name
        
        }

        team.team_target += parseFloat(agent.target)
        team.team_shipok += parseFloat(agent.shipok)
     })

     return team
     
  }
   

  const openMetricsTypeModal = (selectedAgent) => {
    

      metricsType.value = selectedAgent.metrics_type

     if(selectedAgent.submitted ==1 ){
        alert(`Adding, Updating, or Deleting ${metricsType.value} that is already submitted is prohibited.`)
        return
      }

      if(selectedAgent.employee_status == 'Resigned' ){
        alert(`Adding, Updating, or Deleting Agent that is already resigned is prohibitted.`)
        return
      }
     
      switch(metricsType.value){
          case "targetShipok":
            if(currentUser.role != 'admin' && currentUser.agent_type != 2){
               alert(`Not allowed to perform change on ${metricsType.value}`)
              return
            }
              modalMeticsTypeMessage.value = [ "Add  Target/Shipok", "Edit Target/Shipok`"]
            if(selectedAgent.agent_type== 2){
              alert('Cannot Update the agent directly')
              return
            }

            if(Number(selectedAgent.target) == 0 && currentUser.login_type !== 'standarduser'){
              alert('Cannot Update shipok on Agent that has zero (0) Target')
              return
            }
            if(Number(selectedAgent.target) > 0){
              modalMeticsType.value = 'edit'
           
            }
            showModalMetricsType.value = true
            selectedData.value = selectedAgent
            break
          case "newDeposit": 

            if(currentUser.role != 'admin' && currentUser.agent_type != 2){
               alert(`Not allowed to perform change on ${metricsType.value}`)
              return
            }
            modalMeticsTypeMessage.value = [ "Add  New Deposit", "Edit New Deposit"]
            if(selectedAgent.agent_type== 2){
              alert('Cannot Update the agent directly')
              return
            }
            showModalMetricsType.value = true
             selectedData.value = selectedAgent
            break
          case "absence":
            if(currentUser.role != 'admin'){
              alert(`Not allowed to to udpate agent ${metricsType.value}`)
              return
            }
            modalMeticsTypeMessage.value = [ "Add  New Absence", "Edit Absence"]
             showModalMetricsType.value = true
             selectedData.value = selectedAgent
            break
          case "tardiness":
            if(currentUser.role != 'admin'){
              alert(`Not allowed to to udpate agent ${metricsType.value}`)
              return
            }
             modalMeticsTypeMessage.value = [ "Add  New Tardiness", "Edit Tardiness"]
            showModalMetricsType.value = true
            selectedData.value = selectedAgent
          
            break
          case "memo":
            if(currentUser.role != 'admin'){
              alert(`Not allowed to to udpate agent ${metricsType.value}`)
              return
            }
             modalMeticsTypeMessage.value = [ "Add  New Memo", "Edit Memo"]
             selectedData.value = selectedAgent
              showModalMetricsType.value = true
            break
          case "feedback_admin":
            if(currentUser.role != 'admin'){
              alert(`Not allowed to to udpate agent ${metricsType.value}`)
              return
            }

            if(parseFloat(selectedAgent.feedback) > 0){
                modalMeticsType.value = 'edit'
            }
             modalMeticsTypeMessage.value = [ "Add Admin Feedback", "Edit Admin Feedback"]
             selectedData.value = selectedAgent
             showModalMetricsType.value = true            
            break
          case "feedback_qa":
            if(currentUser.role != 'admin'){
              alert(`Not allowed to to udpate agent ${metricsType.value}`)
              return
            }

            
            if(parseFloat(selectedAgent.feedback) > 0){
                modalMeticsType.value = 'edit'
            }
             modalMeticsTypeMessage.value = [ "Add  Qa Feedback", "Edit  Qa Feedback"]
             selectedData.value = selectedAgent
             showModalMetricsType.value = true           
            break
          case "deduction":
           if(currentUser.role != 'admin'){
              alert(`Not allowed to to udpate agent ${metricsType.value}`)
              return
            }

             modalMeticsTypeMessage.value = [ "Add Deduction", "Edit Deduction"]
             if(Number(selectedAgent.deduction) > 0){
              modalMeticsType.value = 'edit'
           
            }
             selectedData.value = selectedAgent
             showModalMetricsType.value = true
            break
          default:
          console.log("Unknown Metircs type");
          break;
      }

    }

    const resetValues   = () => {
          showModalMetricsType.value = false
          modalMeticsType.value = 'add'
          metricsType.value = ''
          modalMeticsTypeMessage.value = []
      }
    
     const addDataAgent = async(totalRecords ,agent) => {

      const monthNumber = monthMap[agent.month];


     switch (metricsType.value){
       case "targetShipok": 
          
              
              await useManageSalesStore.addAgentTarget( agent.agent_id, route.query, agent)
              fetchSalesAgentsEvaluation(route.query)
             break
       case "newDeposit":
            
             agent.evaluation = true
             agent.total_records = totalRecords
             agent.new_deposit = 10000
             agent.date =  `${agent.year}-${monthNumber.toString().padStart(2, '0')}-01`

            //  alert(JSON.stringify(agent))

             await useManageSalesStore.addAgentDeposit(agent.agent_id, route.query, agent)
             fetchSalesAgentsEvaluation(route.query)
            break


       case "absence":
       case "tardiness":
       case "memo":     
             agent.evaluation = true
             agent.total_records = totalRecords
             agent.date =  `${agent.year}-${monthNumber.toString().padStart(2, '0')}-01`
             await useManageSalesStore.addAgentAttendanceType(agent.agent_id, route.query, metricsType.value, agent)
              fetchSalesAgentsEvaluation(route.query)
          break 
       case "feedback_admin":
            agent.admin_id = currentUser.login_id 
            agent.admin_dbname = currentUser.db_name
            agent.admin_role = currentUser.role
            agent.date =  `${agent.year}-${monthNumber.toString().padStart(2, '0')}-28`
            await useFeedbackStore.addUpdateDeleteFeedback(agent.agent_id, agent, 'admin',  route.query, 'POST')
          
            fetchSalesAgentsEvaluation(route.query)
          break
       case "feedback_qa":  

            agent.qa_id = currentUser.login_id 
            agent.qa_dbname = currentUser.db_name
            agent.role = currentUser.role   
            agent.feedback_score = agent.feedback  // assign feedback value to feedback_score because the qa feedback  is save as feedback_score
            agent.date =  `${agent.year}-${monthNumber.toString().padStart(2, '0')}-28`  
            await useFeedbackStore.addUpdateDeleteFeedback(agent.agent_id, agent, 'qa', route.query, 'POST')
          
             fetchSalesAgentsEvaluation(route.query)  
          break 
       case "deduction":
            if(Number(agent.deduction) == 0){
              alert('Deduction must be greater than zero(0)')
              return
            }
             agent.evaluation = true
             await useManageSalesStore.addUpdateDeleteDeduction(agent.agent_id, agent, route.query, 'POST')
             fetchSalesAgentsEvaluation(route.query)  
          break

      
      default:
          console.log("Unknow Metircs type");
          break;

     }
  
  
    }

    const editDataAgent = async(totalRecords, agent) => {
      const monthNumber = monthMap[agent.month];
      switch (metricsType.value){
         case "targetShipok":
              agent.team = fetchTeamTargetShipok(agent.team_id)
              agent.evaluation = true
              await useManageSalesStore.updateAgentTarget(agent.agent_id, route.query, agent )
      
              fetchSalesAgentsEvaluation(route.query)
             break
       case "feedback_admin":
            agent.admin_id = currentUser.login_id 
            agent.admin_dbname = currentUser.db_name
            agent.admin_role = currentUser.role
            agent.date =  `${agent.year}-${monthNumber.toString().padStart(2, '0')}-28`
            await useFeedbackStore.addUpdateDeleteFeedback(agent.agent_id, agent, 'admin', route.query, 'PUT')
      
            fetchSalesAgentsEvaluation(route.query)
          break
       case "feedback_qa":  
            agent.qa_id = currentUser.login_id 
            agent.qa_dbname = currentUser.db_name
            agent.role = currentUser.role   
            agent.date =  `${agent.year}-${monthNumber.toString().padStart(2, '0')}-28`  
             agent.feedback_score = agent.feedback  // assign feedback value to feedback_score because the qa feedback  is save as feedback_score
            await useFeedbackStore.addUpdateDeleteFeedback(agent.agent_id, agent, 'qa', route.query, 'PUT')
            fetchSalesAgentsEvaluation(route.query)
          break
        case "deduction":
             if(Number(agent.deduction) == 0){
              alert('Deduction must be greater than zero(0)')
              return
            }
             agent.evaluation = true
             await useManageSalesStore.addUpdateDeleteDeduction(agent.agent_id, agent, route.query, 'PUT')
             fetchSalesAgentsEvaluation(route.query)  
          break                  
        default:
          console.log("Unknow Metircs type");
          break;

       } 
    
        
    }

        const deleteDataAgent = async(totalRecords,agent) => {
          const monthNumber = monthMap[agent.month];
          switch (metricsType.value){
            case "targetShipok":
                  await useManageSalesStore.updateAgentTarget(agent.agent_id,  route.query, agent )
                  fetchSalesAgentsEvaluation(route.query)
              break  
            case "newDeposit":   
                  //  alert(agent.agent_id)
                  agent.evaluation = true
                  agent.total_records = totalRecords
                  await useManageSalesStore.deleteAgentNewDeposit(agent.agent_id,  route.query, agent )
                   fetchSalesAgentsEvaluation(route.query)
              break 
          case "absence":
          case "tardiness":
          case "memo":     
              agent.evaluation = true
              agent.total_records = totalRecords
              agent.date =  `${agent.year}-${monthNumber.toString().padStart(2, '0')}-01`
              await useManageSalesStore.deleteAgentAttendanceType(agent.agent_id, route.query, metricsType.value, agent)
              fetchSalesAgentsEvaluation(route.query)
            break
          case "deduction":
              agent.evaluation = true
              await useManageSalesStore.addUpdateDeleteDeduction(agent.agent_id, agent, route.query, 'DELETE')
              fetchSalesAgentsEvaluation(route.query)
                                     
            default:
              console.log("Unknow Metircs type");
              break;

          } 
        
        
    }



    const today = new Date()
    const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

   
   

   const fetchSalesAgentsEvaluation = (query) => {
    useManageSalesStore.fetchSalesEvaluation(query) 
   };


  const config = useRuntimeConfig()
  


  const submitSalesEvaluation = async (agent) => {
    // if (agent.submitted === 0 && agent.ready_to_submit) {
    //   agent.submitted = 1; // Mark as submitted
    // } else if (agent.submitted === 1) {
    //   agent.submitted = 0; // Toggle back (just for demo)
    // }

      if(currentUser.role != 'admin' && currentUser.login_type != 'standarduser'){
        alert('No allowed to submit Sales Evaluation')
        return
     }
    
    await useManageSalesStore.submitSalesEvaluation(agent.id, {
        agent_id: agent.id,
        agent_dbname: agent.db_name,
        month: agent.eval_month,
        year: agent.eval_year,
        date: date,
        submitted: 1
    });
  }

const submitAllSalesEvaluation = async() => {
    if(currentUser.role != 'admin' && currentUser.login_type != 'standarduser'){
      alert('No allowed to submit Sales Evaluation')
      return
    }
    agents.value.forEach(agent => {
      if (agent.ready_to_submit && agent.submitted === 0) {
        agent.submitted = 1;
      }
    });

    const payload = agents.value.map(agent => ({
          agent_id: agent.id,
          agent_dbname: agent.db_name,
          month: agent.eval_month,
          year: agent.eval_year,
          date: date,
          submitted: 1
      }));

      await useManageSalesStore.submitSalesEvaluation('all', payload
  );
};



const reviewAllSalesEvaluation = async() => {
   if(currentUser.role != 'admin' && currentUser.login_type != 'standarduser'){
        alert('No allowed to review Sales Evaluation')
        return
     }

   // Call the store action to review sales evaluation
   await useManageSalesStore.reviewSalesEvaluation('all', {
       month: agents.value[0].eval_month,
       year: agents.value[0].eval_year
   });
};



const  reviewSalesEvaluation = async (agent) => {

   if(currentUser.role != 'admin' && currentUser.login_type != 'standarduser'){
        alert('No allowed to review Sales Evaluation')
        return
     }

   // Call the store action to review sales evaluation
   await useManageSalesStore.reviewSalesEvaluation(agent.id, {
       month: agent.eval_month,
       year: agent.eval_year
   });
}



const openModal = ( data) => {
    
        showModal.value = true;
   
        modalData.value = data;
      };
      
      const closeModal = () => {
        showModal.value = false;
        
      };      

 
  onMounted(() => {
    fetchSalesAgentsEvaluation(route.query);
  
  });
  


  

  const agents = computed(() => useManageSalesStore.state.salesAgentEvaluation);

  const totalPages = computed(() =>
    Math.ceil(agents.value.length / itemsPerPage)
  )
  
  const paginatedAgents = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return agents.value.slice(start, end);
  });

// Computed: enable button only if all agents are ready
  const canSubmitAll = computed(() => {
    // only true if ALL agents are ready_to_submit
const agentReadyToSubmit = agents.value
  .filter(agent => agent.agent_type != 3)
  .map(agent => agent.ready_to_submit);
    return agents.value.length > 0 &&  agentReadyToSubmit.every(Boolean)
  });

  const submittedAll = computed(() => {
    // true if all agents have been submitted

    const agentIsAllSubmitted = agents.value.filter(agent => agent.agent_type !=3).map(agent => agent.submitted)
    return agents.value.length > 0 && agentIsAllSubmitted.every(submitted => submitted === 1)
  });

   


 watch(route, (newRoute) => {
   fetchSalesAgentsEvaluation(newRoute.query);

});

  </script>
  