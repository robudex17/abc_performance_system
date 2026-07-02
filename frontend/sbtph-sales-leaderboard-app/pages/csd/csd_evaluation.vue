<template>
  <!-- <div class=" bg-gradient-to-r from-blue-50 to-blue-100 min-h-screen p-4 mt-20"> -->
  <div class="p-4 mt-20">
    <!-- Loading Spinner -->
    <div v-if="csdStoreInstance.state.loading">
      <spinner></spinner>
    </div>
  
   
   
    <div >

        <h1 class="text-3xl font-extrabold text-gray-800 mb-6 text-center">Customer Service Performance Evaluation</h1>
        <!-- Agents Table -->
       <div class="relative overflow-x-auto overflow-y-auto max-h-[80vh] shadow-xl rounded-lg">
          <table class="min-w-max table-auto border-collapse bg-white">
            <!-- Table Head -->
                <thead>
          
        
                <tr class="bg-gradient-to-r from-blue-200 to-blue-300 text-gray-800">
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">ID</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Name</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Employee Status</th>
                     <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Extension</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Position</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Team</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Month</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Year</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border"  >Performance</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Absences</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border ">Tardiness</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Memo</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Feedback (Admin)</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Feedback(AGENTS)</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border ">Feedback(TL)</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border  ">Feedback(AM)</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border  ">Feedback(M)</th>
                   
                     <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Submit</th>
             
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
                     {{ agent.extension }}
                    </td>
                    <td class="py-0.5 px-4 text-left text-xs font-medium text-gray-700 border">
                     {{ agent.position_name }}
                    </td>

                    <td class="py-0.5 px-4 text-left text-xs font-medium text-gray-700 border">
                     {{ agent.team_name }}
                    </td>                                     
                    <td class="py-0.5 px-4 text-left text-xs font-medium text-gray-700 border">
                    {{ agent.month }}
                    </td>
                    <td class="py-0.5 px-4 text-left text-xs font-medium text-gray-700 border">
                    {{ agent.year }}
                    </td>
    
                    <td class="py-0.5 px-4 text-left text-lg font-medium text-gray-700 border" :class="agent.performance_score == 0 ?  'text-red-700': ''" >
                        {{ agent.performance_score === 0 ? 'NOT YET SUBMITTED' : agent.performance_score }} 
                       
                   </td>
                  

                  <CSDTooltipCell :title="agent.db_name" class="text-blue-700">
                     <button  @click="openMetricsTypeModal({ year_month: agent.year_month,employee_status: agent.employee_status, eval_submitted: agent.eval_submitted, employee_id: agent.id, db_name: agent.db_name, month: agent.month, year: agent.year, position_id: agent.position_id, position_name: agent.position_name, team_id:agent.team_id,absences:agent.absences,image_link: agent.image_link,eval_type: 'absences' })" >
                        {{ agent.absences }}
                    </button>
                   </CSDTooltipCell>

         

                   
                  <CSDTooltipCell :title="agent.db_name" class="text-blue-700">
                    
                      <button  @click="openMetricsTypeModal({ year_month: agent.year_month,employee_status: agent.employee_status, eval_submittedsubmitted: agent.eval_submitted, employee_id: agent.id, db_name:agent.db_name, month: agent.month, year: agent.year, position_id: agent.position_id, position_name: agent.position_name, team_id:agent.team_id, 
                        tardiness: agent.tardiness,image_link: agent.image_link, eval_type: 'tardiness' })" >
                          {{ agent.tardiness }}
                      </button>
                  </CSDTooltipCell> 
                    

                   <CSDTooltipCell :title="agent.db_name" class="text-blue-700">
                    
                      <button  @click="openMetricsTypeModal({ year_month: agent.year_month, employee_status: agent.employee_status, submitted: agent.submitted, employee_id: agent.id, db_name:agent.db_name, month: agent.month, year: agent.year, position_id: agent.position_id, position_name: agent.position_name, team_id:agent.team_id, 
                        memo: agent.memo,   image_link: agent.image_link, eval_type: 'memo' })" >
                          {{ agent.memo }}
                      </button>
                    </CSDTooltipCell>  

            

                    <CSDTooltipCell :title="agent.db_name" class="text-blue-700">
                      <button  @click="openMetricsTypeModal({ year_month: agent.year_month, employee_status: agent.employee_status, submitted: agent.submitted, employee_id: agent.id, db_name:agent.db_name, month: agent.month, year: agent.year, position_id: agent.position_id, position_name: agent.position_name, team_id:agent.team_id, 
                        feedback_by_admin: parseFloat(agent.feedback_by_admin),
                        image_link: agent.image_link, eval_type: 'feedback_by_admin' })" >
                          {{ agent.feedback_by_admin }}
                      </button>
                    </CSDTooltipCell>  

            
                   <CSDTooltipCell :title="agent.db_name" class="text-blue-700">
                      <button  @click="openMetricsTypeModal({ year_month: agent.year_month, employee_status: agent.employee_status, submitted: agent.submitted, employee_id: agent.id, db_name:agent.db_name, month: agent.month, year: agent.year, position_id: agent.position_id, position_name: agent.position_name, team_id:agent.team_id, 
                        missed_calls: agent.missed_calls,  total_missed_calls: agent.total_missed_calls,
                        image_link: agent.image_link, eval_type: 'feedback_agents' })" >
                          {{ agent.feedback_agents }}
                      </button>
                    </CSDTooltipCell>  

                       
                   <CSDTooltipCell :title="agent.db_name" class="text-blue-700">
                      <button  @click="openMetricsTypeModal({ year_month: agent.year_month, employee_status: agent.employee_status, submitted: agent.submitted, employee_id: agent.id, db_name:agent.db_name, month: agent.month, year: agent.year, position_id: agent.position_id, position_name: agent.position_name, team_id:agent.team_id, 
                        opening_hc : agent.opening_hc, closing_hc: agent.closing_hc,  no_of_resignation: agent.no_of_resignation,
                        image_link: agent.image_link, eval_type: 'feedback_tl' })" >
                          {{ agent.feedback_tl }}
                      </button>
                    </CSDTooltipCell> 


             
                   <CSDTooltipCell :title="agent.db_name" class="text-blue-700">
                      <button  @click="openMetricsTypeModal({ year_month: agent.year_month, employee_status: agent.employee_status, submitted: agent.submitted, employee_id: agent.id, db_name:agent.db_name, month: agent.month, year: agent.year, position_id: agent.position_id, position_name: agent.position_name, team_id:agent.team_id, 
                        opening_hc : agent.opening_hc, closing_hc: agent.closing_hc,  no_of_resignation: agent.no_of_resignation,
                        image_link: agent.image_link, eval_type: 'feedback_am' })" >
                          {{ agent.feedback_am }}
                      </button>
                    </CSDTooltipCell> 

                  <CSDTooltipCell :title="agent.db_name" class="text-blue-700">
                      <button  @click="openMetricsTypeModal({ year_month: agent.year_month, employee_status: agent.employee_status, submitted: agent.submitted, employee_id: agent.id, db_name:agent.db_name, month: agent.month, year: agent.year, position_id: agent.position_id, position_name: agent.position_name, team_id:agent.team_id, 
                        opening_hc : agent.opening_hc, closing_hc: agent.closing_hc,  no_of_resignation: agent.no_of_resignation,
                        image_link: agent.image_link, eval_type: 'feedback_manager' })" >
                          {{ agent.feedback_manager }}
                      </button>
                 </CSDTooltipCell>                     
             
  

                   
                    <!-- Actions -->
                    <td class="py-0.5 px-4 text-center border" >
                      <div class="flex justify-center space-x-2" v-if="agent.position_level == 9">

                    <!-- Submit All button -->
                              <button
                                v-if="!submittedAll"
                                @click="submitAllPerformanceMetrics"
                                :disabled="!canSubmitAll"
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
                                @click="reviewAllPerformanceMetrics"
                                class="bg-purple-500 text-white py-0.5 px-3 rounded-lg hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                              >
                                Review 
                              </button>

                      </div>

                          <div class="flex justify-center space-x-2" v-else>

                          <!-- Submit / Submitted Button -->
                          <button
                            @click="submitPerformanceMetrics(agent)"
                          :disabled="agent.submitted == 1"
                          :class="[
                              'py-0.5 px-3 rounded-lg flex items-center gap-2 text-sm',
                              agent.submitted == 1
                              ? 'bg-gray-400 text-white cursor-not-allowed' // Already submitted
                              : 'bg-green-500 text-white hover:bg-green-600' // Ready to submit
                                   
                          ]"
                          >
                          {{ agent.submitted == 1 ? 'Submitted' : 'Submit' }}
                          </button>

                          <!-- Review Button -->
                          <button
                          v-if="agent.submitted == 1"
                          @click="reviewPerformanceMetrics(agent)"
                          class="bg-purple-500 text-white py-0.5 px-3 rounded-lg hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                          >
                          Review
                          </button>

                      </div>                    
                    </td>


                </tr>
                </tbody>     
          </table>



    <CsdEvaluation
    
      :showModal="showModalEvalType"
      :evalType="eval_type"
      :modalType="modalEvalType"
      :agentData="selectedData"
      :modalEvalTypeMessage="modalEvalTypeMessage"
      @passClose="resetValues"
      @passAddDataAgent="addDataAgent"
       @passEditDataAgent="editDataAgent"
      @passDeleteDataAgent="deleteDataAgent"
    />

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
            @click="submitAllPerformanceMetrics"
            
            class="'py-2 px-6 rounded-lg text-lg font-semibold transition-colors bg-blue-500 text-white hover:bg-blue-600"
            
             
            
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
            @click="reviewAllPerformanceMetrics"
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
    middleware: ['auth', 'adminmanager'],
    layout: 'csd'
  })
  
  import { ref, computed } from 'vue';
  import { onMounted } from 'vue';

  import { months, monthMap, isFutureMonth, getDescriptionColor, getColorByValue } from '@/utils/constants'

  import CsdEvaluation  from '~/components/csd/CsdEvaluation.vue';

  import  CSDTooltipCell  from  '~/components/csd/CsdTooltipCell';


   
  const router = useRouter();
  const route = useRoute();
  

  
  //get the current user
    const authStore = useAuthStore()
    authStore.fetchTokenFromLocalStore()
  
    const currentUser = authStore.state.user 

    const showModal = ref(false)

    const showModalEvalType = ref(false);
    const modalEvalType = ref('add');
    const  modalEvalTypeMessage = ref([])

    const selectedData = ref({})
    const eval_type = ref("")


    const modalData = ref("")


    const itemsPerPage = 10;
    const currentPage = ref(1);
    const isModalOpen = ref(false);
    const isModalOpenForLogin = ref(false)
    const  enablePasswordRecovery = ref(false)
    const editMode = ref(false); // Toggle between Add and Edit mode
    const editLoginMode = ref(false); // Toggle between Add and Edit mode for login
    const imagePreview = ref(null);
    const yearMoonth = ref('')


  const csdStoreInstance= useCsdStore()
      
  const openMetricsTypeModal = (selectedAgent) => {
    
  eval_type.value = selectedAgent.eval_type

    

     if(selectedAgent.eval_submitted ==1 ){
        alert(`Adding, Updating, or Deleting ${eval_type.value} that is already submitted is prohibited.`)
        return
      }

   
      if(selectedAgent.employee_status == 'Resigned' ){
        alert(`Adding, Updating, or Deleting Agent that is already resigned is prohibitted.`)
        return
      }

      
      if(selectedAgent.performance_score == 0 ){
        alert(`Performance is not yet submit for ${selectedAgent.db_name}`)
        return
      }

      if(isFutureMonth(selectedAgent.year_month)){
        alert(`Adding, Updating, or Deleting ${eval_type.value} for future month is prohibitted.`)
        return
      }
     
      switch(eval_type.value){
          case "absences":
        
            if(currentUser.role != 'admin' ){
               alert(`Not allowed to perform change on ${eval_type.value}`)
              return
            }
              modalEvalTypeMessage.value = [ `Add ${eval_type.value}`, `Edit ${eval_type.value} `]
         

          if (selectedAgent.absences > 0) {
             modalEvalType.value = 'edit';
          }

            showModalEvalType.value = true
            selectedData.value = selectedAgent
            break
          case "tardiness":

            if(currentUser.role != 'admin' &&  ![10, 9].includes(currentUser.position_level)){
               alert(`Not allowed to perform change on ${eval_type.value}`)
              return
            }
              modalEvalTypeMessage.value = [ `Add ${eval_type.value}`, `Edit ${eval_type.value} `]

              
            if (selectedAgent.tardiness > 0) {
               modalEvalType.value = 'edit';
            }

   
             showModalEvalType.value = true
             selectedData.value = selectedAgent          
            break

          case "memo":

            if(currentUser.role != 'admin' &&  ![10, 9].includes(currentUser.position_level)){
               alert(`Not allowed to perform change on ${eval_type.value}`)
              return
            }
              modalEvalTypeMessage.value = [ `Add ${eval_type.value}`, `Edit ${eval_type.value} `]
  
            if (selectedAgent.memo > 0) {
               modalEvalType.value = 'edit';
            }
 
            showModalEvalType.value = true
            selectedData.value = selectedAgent          
            break 
            
          case "feedback_by_admin":

            if(currentUser.role != 'admin' &&  ![10, 9].includes(currentUser.position_level)){
               alert(`Not allowed to perform change on ${eval_type.value}`)
              return
            }
              modalEvalTypeMessage.value = [ `Add ${eval_type.value}`, `Edit ${eval_type.value} `]
  
            if (selectedAgent.feedback_by_admin > 0) {
               modalEvalType.value = 'edit';
            }
 
            showModalEvalType.value = true
            selectedData.value = selectedAgent          
            break             
            
          default:
          console.log("Unknown Evaluation type");
          break;
      }

    }

    const resetValues   = () => {
           showModalEvalType.value = false
          modalEvalType.value = 'add'
          eval_type.value = ''
          modalEvalTypeMessage.value = []
      }
    
     const addDataAgent = async(agent) => {

      switch (eval_type.value){

        case  "absences": 
              if(agent.absences == ''  || agent.absences == 0){
                alert('Average response minutes cannot be empty Or 0')
                return
              }
          
            await  csdStoreInstance.addCsdPerformanceMetricsOrEvaluation(agent.employee_id, 'absences',  'evaluation',route.query, {new_count: agent.new_count})
            fetchCsdOrEvaluationPerformanceMetrics(null, 'all', 'evaluation', route.query)
            break
        case "tardiness":

            if(agent.tardiness == '' || agent.tardiness == 0 ){
              alert('Tardiness cannot be 0 or empty')
              return
            }
      
            await  csdStoreInstance.addCsdPerformanceMetricsOrEvaluation(agent.employee_id, 'tardiness', 'evaluation', route.query, {new_count: agent.new_count})
            fetchCsdOrEvaluationPerformanceMetrics(null, 'all', 'evaluation', route.query)
            break 
          case "memo":

              if(agent.memo == '' || agent.memo == 0){
                alert('Memo cannot be 0 or empty')
                return
              }
          
            await  csdStoreInstance.addCsdPerformanceMetricsOrEvaluation(agent.employee_id, 'memo', 'evaluation', route.query, { new_count: agent.new_count})
            fetchCsdOrEvaluationPerformanceMetrics(null, 'all', 'evaluation', route.query)
            break   

          case "feedback_by_admin":
            if(agent.feedback_by_admin == '' || agent.feedback_by_admin == 0){
              alert(`${eval_type.value} cannot be 0 or empty`)
              return
            }  
         
          
            await  csdStoreInstance.addCsdPerformanceMetricsOrEvaluation(agent.employee_id, eval_type.value , 'evaluation', route.query, agent)
            fetchCsdOrEvaluationPerformanceMetrics(null, 'all', 'evaluation', route.query)
            break   
            

              if (
              agent.calibration_not_good === '' || agent.calibration_just_ok === '' || agent.calibration_awesome === ''
            ) {
              alert('Call Email Calibration fields cannot be empty')
              return
            }

            await  csdStoreInstance.addCsdPerformanceMetrics(agent.employee_id, 'call_email_calibration', route.query, { calibration_not_good: agent.calibration_not_good, calibration_just_ok: agent.calibration_just_ok, calibration_awesome: agent.calibration_awesome})
            fetchCsdOrEvaluationPerformanceMetrics(null, 'all', 'evaluation', route.query)
            break            
        
        default:
            console.log("Unknow Evaluation type");
            break;

      }
  
  
    }

    const editDataAgent = async(agent) => {
      switch (eval_type.value){
        case  "absences": 
        case "tardiness":
        case "memo":
        
          await  csdStoreInstance.updateCsdPerformanceMetricsOrEvaluation(agent.employee_id, eval_type.value, 'evaluation', route.query, {new_count: agent.new_count})
          fetchCsdOrEvaluationPerformanceMetrics(null, 'all', 'evaluation', route.query)
          break

        case "feedback_by_admin":
           
          await  csdStoreInstance.updateCsdPerformanceMetricsOrEvaluation(agent.employee_id, eval_type.value, 'evaluation', route.query, agent)
          fetchCsdOrEvaluationPerformanceMetrics(null, 'all', 'evaluation', route.query)
          break    

        default:
          console.log("Unknow Evaluation type");
          break;

       } 
    
        
    }

        const deleteDataAgent = async(agent) => {
          switch (eval_type.value){
          case "absences":
          case "tardiness":
          case "memo":  
          case "feedback_by_admin":   
              await  csdStoreInstance.deleteCsdPerformanceMetricsOrEvaluation(agent.employee_id, eval_type.value, 'evaluation', route.query, {employee_id:agent.employee_id})
             fetchCsdOrEvaluationPerformanceMetrics(null, 'all', 'evaluation', route.query)
            break
          case "deduction":
              agent.evaluation = true
              await useManageSalesStore.addUpdateDeleteDeduction(agent.agent_id, agent, route.query, 'DELETE')
              fetchSalesAgentsEvaluation(null, 'all', route.query)
                                     
            default:
              console.log("Unknow Metircs type");
              break;

          } 
        
        
    }


    const today = new Date()
    const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

   const fetchCsdOrEvaluationPerformanceMetrics= (employee_id, entity_type, entity, query) => {
     csdStoreInstance.fetchCsdOrEvaluationPerformanceMetrics( employee_id, entity_type, entity, query)

    
   }
  const config = useRuntimeConfig()
  


     const submitPerformanceMetrics = async (agent) => {
    // if (agent.submitted === 0 && agent.ready_to_submit) {
    //   agent.submitted = 1; // Mark as submitted
    // } else if (agent.submitted === 1) {
    //   agent.submitted = 0; // Toggle back (just for demo)
    // }

      if(currentUser.role != 'admin' ){
        alert('No allowed to submit CSD Performance Metrics')
        return
     }
    
    await csdStoreInstance.submitPerformanceMetricsOrEvaluation(agent.id, {
        agent_id: agent.id,
        dbname: agent.db_name,
        year_month: agent.year_month,
        submitted: 1
    }, 'metrics', {year_month: agent.year_month});
  }

