<template>
  <!-- <div class=" bg-gradient-to-r from-blue-50 to-blue-100 min-h-screen p-4 mt-20"> -->
  <div class="p-4 mt-20">
    <!-- Loading Spinner -->
    <!-- <div v-if="useFeedbackStore.state.loading">
      <spinner></spinner>
    </div> -->
    <div >

        <h1 class="text-3xl font-extrabold text-gray-800 mb-6 text-center">QA FEEDBACK</h1>


        <!-- Agents Table -->
        <div class="overflow-x-auto shadow-xl rounded-lg">
          <table class="w-full table-auto border-collapse bg-white">
            <thead>
              <tr class="bg-gradient-to-r from-blue-200 to-blue-300 text-gray-800">
                <th class="py-1 px-4 text-center  text-xs font-bold text-green-900">ID</th>
                <th class="py-1 px-4 text-center  text-xs font-bold text-green-900"> Name</th>
                <th class="py-1 px-4 text-center  text-xs font-bold text-green-900"> Employee Status</th>
                 <th class="py-1 px-4 text-center  text-xs font-bold text-green-900">Manager</th>     
                <th class="py-1 px-4 text-center  text-xs font-bold text-green-900">Market</th>
                 <th class="py-1 px-4 text-center  text-xs font-bold text-green-900">Team</th>
                <th class="py-1 px-4 text-center  text-xs font-bold text-green-900">Month</th>
                <th class="py-1 px-4 text-center  text-xs font-bold text-green-900">Year</th>
                 <th class="py-1 px-4 text-center  text-xs font-bold text-green-900">Feedback By</th>
                <th class="py-1 px-4 text-center  text-xs font-bold text-green-900">Feedback</th>
                <th class="py-1 px-4 text-center  text-xs font-bold text-green-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(agent, index) in paginatedAgents"
                :key="index"
                class="even:bg-blue-50 odd:bg-white"
              >
                <td class="py-1 px-6 border text-center text-gray-700">
                  {{ agent.id }}
                </td>
                <td class="py-1 px-4  border text-center  text-xs font-medium text-green-900">
                    <div class="flex items-center space-x-3 ml-3">
                      <img
                        v-if="agent && agent.image_link"
                        :src="updateImageLink(agent.image_link)"
                        alt="Agent Image"
                        class="w-10 h-10 rounded-full object-cover"
                      />
                      <span>{{ agent.db_name }}</span>
                    </div>
                </td>
                <td class="py-1 px-4  border text-center  text-xs  font-bold " 
                  :class="agent.employee_status=== 'Hired' ? 'text-green-500 font-bold' : 'text-red-500 font-bold' ">
                  {{ agent.employee_status }}
                </td>     
                <td class="py-1 px-4  border text-left  text-xs font-medium text-green-900">
                  {{ agent.manager_dbname }}
                </td>                             
                <td class="py-1 px-4  border text-left  text-xs font-medium text-green-900">
                  {{ agent.market_name }}
                </td>                
                <td class="py-1 px-4  border text-left  text-xs font-medium text-green-900">
                  {{ agent.team_name }}
                </td>
                <td class="py-1 px-4  border text-left  text-xs font-medium text-green-900">
                  {{ agent.month }}
                </td>
                <td class="py-1 px-4  border text-left  text-xs font-medium text-green-900">
                  {{ agent.year }}
                </td>
                <td class="py-1 px-4  border text-left  text-xs font-medium text-green-900">
                  {{ agent.qa_dbname  }}
                </td>               
                <td 
                  class="py-1 px-6 border text-center font-bold text-green-500"
                  :class="{ 'text-red-500 font-bold': agent.feedback === 'No Feedback' }"
                >
                  {{ agent.feedback }}
                </td>
                <td class="py-0.5 px-6 border text-center">
                  <div class="flex justify-center space-x-2">
                    <!-- <NuxtLink 
                      :to="{
                        path: `/feedback/feedback_by_qa/${agent.id}`,  query: { agent_type: agent.agent_type, agent_role: agent.role , agent_dbname: agent.db_name}
                        
                      }"
                      class="px-4 py-1 bg-blue-500 text-white font-bold rounded hover:bg-blue-600  disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Feedback Details
                    </NuxtLink> -->
                      <button v-if="agent.feedback == 'No Feedback'" :disabled="agent.employee_status == 'Resigned'"
                      @click="openModal('add', agent)" 
                      class="ml-2  text-white py-1 px-3 rounded-lg flex items-center gap-2 hover:bg-green-600  disabled:bg-gray-400 disabled:cursor-not-allowed"
                       :class="agent.employee_status=== 'Resigned' ? 'bg-gray-600 font-bold' : 'bg-green-600 font-bold' "
                      >
                     
                      
                      <font-awesome-icon icon="plus" />
                      Add 
                    </button>
                    <button v-else
                      @click="openModal('edit', agent)" 
                      class="ml-2 bg-green-500 text-white py-1 px-3 rounded-lg flex items-center gap-2 hover:bg-green-600">
                      <font-awesome-icon icon="pen-to-square" />
                      Edit 
                    </button>

                    <button  :disabled="currentUser.role == 'user' || currentUser.role == 'manager' || agent.feedback == 'No Feedback'"
                      @click="deleteFeedback(agent)" 
                      class="bg-red-500 text-white py-1 px-3 rounded-lg hover:bg-red-600  disabled:bg-gray-400 disabled:cursor-not-allowed">
                      Delete
                    </button>


                  </div>
                </td>
              </tr>
            </tbody>
          </table>

                  <!-- Modal -->
          <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg shadow-lg p-6 w-1/3">
              <h2 class="text-xl font-bold mb-4">{{ modalType === 'add' ? `Add Feedback`  : `Edit Feedback` }}</h2>
              <form @submit.prevent="submitForm">
                <div class="mb-4">
                  <label class="block  text-xs font-medium mb-2">Agent ID</label>
                  <input v-model="form.agent_id" type="number" class="w-full border rounded-lg p-2" disabled required />
                </div>

                <div class="mb-4">
                  <label class="block  text-xs font-medium mb-2">Month</label>
                  <input type="text" class="w-full border rounded-lg p-2" v-model="form.month" disabled required />
                </div>

                <!-- Year Field - Current Year -->
                <div class="mb-4">
                  <label class="block  text-xs font-medium mb-2">Year</label>
                  <input type="text" class="w-full border rounded-lg p-2" v-model="form.year" disabled required />
                </div>

          

                <div class="mb-4">
                  <label class="block  text-xs font-medium mb-2">Feedback</label>
                  <input v-model="form.feedback_score" type="text" class="w-full border rounded-lg p-2"
                  @keydown.backspace="onBackSpace"
                  />
                  <p v-if="errorFeedback.feedbackError" class="text-red-500  text-xs mt-2">{{ errorFeedback.feedbackError }}</p>
                </div>

                <div class="flex justify-end gap-2">
                  <button type="button" @click="closeModal" class="bg-gray-500 text-white py-1 px-4 rounded-lg hover:bg-gray-600">Cancel</button>
                  <button type="submit" class="bg-green-500 text-white py-1 px-4 rounded-lg hover:bg-green-600">Submit</button>
                </div>
              </form>
            </div>
          </div>
      </div>
    
          <!-- Pagination -->
          <div v-if="totalPages > 1" class="mt-4 flex justify-center space-x-4">
            <button
              v-for="page in totalPages"
              :key="page"
              class="px-4 py-1 border rounded"
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
  </div>
