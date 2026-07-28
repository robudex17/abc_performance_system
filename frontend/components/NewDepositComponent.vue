<template>
    <div >
        <h1 class="text-2xl font-bold mb-4 text-center">Sales Agent New Deposit</h1>
        <div class="overflow-x-auto"> 
   
        <table class="w-full table-auto border-collapse bg-white">
          <thead class="bg-gradient-to-r from-blue-300 to-blue-300 text-gray-800">
              <tr>
                <!-- <th class="py-2 px-4 text-left text-sm font-medium border ">ID</th> -->
                <!-- <th class="py-2 px-4 text-left text-sm font-medium border ">Agent ID</th> -->
                <th class="py-2 px-2 text-center text-sm font-bold border ">Month</th>
                <th class="py-2 px-2 text-center text-sm font-bold border ">Year</th>
                <th class="py-2 px-2 text-center text-sm font-bold border ">Market</th>
                <th class="py-2 px-2 text-center text-sm font-bold border ">Team</th>
                <!-- <th class="py-2 px-4 text-left text-sm font-medium border ">Date</th> -->
                <th class="py-2 px-2 text-center text-sm font-bold border ">Description</th>
                <th class="py-1 px-2 text-center text-sm font-bold border  flex justify-between items-center">
                  Actions
                  <button  :disabled="currentUser.role == 'user' || currentUser.agent_type == 1 || currentUser.agent_type == 0"
                    @click="openModal('add')" 
                    class="ml-2 bg-green-500 text-white py-1 px-3 rounded-lg flex items-center gap-2 hover:bg-green-600  disabled:bg-gray-400 disabled:cursor-not-allowed">
                    <font-awesome-icon icon="plus" />
                    Add
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(newDeposit, index) in newDepositDetails" 
                :key="newDeposit.id + index" 
                class="odd:bg-white even:bg-green-50">
                <!-- <td class="py-2 px-4 text-sm border ">{{ newDeposit.id }}</td> -->
                <!-- <td class="py-2 px-4 text-sm border ">{{ newDeposit.agent_id }}</td> -->
                <td class="py-2 px-2 text-sm text-center border ">{{ newDeposit.eval_month }}</td>
                <td class="py-2 px-2 text-sm text-center border ">{{ newDeposit.eval_year }}</td>
                <td class="py-2 px-2 text-sm text-center font-medium border ">{{ newDeposit.market_name.toUpperCase() }}</td>
                <td class="py-2 px-2 text-sm text-center font-medium border ">{{ newDeposit.team_name.toUpperCase()}}</td>
                <td class="py-2 px-2 text-sm text-center border ">{{ newDeposit.description }}</td>
                <td class="py-1 px-2 text-sm text-center  border  flex justify-center  gap-2">
                  <button   :disabled="currentUser.role == 'user' || currentUser.agent_type == 1 || currentUser.agent_type == 0"
                    @click="openModal('edit', newDeposit)" 
                    class="bg-green-500 text-white py-1 px-3 rounded-lg hover:bg-green-600  disabled:bg-gray-400 disabled:cursor-not-allowed">
                    Edit
                  </button>
                  <button   :disabled="currentUser.role == 'user' || currentUser.agent_type == 1 || currentUser.agent_type == 0 || currentUser.agent_type == 2"
                    @click="deleteNewDeposit(newDeposit)" 
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
            <h2 class="text-xl font-bold mb-4">{{ modalType === 'add' ? `Add New Deposit`  : `Edit New Deposit` }}</h2>
            <form @submit.prevent="submitForm">
              <div class="mb-4">
                <label class="block text-sm font-medium mb-2">Agent ID</label>
                <input v-model="form.id" type="number" class="w-full border rounded-lg p-2" disabled required />
              </div>
              <div class="mb-4" >
                <label class="block text-sm font-medium mb-2">Month</label>
                <input v-model="form.eval_month" type="text" class="w-full border rounded-lg p-2"  disabled required />
              </div>
              <div class="mb-4"  >
                <label class="block text-sm font-medium mb-2">Year</label>
                <input v-model="form.eval_year" type="text" class="w-full border rounded-lg p-2" disabled  required />
              </div>
              <!-- <div class="mb-4">
                <label class="block text-sm font-medium mb-2">Date</label>
                <input v-model="form.date" type="date" class="w-full border rounded-lg p-2" required />
                <p v-if="errorDate" class="text-red-500 text-sm mt-2">{{ errorDate }}</p>
              </div> -->
              <div class="mb-4">
                <label class="block text-sm font-medium mb-2">Description</label>
                <textarea v-model="form.description" class="w-full border rounded-lg p-2" required></textarea>
              </div>
              <div class="flex justify-end gap-2">
                <button type="button" @click="closeModal" class="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600">Cancel</button>
                <button :disabled="currentUser.role == 'user'" type="submit" class="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600  disabled:bg-gray-400 disabled:cursor-not-allowed">Submit</button>
              </div>
            </form>
          </div>
        </div>
    </div>
  </template>
  
  <script setup>
      import { ref, defineProps, defineEmits,computed,watch } from 'vue';
      import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

      
      //get the current user
      const authStore = useAuthStore()
      authStore.fetchTokenFromLocalStore()
      const currentUser = authStore.state.user 
        
      const props = defineProps({
          newDepositDetails: {
              type: Array,
              required: true,
          },
          agent: {
            type: Object, 
            required: true
          },
          submitted: {
            type: Number, 
            required: true
          }
      });


      const showModal = ref(false);
      const modalType = ref('add');

      const route = useRoute()
      const router = useRouter()
      const month = ref(null)
      const year = ref(null)
      const agentId= route.params.agent_id
      const errorDate = ref(null)


      const monthMap = {
          January: "01",
          February: "02",
          March: "03",
          April: "04",
          May: "05",
          June: "06",
          July: "07",
          August: "08",
          September: "09",
          October: "10",
          November: "11",
          December: "12"
        };




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

    const validateDateEntry = () => {
    
      const inputDate = new Date(form.value.date)

      const inputYear = inputDate.getFullYear()
      const inputMonth = months[inputDate.getMonth()]

      if(inputDate.getTime() > new Date().getTime()) {
        errorDate.value = "Cannot Set Time Deposit on the  Future Date"
        return
      }

      if (month.value == inputMonth && year.value == inputYear){
        errorDate.value = ""
      }else{
        errorDate.value = "Please Enter Date on Specific Month And Year"
      }

    }

    const monthNumber = monthMap[month.value];


     const form = ref({
        id: agentId,
        eval_month: month.value,
        eval_year: year.value,
        new_deposit: 1000,
        date: `${year.value}-${monthNumber.toString().padStart(2, '0')}-01`,
        description: '',
      
      });
      
    const openModal = (type, agent = null) => {
       if(props.agent.employee_status == 'Resigned'){
        alert(`Adding or Updating New Deposit of Resigned Agent  is prohibited. `)
        return
      }


      if(agent != null && agent.employee_status =='Resigned'){
         alert(`Adding or Updating New Deposit of Resigned Agent  is prohibited. `)
        return       
      }

      if(agent != null && agent.submitted == 1){
         alert(`Adding or Updating Agent New Deposit that is already submittted is prohibited. `)
        return       
      }

      if(props.submitted == 1){
             alert(`Adding or Updating Agent New Deposit that is already submittted is prohibited. `)
            return
      }




        modalType.value = type;
        showModal.value = true;
      
        if (type === 'edit' && agent !== null) {
          
          form.value = { ...agent}
        }
      };
      
      const closeModal = () => {
        showModal.value = false;
        errorDate.value = ""
      };


      // define emits here..

      const emit = defineEmits(['passNewDeposit', 'passUpdatedNewDeposit', 'passDeleteDeposit'])
      
      const submitForm = () => {
         
       
          if (errorDate.value){
            return
          }
        
          if (modalType.value === 'add') {
        
          emit('passNewDeposit', agentId, {month:month.value, year: year.value}, form.value)

          } else if (modalType.value === 'edit') {
            
            console.log('The updated  deposit form is ', form.value)
            emit('passUpdatedNewDeposit', agentId, {month:month.value, year: year.value}, form.value)

          }
          closeModal();
      };
      
      const deleteNewDeposit = (agent) => {

        if(props.agent.employee_status == 'Resigned'){
          alert(`Deleting New Deposit of Resigned Agent  is prohibited. `)
          return
        }

        if(agent.submitted == 1){
           alert(`Deleting of Agent New Deposit that is already submittted is prohibited. `)
           return
        
        }

        if(agent.employee_status == 1){
            alert(`Deleting New Deposit of Resigned Agent  is prohibited. `)
           return
        
        }

        if (confirm(`Are you sure you want to delete this New Deposit?`)) {

            emit('passDeleteDeposit', agent.id, {month:month.value, year:year.value}, {deposit_id: agent.deposit_id} )
         }
      };

    watch(route, async (newRoute) => {
      console.log("The route is changed, reacting to the change..");
      router.push(newRoute.fullPath);
      month.value = newRoute.query.month 
      year.value = newRoute.query.year

    });

    // Watcher for the target field
    // watch(
    //   () => form.value.date,
    //   (newValue) => {
        
    //     const inputDate = new Date(newValue)

    //     const inputYear = inputDate.getFullYear()
    //     const inputMonth = months[inputDate.getMonth()]

    //     if(inputDate.getTime() > new Date().getTime()) {
    //       errorDate.value = "Cannot Set Time Deposit on the  Future Date"
    //       return
    //     }
        
    //     if (month.value == inputMonth && year.value == inputYear){
    //       errorDate.value = ""
    //     }else{
    //       errorDate.value = "Please Enter Date on Specific Month And Year"
    //     }

    //   }
    // );

  </script>
  
  <style>
  /* Add custom styles if needed */
  </style>
  