const submitAllPerformanceMetrics = async() => {
    if(currentUser.role != 'admin' && currentUser.login_type != 'standarduser'){
      alert('No allowed to submit Performance Metrics')
      return
    }
    agents.value.forEach(agent => {
      if (agent.submitted === 0) {
        agent.submitted = 1;
      }
    });

    const payload = agents.value.map(agent => ({
          employee_id: agent.id,
          dbname: agent.db_name,
          year_month: agent.year_month,
          submitted: 1
      }));

      await csdStoreInstance.submitPerformanceMetricsOrEvaluation('all', payload, 'metrics', {year_month: payload[0].year_month}
  );
};



const reviewAllPerformanceMetrics = async() => {
   if(currentUser.role != 'admin' && currentUser.login_type != 'standarduser'){
        alert('No allowed to review Sales Evaluation')
        return
     }

   // Call the store action to review sales evaluation
   await csdStoreInstance.reviewPerformanceMetricsOrEvaluation('all', {
       year_month: agents.value[0].year_month
   }, 'metrics', { year_month: agents.value[0].year_month});
};



const  reviewPerformanceMetrics = async (agent) => {

   if(currentUser.role != 'admin' && currentUser.login_type != 'standarduser'){
        alert('No allowed to review Performance Metrics')
        return
     }

   // Call the store action to review sales evaluation
   await csdStoreInstance.reviewPerformanceMetricsOrEvaluation(agent.id, {
      year_month : agent.year_month
   },'metrics', {year_month : agent.year_month});
}



const openModal = ( data) => {
    
        showModal.value = true;
   
        modalData.value = data;
      };
      
      const closeModal = () => {
        showModal.value = false;
        
      };   
      
      

  onMounted(() => {
    // no employee_id and query all metrics
    
    fetchCsdOrEvaluationPerformanceMetrics(null, 'all', 'evaluation', route.query)
  
  });
  


  

 const agents = computed(() => csdStoreInstance.state.csdEvaluation);

 

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
      .filter(agent => agent.position_level !=9)
      .map(agent => agent.submitted);
        return agents.value.length > 0 &&  agentReadyToSubmit.every(Boolean)
  });

  const submittedAll = computed(() => {
    // true if all agents have been submitted

    const agentIsAllSubmitted = agents.value.filter(agent => agent.position_level != 9).map(agent => agent.submitted)
    return agents.value.length > 0 && agentIsAllSubmitted.every(submitted => submitted === 1)
  });



   


 watch(route, (newRoute) => {
   // no employee_id and query all metrics
   fetchCsdOrEvaluationPerformanceMetrics(null, 'all', 'evaluation', newRoute.query);

});

  </script>
  