</template>
  
  <script setup>
  
  definePageMeta({
    middleware: ['auth', 'adminmanager', 'admin-qa-feedback']
  })
  
  import { ref, computed } from 'vue';
  import { onMounted } from 'vue';

  
  const router = useRouter();
  const route = useRoute();
  
  const query = route.query;
  // const month = ref(null)
  // const year = ref(null)
  
  //get the current user
  const authStore = useAuthStore()
  authStore.fetchTokenFromLocalStore()
  
  const currentUser = authStore.state.user 

    const showModal = ref(false);
    const modalType = ref('add');



    const errorFeedback = ref({
      monthYearError: '',
      feedbackError:  '',
    })


   const form = ref({
        agent_id: '',
        agent_dbname: '',
        qa_id: '',
        qa_dbname: '',
        role: '',
        month: '',
        year: '',
        feedback_score: '',
      });

    // Months for the dropdown
  const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
         ];




    if(!query.month){
        query.month = months[new Date().getMonth()]
    }

    if(!query.year){
        query.year = new Date().getFullYear()
    }

   
  
    const today = new Date()
    const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

   const useFeedbackStore  = feedbackStore()

   
   const fetchSalesAgentsFeedbackByQa = (query) => {
    useFeedbackStore.fetchFeedback('all', query, 'qa')
  };
  
  const config = useRuntimeConfig()
  
  const updateImageLink = (imageLink) => {
        return `${config.public.imageBaseUrl}${imageLink}`
  }
 
 
  onMounted(() => {
    fetchSalesAgentsFeedbackByQa(query)
  });
  
  const itemsPerPage = 10;
  const currentPage = ref(1);
  const isModalOpen = ref(false);
  const isModalOpenForLogin = ref(false)
  const  enablePasswordRecovery = ref(false)
  const editMode = ref(false); // Toggle between Add and Edit mode
  const editLoginMode = ref(false); // Toggle between Add and Edit mode for login
  const imagePreview = ref(null);
  

  

  const agents = computed(() => useFeedbackStore.state.qa);

  const totalPages = computed(() =>
    Math.ceil(agents.value.length / itemsPerPage)
  )
  
  const paginatedAgents = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return agents.value.slice(start, end);
  });

      const openModal = (type, agent) => {

        if(agent.submitted == 1){
          alert('Adding or Updating feedback for an agent that is already submitted is prohibited.')
          return
        }


        modalType.value = type;
        showModal.value = true;


        if(type == 'add'){
            form.value = {
              agent_id: agent.id,
              agent_dbname: agent.db_name,
              qa_id: currentUser.login_id,
              qa_dbname: currentUser.db_name,
              role: currentUser.role,
              month:  agent.month,
              year:  agent.year,
              date:new Date().toISOString().split('T')[0], // Set today's date as default,
              feedback_score: '',
            };
        }else if(type == 'edit'){

            form.value = {
              agent_id: agent.id,
              agent_dbname: agent.db_name,
              qa_id: currentUser.login_id,
              qa_dbname: currentUser.db_name,
              role: currentUser.role,
              month:  agent.month,
              year:  agent.year,
              date: new Date().toISOString().split('T')[0],
              feedback_score: agent.feedback
            };
        };
      }

      const onBackSpace = () => {
        errorFeedback.value = { monthYearError: '', feedbackError: '' };
      }
      
      const closeModal = () => {
        showModal.value = false;
        errorFeedback.value = { monthYearError: '', feedbackError: '' };
      };
      
   
      const validateFeedback = () => {

        errorFeedback.value = { monthYearError: '', feedbackError: '' }; // Reset errors

    
        if (!form.value.feedback_score || !/^\d+(\.\d+)?$/.test(form.value.feedback_score)) {
              errorFeedback.value.feedbackError = "Please enter a valid numeric feedback.";
              return 
        }

        if (parseFloat(form.value.feedback_score) > 5 ) {
              errorFeedback.value.feedbackError = "The Highest Feedback you can give is 5.0 ";
              return 
        }

            if ( parseFloat(form.value.feedback_score) == 0 || parseFloat(form.value.feedback_score) < 0) {
              errorFeedback.value.feedbackError = "Feedback value of zero(0) or negative value is not allowed";
              return 
        }



        return true;
      };


   const submitForm = async() => {

          if ( !validateFeedback()){
            return 
          }

          if(currentUser.role != 'admin'){
              alert('"Access Denied: Insufficient Permission')
              closeModal();
          }

          if (modalType.value === 'add') {

          try {
            await useFeedbackStore.addUpdateDeleteFeedback(form.value.agent_id, form.value, 'qa', query, 'POST')
               console.log('the feedback query is', query)
               fetchSalesAgentsFeedbackByQa({month: form.value.month, year: form.value.year});
              }catch(error){
              console.log(error)
           }
        
          } else if (modalType.value === 'edit') {
            try {
              await useFeedbackStore.addUpdateDeleteFeedback(form.value.agent_id, form.value, 'qa', query, 'PUT')
                console.log('the feedback query is', query)
              fetchSalesAgentsFeedbackByQa({month: form.value.month, year: form.value.year});
            } catch (error) {
              console.log(error)
           }
          }
          closeModal();
      };
      
      const deleteFeedback = async(agent) => {

        
        if(agent.submitted == 1){
          alert('Deleting feedback for an agent that is already submitted is prohibited.')
          return
        }

        console.log('the agent feedback need to delete', agent.id)
          console.log('the feedback query is', query)
        if (confirm(`Are you sure you want to delete this feedback?`)) {
            await useFeedbackStore.addUpdateDeleteFeedback(agent.id, agent, 'qa', query, 'DELETE')
            fetchSalesAgentsFeedbackByQa({month: agent.month, year: agent.year});
 
        }
      };

  
 watch(route, async (newRoute) => {

  router.push(newRoute.fullPath);
  await useFeedbackStore.fetchFeedback('all', newRoute.query, 'qa')

});

  </script>
  