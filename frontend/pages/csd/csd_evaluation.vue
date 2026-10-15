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
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Immediate Head</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Team</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Month</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Year</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border"  >Performance</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Leadership Performance</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Absences</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border ">Tardiness</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Memo</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Feedback (Admin)</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border">Feedback(QA)</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border ">Feedback(Immediate Head)</th>
                    <th class="py-0.5 px-4 text-center text-xs font-bold text-green-900 border  ">Feedback(Members)</th>
                    
                   
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
                     {{ agent.manager_dbname }}
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
    
                    <!-- <td class="py-0.5 px-4 text-left text-lg font-medium text-gray-700 border" :class="agent.performance_score == 0 ?  'text-red-700': ''" >
                        {{ agent.performance_score === 0 ? 'NOT YET SUBMITTED' : agent.performance_score }} 
                       
                   </td> -->

                  <CSDTooltipCell :title="agent.db_name" class="text-blue-700">
                     <button v-if="!agent.performance_computed"  @click="openMetricsTypeModal({ year_month: agent.year_month,employee_status: agent.employee_status, eval_submitted: agent.eval_submitted, employee_id: agent.id, db_name: agent.db_name, month: agent.month, year: agent.year, position_id: agent.position_id, position_name: agent.position_name, team_id:agent.team_id,performance:agent.performance,image_link: agent.image_link,eval_type: 'performance' })" >
                        {{ agent.performance }}
                    </button>
                    <!-- the performance of the assistant team leaders, team leaders, assistant managers and the CSD & Collection Manager is the
                         average of their subordinates (the ones with a performance of 0 are not counted): it is not typed, so it is not
                         clickable. The title shows the subordinates and their values. -->
                    <span
                      v-else
                      class="font-medium text-gray-700 cursor-pointer"
                      :class="agent.performance > 0 ? '' : 'text-red-500 font-bold'"
                      @click="alertComputedPerformance(agent)"
                      :title="(agent.performance_sources || []).map(source => source.db_name + ' (' + source.department_code + '): ' + (source.counted ? source.performance : 'not counted')).join('  |  ')"
                    >{{ agent.performance }}</span>
                   </CSDTooltipCell>                   

                  <!-- Leadership Performance: VIEW ONLY, the result (1 - 5) of the leadership evaluation that the head of the leader
                       answered in the menu Leadership Performance. Only the leaders (position level 7 - 10) have it, 0 = not answered
                       yet (the leader can not be submitted). Never a popup: the answers are confidential. -->
                  <td class="py-0.5 px-4 text-center text-lg border font-medium">
                    <span v-if="!agent.leadership_required" class="text-gray-400">-</span>
                    <span
                      v-else
                      :class="agent.leadership_score > 0 ? 'text-gray-700' : 'text-red-500 font-bold'"
                      :title="(agent.leadership_by || []).map(item => item.evaluator_dbname + ': ' + item.leadership_score).join('  |  ')"
                    >{{ agent.leadership_score > 0 ? Number(agent.leadership_score).toFixed(2) : 0 }}</span>
                  </td>
                  

                  <CSDTooltipCell :title="agent.db_name" class="text-blue-700">
                     <button  @click="openMetricsTypeModal({ year_month: agent.year_month,employee_status: agent.employee_status, eval_submitted: agent.eval_submitted, employee_id: agent.id, db_name: agent.db_name, month: agent.month, year: agent.year, position_id: agent.position_id, position_name: agent.position_name, team_id:agent.team_id,absences:agent.absences,image_link: agent.image_link,eval_type: 'absences' })" >
                        {{ agent.absences }}
                    </button>
                   </CSDTooltipCell>

         

                   
                  <CSDTooltipCell :title="agent.db_name" class="text-blue-700">
                    
                      <button  @click="openMetricsTypeModal({ year_month: agent.year_month,employee_status: agent.employee_status, eval_submitted: agent.eval_submitted, employee_id: agent.id, db_name:agent.db_name, month: agent.month, year: agent.year, position_id: agent.position_id, position_name: agent.position_name, team_id:agent.team_id, 
                        tardiness: agent.tardiness,image_link: agent.image_link, eval_type: 'tardiness' })" >
                          {{ agent.tardiness }}
                      </button>
                  </CSDTooltipCell> 
                    

                   <CSDTooltipCell :title="agent.db_name" class="text-blue-700">
                    
                      <button  @click="openMetricsTypeModal({ year_month: agent.year_month, employee_status: agent.employee_status, eval_submitted: agent.eval_submitted, employee_id: agent.id, db_name:agent.db_name, month: agent.month, year: agent.year, position_id: agent.position_id, position_name: agent.position_name, team_id:agent.team_id, 
                        memo: agent.memo,   image_link: agent.image_link, eval_type: 'memo' })" >
                          {{ agent.memo }}
                      </button>
                    </CSDTooltipCell>  

            

                    <CSDTooltipCell :title="agent.db_name" class="text-blue-700">
                      <button  @click="openMetricsTypeModal({ year_month: agent.year_month, employee_status: agent.employee_status, eval_submitted: agent.eval_submitted, employee_id: agent.id, db_name:agent.db_name, month: agent.month, year: agent.year, position_id: agent.position_id, position_name: agent.position_name, team_id:agent.team_id, 
                        feedback_by_admin: parseFloat(agent.feedback_by_admin),
                        image_link: agent.image_link, eval_type: 'feedback_by_admin' })" >
                          {{ agent.feedback_by_admin }}
                      </button>
                    </CSDTooltipCell>  

            
                    <!-- Feedback (QA), Feedback (Immediate Head), Feedback (Members): VIEW ONLY.
                         They are given by the Quality Analyst, the immediate head and the members, the admin can not change them.
                         Like the sales evaluation: the number is a button that opens the list of the people who should give the
                         feedback; the ones who did not give yet are marked "No Feedback Yet". -->
                    <td class="py-0.5 px-4 text-center text-lg border font-medium">
                      <span v-if="!receivesQaFeedback(agent)" class="text-gray-400">-</span>
                      <!-- the average, or 0 when nobody gave it yet. Clickable: the list shows who gave it and who did not yet -->
                      <button
                        v-else
                        class="underline"
                        :class="agent.feedback_by_qa ? 'text-blue-700' : 'text-red-500 font-bold'"
                        @click="openModal(agent.feedback_by_qa_list, `Feedback (QA) of ${agent.db_name}`, 'No Quality Analyst found')"
                      >
                        {{ agent.feedback_by_qa ?? 0 }}
                      </button>
                    </td>

                    <td class="py-0.5 px-4 text-center text-lg border font-medium">
                      <span v-if="!receivesImmediateHeadFeedback(agent)" class="text-gray-400">-</span>
                      <!-- the average, or 0 when nobody gave it yet. Clickable: the list shows who gave it and who did not yet -->
                      <button
                        v-else
                        class="underline"
                        :class="agent.feedback_by_immediate_head ? 'text-blue-700' : 'text-red-500 font-bold'"
                        @click="openModal(agent.feedback_by_immediate_head_list, `Feedback (Immediate Head) of ${agent.db_name}`, 'No immediate head found')"
                      >
                        {{ agent.feedback_by_immediate_head ?? 0 }}
                      </button>
                    </td>

                    <td class="py-0.5 px-4 text-center text-lg border font-medium">
                      <span v-if="!receivesMembersFeedback(agent)" class="text-gray-400">-</span>
                      <!-- the average, or 0 when nobody gave it yet. Clickable: the list shows who gave it and who did not yet -->
                      <button
                        v-else
                        class="underline"
                        :class="agent.feedback_by_members ? 'text-blue-700' : 'text-red-500 font-bold'"
                        @click="openModal(agent.feedback_by_members_list, `Feedback (Members) of ${agent.db_name}`, 'No members found')"
                      >
                        {{ agent.feedback_by_members ?? 0 }}
                      </button>
                    </td>

                                     
                    <!-- Actions: Submit / Submitted + Review. The row of the CSD & Collection Manager (position level 10) is the Submit All -->
                    <td class="py-0.5 px-4 text-center border" >
                      <div class="flex justify-center space-x-2" v-if="agent.position_level == 10">

                        <!-- Submit All: only when every row (his own too) is ready -->
                        <button
                          v-if="!submittedAll"
                          @click="submitAllEvaluation"
                          :disabled="!canSubmitAll"
                          :class="[
                            'py-0.5 px-3 rounded-lg flex items-center gap-2 text-sm',
                            canSubmitAll
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : 'bg-gray-400 text-white cursor-not-allowed'
                          ]"
                        >
                          Submit
                        </button>

                        <!-- Submitted All (disabled + gray) -->
                        <button
                          v-else
                          disabled
                          class="bg-gray-400 text-white cursor-not-allowed text-sm rounded-lg px-3"
                        >
                          Submitted
                        </button>

                        <!-- Review All (purple) -->
                        <button
                          v-if="submittedAll"
                          @click="reviewAllEvaluation"
                          class="bg-purple-500 text-white py-0.5 px-3 rounded-lg hover:bg-purple-600 text-sm"
                        >
                          Review
                        </button>
                      </div>

                      <div class="flex justify-center space-x-2" v-else>

                        <!-- Submit / Submitted: green only when Performance is not 0 and at least one Feedback has a value -->
                        <button
                          @click="submitEvaluation(agent)"
                          :disabled="agent.submitted == 1 || !agent.ready_to_submit"
                          :class="[
                            'py-0.5 px-3 rounded-lg flex items-center gap-2 text-sm',
                            agent.submitted != 1 && agent.ready_to_submit
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : 'bg-gray-400 text-white cursor-not-allowed'
                          ]"
                        >
                          {{ agent.submitted == 1 ? 'Submitted' : 'Submit' }}
                        </button>

                        <!-- Review -->
                        <button
                          v-if="agent.submitted == 1"
                          @click="reviewEvaluation(agent)"
                          class="bg-purple-500 text-white py-0.5 px-3 rounded-lg hover:bg-purple-600 text-sm"
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
              {{ feedbackModalTitle }}
            </h2>
            <button 
              @click="closeModal" 
              class="text-white hover:text-gray-200 transition"
            >
              ✕
            </button>
          </div>



          <!-- Body: who gave the feedback and who did not give yet (view only) -->
          <div class="bg-gray-50 p-6 max-h-[70vh] overflow-y-auto overflow-x-hidden">
            <p v-if="modalData.length > 0" class="mb-3 text-sm text-gray-700">
              <span class="font-bold">{{ givenCount }}</span> of <span class="font-bold">{{ modalData.length }}</span> gave feedback<span v-if="givenCount < modalData.length">, <span class="font-bold text-red-500">{{ modalData.length - givenCount }}</span> did not give yet</span>.
            </p>
            <table class="min-w-full table-fixed border-collapse">
              <thead>
                <tr class="bg-gray-200 text-gray-700" v-if="modalData.length > 0">
                  <th class="w-1/4 px-4 py-2 text-left font-semibold">Feedback By</th>
                  <th class="w-1/6 px-4 py-2 text-left font-semibold">Month</th>
                  <th class="w-1/6 px-4 py-2 text-left font-semibold">Year</th>
                  <th class="w-1/6 px-4 py-2 text-center font-semibold">Feedback Score</th>
                </tr>
              </thead>
              <tbody v-if="modalData.length > 0">
                <tr v-for="data in modalData" :key="data.who_give_feedback_id" class="border-b hover:bg-gray-100 transition">
                  <td class="px-4 py-3">
                    <div class="flex items-center space-x-3">
                      <img
                        v-if="data.image_link"
                        :src="updateImageLink(data.image_link)"
                        alt="Employee Image"
                        class="w-10 h-10 rounded-full object-cover border"
                      />
                      <span class="font-medium text-gray-800">{{ data.who_give_feedback_name }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-3 font-semibold">{{ data.month }}</td>
                  <td class="px-4 py-3 font-semibold">{{ data.year }}</td>
                  <td class="border px-4 py-2 text-center">
                    <span v-if="parseFloat(data.feedback_score) > 0" class="text-gray-800 font-medium">
                      {{ Number(data.feedback_score).toFixed(4) }}
                    </span>
                    <span v-else class="text-red-500 italic font-semibold">No Feedback Yet</span>
                  </td>
                </tr>
              </tbody>
              <tbody v-else>
                <tr>
                  <td class="px-4 py-3 text-red-500 font-bold">{{ modalEmptyMessage }}</td>
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
          <button
            v-if="!submittedAll"
            @click="submitAllEvaluation"
            :disabled="!canSubmitAll"
            :class="[
              'py-2 px-6 rounded-lg text-lg font-semibold transition-colors',
              canSubmitAll ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-400 text-white cursor-not-allowed'
            ]"
          >
            Submit All
          </button>

          <button
            v-else
            disabled
            class="py-2 px-6 rounded-lg text-lg font-semibold bg-gray-400 text-white cursor-default"
          >
            Submitted All
          </button>

          <button
            v-if="submittedAll"
            @click="reviewAllEvaluation"
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


    const modalData = ref([])
    const feedbackModalTitle = ref('Feedback')
    const modalEmptyMessage = ref('No Feedback Yet')
    // how many of the people in the list gave their feedback (score greater than 0)
    const givenCount = computed(() => (modalData.value || []).filter(item => parseFloat(item.feedback_score) > 0).length)


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
      
  // The performance of the assistant team leaders, team leaders, assistant managers and the manager is computed
  // (the average of the subordinates): it can not be edited directly. The alert tells who is in the average.
  const alertComputedPerformance = (agent) => {
    const sources = (agent.performance_sources || [])
      .map(source => `  - ${source.db_name} (${source.department_code}): ${source.counted ? source.performance : 'not counted (0)'}`)
      .join('\n')

    alert(
      `The Performance of ${agent.db_name} cannot be edited directly.\n\n` +
      `It is the average of the Performance of the subordinates (the ones with 0 are not counted):\n${sources}`
    )
  }

  const openMetricsTypeModal = (selectedAgent) => {
    
  eval_type.value = selectedAgent.eval_type

    

     // Resigned first (can never be changed, not even after Review), then the submitted evaluation (the backend checks the same)
     if(selectedAgent.employee_status == 'Resigned' ){
        alert(`Adding, Updating, or Deleting Agent that is already resigned is prohibitted.`)
        return
      }

     if(selectedAgent.eval_submitted == 1 ){
        alert(`Adding, Updating, or Deleting ${eval_type.value} that is already submitted is prohibited.`)
        return
      }

      if(isFutureMonth(selectedAgent.year_month)){
        alert(`Adding, Updating, or Deleting ${eval_type.value} for future month is prohibitted.`)
        return
      }
     
      switch(eval_type.value){
          case "performance":
            if(currentUser.role != 'admin' &&  ![10, 9].includes(currentUser.position_level)){
               alert(`Not allowed to perform change on ${eval_type.value}`)
              return
            }
              modalEvalTypeMessage.value = [ `Add ${eval_type.value}`, `Edit ${eval_type.value} `]
           if (selectedAgent.performance > 0) {
             modalEvalType.value = 'edit';
            }

            showModalEvalType.value = true
            selectedData.value = selectedAgent
          
            break
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
        case "performance":
          
            await  csdStoreInstance.addCsdPerformanceMetricsOrEvaluation(agent.employee_id, 'performance',  'evaluation',route.query, agent)
            fetchCsdOrEvaluationPerformanceMetrics(null, 'all', 'evaluation', route.query)
            break
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
        case "performance":
          await  csdStoreInstance.updateCsdPerformanceMetricsOrEvaluation(agent.employee_id, eval_type.value, 'evaluation', route.query, agent)
          fetchCsdOrEvaluationPerformanceMetrics(null, 'all', 'evaluation', route.query)
          break
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

  // who receives each feedback (same rules as the details page of the employee):
  //  QA: the staff of position level 8 and below, immediate head: everybody but the top level 10, members: level 8 and up
  const receivesQaFeedback = (agent) => Number(agent.position_level) <= 8
  const receivesImmediateHeadFeedback = (agent) => Number(agent.position_level) < 10
  const receivesMembersFeedback = (agent) => Number(agent.position_level) >= 8

  // the images are served by the backend by filename; older rows still have a '/images/' path in front of it
  const updateImageLink = (imageLink) => {
    if (!imageLink) return ''
    if (imageLink.startsWith('data:image') || /^https?:\/\//.test(imageLink)) return imageLink
    return `${config.public.imageBaseUrl}${imageLink.split('/').pop()}`
  }
  


  // Submit / Review of the evaluation: admin only. The backend decides what is ready and what is locked,
  // the page refetches the list after each action (store.changeCsdEvaluationStatus).
  const isAdmin = () => currentUser.role == 'admin'

  const submitEvaluation = async (agent) => {
    if (!isAdmin()) return alert('Not allowed to submit the CSD Evaluation')
    await csdStoreInstance.changeCsdEvaluationStatus(agent.id, agent.year_month, 'POST', route.query)
  }

  const reviewEvaluation = async (agent) => {
    if (!isAdmin()) return alert('Not allowed to review the CSD Evaluation')
    await csdStoreInstance.changeCsdEvaluationStatus(agent.id, agent.year_month, 'DELETE', route.query)
  }

  const submitAllEvaluation = async () => {
    if (!isAdmin()) return alert('Not allowed to submit the CSD Evaluation')
    if (!canSubmitAll.value) return
    await csdStoreInstance.changeCsdEvaluationStatus('all', agents.value[0].year_month, 'POST', route.query)
  }

  const reviewAllEvaluation = async () => {
    if (!isAdmin()) return alert('Not allowed to review the CSD Evaluation')
    await csdStoreInstance.changeCsdEvaluationStatus('all', agents.value[0].year_month, 'DELETE', route.query)
  }


const openModal = ( data, title = 'Feedback', emptyMessage = 'No Feedback Yet') => {

        feedbackModalTitle.value = title
        modalEmptyMessage.value = emptyMessage
        showModal.value = true;

        modalData.value = data || [];
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

// Submit All is enabled only when every row is ready (the manager's own row too) and nothing is submitted yet
  const canSubmitAll = computed(() =>
    agents.value.length > 0 && agents.value.every(agent => agent.ready_to_submit) && !submittedAll.value
  );

  // every row is submitted
  const submittedAll = computed(() =>
    agents.value.length > 0 && agents.value.every(agent => agent.submitted == 1)
  );

 watch(route, (newRoute) => {
   // no employee_id and query all metrics
   fetchCsdOrEvaluationPerformanceMetrics(null, 'all', 'evaluation', newRoute.query);

});

  </script>
  