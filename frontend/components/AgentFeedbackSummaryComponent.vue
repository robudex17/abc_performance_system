<template>
    <div>
      <h1 class="text-2xl font-bold mb-4 text-center">Agent Feedback Information</h1>    
   
      <div class="overflow-x-auto">
      <table class="w-full table-auto border-collapse bg-white">
          <thead class="bg-gradient-to-r from-blue-300 to-blue-300 text-gray-800">
            <tr>
              <!-- <th class="py-2 px-4 text-left text-sm font-medium text-green-900">Agent ID</th> -->
              <!-- <th class="py-2 px-4 text-left text-sm font-medium text-green-900">Name</th> -->
              <!-- <th class="py-2 px-4 text-left text-sm font-medium text-green-900">Status</th> -->
              <th class="py-2 px-2 text-sm  text-center font-bold  border">Month</th>
              <th class="py-2 px-2 text-center text-sm font-bold  border">Year</th>
              <th v-if="agents[0].agent_type == 0" class="py-2 px-4 text-center text-sm font-medium ">
                   <button v-if="currentUser.login_type == 'standarduser' || currentUser.agent_type == 2"
                   @click="openModal( agentFeedbackByLm, 'agent_by_lm' )"
                    class="text-blue-600 underline hover:text-blue-800 font-bold cursor-pointer">
                      Feedback From LM
                   </button>
                   <span v-else>Feedback From LM</span>
                    
              </th>
              <th v-if="agents[0].agent_type == 1" class="py-2 px-2 text-center text-sm font-bold ">
                  <button v-if="currentUser.login_type == 'standarduser' || currentUser.agent_type == 2 "
                   class="text-blue-600 underline hover:text-blue-800 font-bold cursor-pointer"
                   @click="openModal( lmFeedbackByAgent, 'lm_by_agent' )"
                  >
                    Feedback From Agents
                  </button>
                  <span v-else>Feedback From Agents</span>
              </th>
              <th v-if="agents[0].agent_type == 1" class="py-2 px-2 text-center text-sm font-bold ">
                  <button v-if="currentUser.login_type == 'standarduser' || currentUser.agent_type == 2 "
                   class="text-blue-600 underline hover:text-blue-800 font-bold cursor-pointer"
                    @click="openModal( lmFeedbackByUm, 'lm_by_um' )"
                  >
                    Feedback From Unit Manager
                  </button>
                  <span v-else>Feedback From Unit Manager</span>
              </th>
              <th v-if="agents[0].agent_type == 2" class="py-2 px-2 text-center text-sm font-bold ">
                  <button v-if="currentUser.login_type == 'standarduser' || currentUser.agent_type == 2"
                   class="text-blue-600 underline hover:text-green-900 font-bold cursor-pointer"
                   @click="openModal( umFeedbackByLm, 'um_by_lm' )"
                  >
                    Feedback From Local Managers
                  </button>
                  <span v-else>Feedback From Local Managers</span>
              </th>
     
              <th class="py-2 px-2  text-center text-sm font-bold ">
                <button v-if="currentUser.login_type == 'standarduser' || currentUser.agent_type == 2"
                 class="text-blue-600 underline hover:text-blue-800 font-bold cursor-pointer"
                 @click="openModal( feedbackByQa, 'qa' )"
                >
                  Feedback From Qa

                </button>
                <span v-else>Feedback From Qa</span>
              </th>
              <th class="py-2 px-2 text-center text-sm font-bold">Overall Feedback</th>
              <!-- <th class="py-2 px-4 text-left text-sm font-medium text-green-900">Photo</th> -->
              <!-- <th class="py-2 px-4 text-left text-sm font-medium text-green-900 flex justify-between items-center  disabled:bg-gray-400 disabled:cursor-not-allowed">
                 <button :disabled=" currentUser.login_type != 'standarduser' || (props.overallAverageFeedback == null || props.overallAverageFeedback == '' )"
                  @click="openModal('edit')" 
                   :class="hasFeedback">
                    <font-awesome-icon icon="plus" />
                    Update
                </button>
              </th> -->
            </tr>
          </thead>
          <tbody v-if="feedbackByAdmin.length  == 0">
            <tr 
              :key="feedback.id" 
              v-for="feedback in feedbackData" 
              :class="['odd:bg-white', 'even:bg-green-50']">
              <!-- <td class="py-2 px-4 text-sm text-green-800">{{ agents[0].id }}</td>
              <td class="py-2 px-4 text-sm text-green-800 font-bold">{{ agents[0].firstname }} {{ agents[0].lastname }}</td> -->
              <!-- <td class="py-2 px-4 text-sm text-green-800">
                <span :class="['status', agents[0].status]">{{ agents[0].status }}</span>
              </td> -->
              <td class="py-2 px-2 text-sm text-center  border">
                {{ feedback.month }}
              </td>  
              <td class="py-2 px-2 text-sm text-center border">
                {{ feedback.year }}   
              </td>  
              <td  class="py-2 px-2 text-sm  text-center font-bold border"
                  :class="feedback.averageAgentFeedbackByLm && feedback.averageAgentFeedbackByLm != 0 ? 'text-green-800' : 'text-red-600'"
                  v-if="agents[0].agent_type == 0 "> {{feedback.averageAgentFeedbackByLm ?  feedback.averageAgentFeedbackByLm : 'No Feedback'}}
              </td>

              <td  class="py-2 px-2 text-sm text-center font-bold border" 
                :class=" feedback.averageLmFeedbackByAgent &&  feedbackData.averageLmFeedbackByAgent !== 0 ? 'text-green-800' : 'text-red-600'"
                v-if="agents[0].agent_type == 1 ">{{ feedback.averageLmFeedbackByAgent ? feedback.averageLmFeedbackByAgent : 'No Feedback' }}
              </td>
              <td  
              class="py-2 px-2 text-sm text-center font-bold border" 
              :class=" feedback.averageLmFeedbackByUm &&  feedback.averageLmFeedbackByUm !== 0 ? 'text-green-800' : 'text-red-600'"
              v-if="agents[0].agent_type == 1 ">{{ feedback.averageLmFeedbackByUm ?  feedback.averageLmFeedbackByUm : 'No Feedback' }}

              </td>
              <td  class="py-2 px-2 text-sm text-center font-bold border"
              :class=" feedback.averageUmFeedbackByLm &&  feedback.averageUmFeedbackByLm !== 0 ? 'text-green-800' : 'text-red-600'"
              v-if="agents[0].agent_type == 2">{{ feedback.averageUmFeedbackByLm ? feedback.averageUmFeedbackByLm : 'No Feedback' }}</td>

              <td  class="py-2 px-2 text-sm text-center font-bold border"
                :class="feedback.averageFeedbackByQa &&  feedback.averageFeedbackByQa !== 0 ? 'text-green-800' : 'text-red-600'"
              >
                {{ feedback.averageFeedbackByQa ?feedback.averageFeedbackByQa : 'No Feedback' }}
              </td>

              
              <td 
                class="py-2 px-2  text-sm text-center font-bold border"
                :class=" feedback.overallAverageFeedback && feedback.overallAverageFeedback !== 0 ? 'text-purple-800' : 'text-red-600'"
              >{{ feedback.overallAverageFeedback ? feedback.overallAverageFeedback : 'No Feedback' }}</td>
              
              <!-- <td class="py-2 px-4 text-sm text-green-800">
                <div class="agent-photo">
                  <img v-if="agents[0].image_link" :src="updateImageLink(agents[0].image_link)" alt="Agent Photo" class="rounded-full w-12 h-12 object-cover">
                  <span v-else class="text-sm text-gray-500">No Photo</span>
                </div>
              </td> -->
  
            </tr>
          </tbody>
          <tbody v-else>
            <tr 
              :key="feedback.id" 
              v-for="feedback in feedbackData" 
              :class="['odd:bg-white', 'even:bg-green-50']">
              <!-- <td class="py-2 px-4 text-sm text-green-800">{{ agents[0].id }}</td> -->
              <!-- <td class="py-2 px-4 text-sm text-green-800 font-bold">{{ agents[0].firstname }} {{ agents[0].lastname }}</td> -->
              <!-- <td class="py-2 px-4 text-sm text-green-800">
                <span :class="['status', agents[0].status]">{{ agents[0].status }}</span>
              </td> -->
              <td class="py-2 px-4 text-sm text-green-800 border text-center">
                {{ feedback.month }}
              </td>  
              <td class="py-2 px-4 text-sm text-green-800 border text-center">
                {{ feedback.year }}   
              </td>  
              <td  class="py-2 px-4 text-sm  text-center font-bold text-red-600 border"
                 
                  v-if="agents[0].agent_type == 0 ">  No Feedback
              </td>

              <td  class="py-2 px-4 text-sm text-center font-bold text-red-600 border" 
               
                v-if="agents[0].agent_type == 1 "> No Feedback
              </td>
              <td  
              class="py-2 px-4 text-sm text-center font-bold text-red-600 border " 
             
              v-if="agents[0].agent_type == 1 ">No Feedback

              </td>
              <td  class="py-2 px-4 text-sm text-center font-bold text-red-600 border"
             
              v-if="agents[0].agent_type == 2">No Feedback</td>

              <td  class="py-2 px-4 text-sm text-center font-bold text-red-600 border"
               
              >
                No Feedback
              </td>

              
              <td 
                class="py-2 px-4  text-sm text-center font-bold text-purple-800 border"
      
              >{{ feedbackByAdmin[0].feedback }}</td>
              
              <!-- <td class="py-2 px-4 text-sm text-green-800">
                <div class="agent-photo">
                  <img v-if="agents[0].image_link" :src="updateImageLink(agents[0].image_link)" alt="Agent Photo" class="rounded-full w-12 h-12 object-cover">
                  <span v-else class="text-sm text-gray-500">No Photo</span>
                </div>
              </td>
   -->
            </tr>
          </tbody>
        </table>
      </div>
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
                  <th class="w-1/4 px-2 py-1 text-center font-semibold border ">Feedback By</th>
                  <th class="w-1/6 px-2 py-1 text-center font-semibold border">Month</th>
                  <th class="w-1/6 px-2 py-1 text-center font-semibold border">Year</th>
                  <th class="w-1/6 px-2 py-1 text-center font-semibold border">Feedback Score</th>
                  <th class="w-1/4 px-2 py-1 text-center font-semibold border"  v-if="modalType !== 'qa'">Actions</th>
                </tr>
                <tr v-else>
                   <th class="w-1/6 px-4 py-2 text-left font-semibold">Description</th>
                </tr>
              </thead>
              <tbody v-if="modalData.length > 0">
                <tr 
                  v-for="data in modalData" 
                  :key="data.who_give_feedback_id" 
                  class="border-b hover:bg-gray-100 transition"
                >
                  <!-- Feedback By -->
                  <td class="px-2 py-0.5 flex items-center space-x-3">
                    <img
                      v-if="data && data.image_link"
                      :src="updateImageLink(data.image_link)"
                      alt="Agent Image"
                      class="w-10 h-10 rounded-full object-cover border"
                    />
                    <span class="font-medium text-gray-800">
                      {{ data.who_give_feedback_name }}
                    </span>
                  </td>

                  <!-- Month -->
                  <td class="px-2 py-1 font-semibold border">{{ data.month }}</td>

                  <!-- Year -->
                  <td class="px-2 py-1 font-semibold border">{{ data.year }}</td>

                  <!-- Score -->
                <td class=" px-2 py- text-center border">
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

                <td class=" px-1 py-1 text-center text-xs flex justify-center items-center h-10 space-x-2" v-if="Number(data.feedback_score) && modalType !== 'qa'">
                  <!-- Toggle Enable/Disable Update -->
                  <button
                    v-if="data.can_update === 0"
                    @click="toggleUpdate(data)"
                    :disabled="disabledRows[data.who_give_feedback_id]"
                    class="text-white font-bold px-2 py-2  rounded-2xl shadow-md transition duration-300"
                    :class="disabledRows[data.who_give_feedback_id]
                      ?  'bg-gray-400 cursor-not-allowed'
                      :  'bg-yellow-500 hover:bg-yellow-600 '"
                  >
                     Update is Disabled
                  </button>
                  <button
                    v-else
                    @click="toggleUpdate(data)"
                    :disabled="disabledRows[data.who_give_feedback_id]"
                    class="text-white font-bold px-2 py-2 rounded-2xl shadow-md transition duration-300"
                    :class="disabledRows[data.who_give_feedback_id]
                      ?  'bg-gray-400 cursor-not-allowed'
                      : ' bg-green-500 hover:bg-green-600 '"
                  >
                    Update Enabled
                  </button>

                  <!-- Delete Button -->
                  <button 
                      @click="deleteAgentFeedback(data)"
                      :disabled="disabledRows[data.who_give_feedback_id]"
                      class="px-2 py-2 font-bold rounded-2xl shadow-md transition duration-300 text-white"
                      :class="disabledRows[data.who_give_feedback_id]
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-red-500 hover:bg-red-600'"
                    >
                      <span v-if="disabledRows[data.who_give_feedback_id]">Deleted</span>
                      <span v-else>Delete</span>
                  </button>
                  <NuxtLink  v-if="!disabledRows[data.who_give_feedback_id]"
                    :to="{
                      path: `/feedback/feedback_by_sales/${data.feedback_type}`,
                      query: {
                        who_receive_feedback_id: agents[0].id,
                        who_receive_feedback_db_name: agents[0].db_name,
                        who_give_feedback_id: data.who_give_feedback_id,
                        who_give_feedback_db_name: data.who_give_feedback_name,
                        who_give_feedback_agent_type: data.agent_type,
                        feedback_type: data.feedback_type,
                        month: data.month,
                        year: data.year,
                        admin_view_only: true
                      }
                    }"
                    target="_blank"
                    rel="noopener noreferrer"
                    class=" rounded-2xl px-2 py-2 bg-blue-500 text-white font-bold  hover:bg-blue-600"
                  >
                    View Feedback 
                  </NuxtLink>

                </td>
      
                </tr>
              </tbody>
              <tbody v-else>
                <tr  :key="feedback.id" 
                    v-for="feedback in feedbackData"  >
                  <td class="border px-4 py-2  space-x-2 text-red-500 font-bold">
                    No Feedback Yet for {{ agents[0].firstname }} {{ agents[0].lastname }} for  {{ feedback.month }}  {{ feedback.year }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 bg-gray-100 text-right">
            <button
              @click="closeModal()"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 hover:scale-105 transition duration-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>


   </div>
  </template>
  
  <script setup>
        import { ref,defineProps, defineEmits } from 'vue';

        //get the current user
          const authStore = useAuthStore()
          authStore.fetchTokenFromLocalStore()

                   

          const currentUser = authStore.state.user 
                    
          const showModal = ref(false);
          const modalType = ref('add');
          const router = useRouter();
        
          const modalData = ref(null);
          const disabledRows = ref({}) // object: { [id]: true/false }

          //  disabledRows.value = {...props.disabledRows}
      

        const props = defineProps({

          agents: {
              type: Array,
              required: true,
          },

          averageAgentFeedbackByLm: {
              type: String,
              required: true,
          },
          averageLmFeedbackByAgent: {
              type: String,
              required: true,
          },

          averageLmFeedbackByUm: {
              type: String,
              required: true,
          },

          averageUmFeedbackByLm: {
              type: String,
              required: true,
          },

          averageFeedbackByQa: {
            type: String,
            required: true,
          },

          overallAverageFeedback: {
              type: String,
              required: true,
          },

          feedbackData: {
            type: Array ,
            required: true,
          },
          agentFeedbackByLm: {
            type: Array,
            required: true,
          },
           lmFeedbackByAgent: {
            type: Array,
            required: true,
           },
           lmFeedbackByUm: {
            type: Array,
            required: true,
           },

           umFeedbackByLm: {
             type: Array,
             required: true,
           },
           feedbackByQa: {
             type: Array,
             required: true,
           },
           feedbackByAdmin: {
            type: Array ,
            required: true
           },
           submitted: {
             type: Number,
             required: true
           }, 
           disabledRows: {
            type: Object, 
            required: true
           }

      });

      //  disabledRows.value = props.disabledRows
          

   
       const emit = defineEmits(['passSalesEnableDisableFeedback', 'passSalesDeleteFeedback'])

      const openModal = ( data, feedbackType) => {

        modalType.value = feedbackType;
        showModal.value = true;

        if(feedbackType == 'qa'){
          data.forEach(item => {
            item.who_give_feedback_name = item.qa_dbname;
            item.who_give_feedback_id = item.qa_id;
          })
        }

        data.forEach(item => {
          item.feedback_type = feedbackType; // Add feedback_type property
        });

       

        modalData.value = data;
      };
      
      const closeModal = (data) => {
        showModal.value = false;
        modalType.value = null
        disabledRows.value = {}
        
      };      

       //get image url from the .env file
       const config = useRuntimeConfig()

      const updateImageLink = (imageLink) => {
        return `${config.public.imageBaseUrl}${imageLink}`
      }


      const toggleUpdate = (data) => {

      if(props.agents.employee_status == 'Resigned'){
         alert(`User is not allowed to enable or disable update feedback which already resigned. `)
        return
      }
        
        if(props.submitted == 1){
          alert('User is not allowed to enable or disable update feedback which already submitted.')
          return
        }
         if(currentUser.role != 'admin'){
          alert('User is not allowed to enable or disable update feedback')
          return
         }
         data.can_update = data.can_update === 0 ? 1 : 0; // Toggle between 0 and 1
          emit('passSalesEnableDisableFeedback', data)
      }

      // const deleteAgentFeedback = (data) => {
      //   emit('passSalesDeleteFeedback', data)

      //     deleteFlag.value = true
      // }

      const deleteAgentFeedback = (data) => {

          if(props.agents.employee_status == 'Resigned'){
            alert(`User is not allowed to delete  feedback which already  already resigned. `)
            return
          }

          if(props.submitted == 1){
              alert('User is not allowed to delete  feedback which already submitted.')
              return
            }  

          if(currentUser.role != 'admin'){
              alert('User is not allowed to delete feedback')
              return
            }
         
            disabledRows.value[data.who_give_feedback_id] = true


            emit('passSalesDeleteFeedback', data)

        
          // delete disabledRows.value[data.who_give_feedback_id]
      }

    //   const hasFeedback = computed(() => {
    //   return  currentUser.login_type != 'standarduser' || (props.overallAverageFeedback == null || props.overallAverageFeedback == "" ) //if already has feedback
    //     ? 'ml-2 bg-gray-500 text-white py-1 px-3 rounded-lg flex items-center gap-2 cursor-not-allowed' // Disabled styles
    //     : 'ml-2 bg-green-500 text-white py-1 px-3 rounded-lg flex items-center gap-2 hover:bg-green-600'; // Enabled styles
    // });


  </script>
  
  <style scoped>
    .status {
            font-weight: bold;
    }
  
    .status.active {
        color: #4caf50;
    }
    
    .status.inactive {
        color: #f44336;
    }
    
    .agent-photo {
        display: flex;
        justify-content: center;
        align-items: center;
    }
    
    .agent-photo img {
        width: 3rem;
        height: 3rem;
        object-fit: cover;
    }
    
    .agent-photo span {
        font-size: 0.875rem;
        color: #777;
    }

  </style>
