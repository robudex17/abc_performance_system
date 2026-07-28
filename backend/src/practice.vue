<template>
    <div>
        <h1 class="text-2xl font-bold mb-4 text-center">{{ title }}</h1>
        <div class="overflow-x-auto">
          <table class="min-w-full border border-green-500 rounded-lg">
            <thead class="bg-green-200">
              <tr>
                <th class="py-2 px-4 text-left text-sm font-medium text-green-900">QA ID</th>
                <th class="py-2 px-4 text-left text-sm font-medium text-green-900">QA DBNAME</th>
                <th class="py-2 px-4 text-left text-sm font-medium text-green-900">AGENT ID</th>
                <th class="py-2 px-4 text-left text-sm font-medium text-green-900">AGENT DBNAME</th>
                <th class="py-2 px-4 text-left text-sm font-medium text-green-900">MONTH</th>
                <th class="py-2 px-4 text-left text-sm font-medium text-green-900">YEAR</th>
                <th class="py-2 px-4 text-left text-sm font-medium text-green-900">DATE</th>
                <th class="py-2 px-4 text-left text-sm font-medium text-green-900">FEEDBACK SCORE</th>
                <th class="py-2 px-4 text-left text-sm font-medium text-green-900 flex justify-between items-center disabled:bg-gray-400 disabled:cursor-not-allowed">
                  Actions      
                  <button :disabled="feedbackByQa.length >= 4 || currentUser.role == 'user'" class=" disabled:bg-gray-400 disabled:cursor-not-allowed"
                    @click="openModal('add')" 
                    :class="hasFeedback">
                    <font-awesome-icon icon="plus" />
                    Add 
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(feedback, index) in feedbackByQa" 
                :key="feedback.id + index" 
                class="odd:bg-white even:bg-green-50">
                <td class="py-2 px-4 text-sm text-green-800">{{ feedback.qa_id }}</td>
                <td class="py-2 px-4 text-sm text-green-800">{{ feedback.qa_dbname }}</td>
                <td class="py-2 px-4 text-sm text-green-800">{{ feedback.agent_id }}</td>
                <td class="py-2 px-4 text-sm text-green-800">{{ feedback.agent_dbname }}</td>
                <td class="py-2 px-4 text-sm text-green-800">{{ feedback.month }}</td>
                <td class="py-2 px-4 text-sm text-green-800">{{ feedback.year }}</td>
                <td class="py-2 px-4 text-sm text-green-800">{{ feedback.date }}</td>
                <td class="py-2 px-4 text-sm text-purple-800 font-bold">{{ feedback.feedback_score }}</td>
                <td class="py-2 px-4 text-sm text-green-800 flex gap-2">
                  <button :disabled="currentUser.role == 'user' || currentUser.role == 'manager'"
                    @click="openModal('edit', index)" 
                    class="bg-green-500 text-white py-1 px-3 rounded-lg hover:bg-green-600  disabled:bg-gray-400 disabled:cursor-not-allowed">
                    Edit
                  </button>
                  <button  :disabled="currentUser.role == 'user' || currentUser.role == 'manager'"
                    @click="deleteFeedback(feedback.agent_id, feedback)" 
                    class="bg-red-500 text-white py-1 px-3 rounded-lg hover:bg-red-600  disabled:bg-gray-400 disabled:cursor-not-allowed">
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Modal -->
        <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-lg p-6 w-1/3">
            <h2 class="text-xl font-bold mb-4">{{ modalType === 'add' ? `Add Feedback`  : `Edit Feedback` }}</h2>
            <form @submit.prevent="submitForm">
              <div class="mb-4">
                <label class="block text-sm font-medium mb-2">Agent ID</label>
                <input v-model="form.agent_id" type="number" class="w-full border rounded-lg p-2" disabled required />
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium mb-2">Month</label>
                <input type="text" class="w-full border rounded-lg p-2" v-model="form.month" disabled required />
              </div>

              <!-- Year Field - Current Year -->
              <div class="mb-4">
                <label class="block text-sm font-medium mb-2">Year</label>
                <input type="text" class="w-full border rounded-lg p-2" v-model="form.year" disabled required />
              </div>

              <!-- Date Field -->
              <div class="mb-4">
                <label class="block text-sm font-medium mb-2">Date</label>
                <input type="date" class="w-full border rounded-lg p-2" v-model="form.date"  :disabled="modalType === 'edit'" required />
                <p v-if="errorFeedback.monthYearError" class="text-red-500 text-sm mt-2">{{ errorFeedback.monthYearError }}</p>
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium mb-2">Feedback</label>
                <input v-model="form.feedback_score" type="text" class="w-full border rounded-lg p-2" />
                <p v-if="errorFeedback.feedbackError" class="text-red-500 text-sm mt-2">{{ errorFeedback.feedbackError }}</p>
              </div>

              <div class="flex justify-end gap-2">
                <button type="button" @click="closeModal" class="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600">Cancel</button>
                <button type="submit" class="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600">Submit</button>
              </div>
            </form>
          </div>
        </div>
    </div>
  </template>
  
  <script setup>
    import { ref, defineProps, defineEmits,computed } from 'vue';
    import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

    //get the current user
    const authStore = useAuthStore()
    authStore.fetchTokenFromLocalStore()

    const currentUser = authStore.state.user 
      
    const props = defineProps({
        feedbackByQa: {
            type: Array,
            required: true,
        },
        title: {
          type: String,
          required: true
        }
      });

    const route = useRoute()
    const router = useRouter()

    const showModal = ref(false);
    const modalType = ref('add');
    const agentId = route.params.agent_id 
    const agentRole = route.query.agent_role
    const agentDbname = route.query.agent_dbname
    const month = ref(null)
    const year = ref(null)
    const errorFeedback = ref({
      monthYearError: '',
      feedbackError:  '',
    })


    // Months for the dropdown
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];


    month.value= route.query.month
    year.value = route.query.year 

    if (month.value == null || month.value == ""){
    month.value= months[new Date().getMonth()]
    }

    if (year.value == null || year.value == ""){
    year.value = new Date().getFullYear()
    }



    const form = ref({
        id: null,
        agent_id: '',
        agent_dbname: '',
        qa_id: '',
        qa_dbname: '',
        role: '',
        month: '',
        year: '',
        date: '',
        feedback_score: '',
      });


      const validateFeedback = () => {

        errorFeedback.value = { monthYearError: '', feedbackError: '' }; // Reset errors

        if (!form.value.date) {
            errorFeedback.value.monthYearError = "Please select a date.";
            return 
        }

        const dateString = form.value.date;
        const dateObj = new Date(dateString);
        const monthName = months[dateObj.getMonth()];
        const yearString = String(dateObj.getFullYear());

        if (month.value != monthName || year.value != yearString) {
              errorFeedback.value.monthYearError = "The selected date must match the chosen month and year.";
              return 
        }

        if (!form.value.feedback_score || !/^\d+(\.\d+)?$/.test(form.value.feedback_score)) {
              errorFeedback.value.feedbackError = "Please enter a valid numeric feedback.";
              return 
        }

        if (parseFloat(form.value.feedback_score) > 5) {
              errorFeedback.value.feedbackError = "The Highest Feedback you can give is 5.0";
              return 
        }

        if (modalType.value == 'add') {
            const isDuplicate = props.feedbackByQa.some(fb => fb.date === form.value.date);
            if (isDuplicate) {
              alert('Giving feedback on the same date is prohibited.');
              form.value.date = '';
              return
            }
        }
      
        return true;
      };

      const openModal = (type, index = null) => {
        modalType.value = type;
        showModal.value = true;
      
        if (type === 'edit' && index !== null) {
          
           form.value = { ...props.feedbackByQa[index]}
        } else {   
            form.value = {
              // id: salesAgentAbsences.value.length + 1,
              id: props.feedbackByQa.length + 1,
              agent_id: agentId,
              agent_dbname: agentDbname,
              qa_id: currentUser.login_id,
              qa_dbname: currentUser.db_name,
              role: agentRole,
              month:  month.value,
              year: year.value,
              date:new Date().toISOString().split('T')[0], // Set today's date as default,
              feedback_score: '',
            };
         }
      };
      
      const closeModal = () => {
        showModal.value = false;
        errorFeedback.value = { monthYearError: '', feedbackError: '' };
      };
      
      const emit = defineEmits(['passFeedback','passUpdateFeedback', 'passDeleteFeedback'])
      const submitForm = () => {

          if ( !validateFeedback()){
            return 
          }

          if(currentUser.role != 'admin'){
              alert('"Access Denied: Insufficient Permission')
              closeModal();
          }

          if (modalType.value === 'add') {

            emit('passFeedback', agentId, form.value , 'qa', {month:month.value, year:year.value}, 'POST' )
        
          } else if (modalType.value === 'edit') {
            emit('passUpdateFeedback', agentId, form.value, 'qa', {month:month.value, year:year.value}, 'PUT' )
          }
          closeModal();
      };
      
      const deleteFeedback = (agentId, feedback) => {
        if (confirm(`Are you sure you want to delete this feedback?`)) {
          emit('passDeleteFeedback', agentId, feedback, 'qa', {month:month.value, year:year.value}, 'DELETE' )

        }
      };

      const hasFeedback = computed(() => {
      return props.feedbackByQa.length >= 4 //if already has feedback
        ? 'ml-2 bg-gray-500 text-white py-1 px-3 rounded-lg flex items-center gap-2 cursor-not-allowed' // Disabled styles
        : 'ml-2 bg-green-500 text-white py-1 px-3 rounded-lg flex items-center gap-2 hover:bg-green-600'; // Enabled styles
    });

    watch(
      () => form.value.feedback,
      (newValue) => {
        // If empty or not a whole number, set error
        if (newValue= "" || !/^\d+(\.\d+)?$/.test(newValue)) {
          errorFeedback.value = "Please enter a valid number.";
        } else {
          errorFeedback.value = "";
        }
      }
    );

    watch(route, async (newRoute) => {
      console.log("The route is changed, reacting to the change..");
      router.push(newRoute.fullPath);
      month.value = newRoute.query.month 
      year.value = newRoute.query.year
    });
  </script>
  
<style scoped>
  .tooltip-wrapper {
    position: relative;
    display: inline-block;
  }
  
  .tooltip {
    position: absolute;
    bottom: 100%; /* Position above the button */
    left: 50%;
    transform: translateX(-50%);
    background-color: #333;
    color: #fff;
    padding: 8px;
    border-radius: 4px;
    white-space: nowrap;
    font-size: 14px;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease;
    z-index: 1000;
  }
  
  .tooltip-wrapper:hover .tooltip {
    opacity: 1;
    visibility: visible;
  }

  </style>



created_at
: 
"2024-11-20T18:54:30.000Z"
db_name
: 
"Rustan"
feedback
: 
"5.0000"
firstname
: 
"Rustan"
id
: 
2394
image_link
: 
"/images/image-1738268802276-917105883.jpg"
lastname
: 
"Cadiz"
manager_id
: 
2394
market_id
: 
0
market_name
: 
"all_market"
month
: 
"August"
status
: 
"active"
team_id
: 
0
updated_at
: 
"2025-07-29T17:47:34.000Z"
year
: 
"2025"
  