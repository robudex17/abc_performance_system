<template>
    <div >
      <h1 class="text-2xl font-bold mb-4 text-center">{{ attendanceTitle }}</h1>
      <div class="overflow-x-auto">
        <table  v-if="attendanceDetails.length > 0" class="w-full table-auto border-collapse bg-white">
          <thead class="bg-gradient-to-r from-blue-300 to-blue-300 text-gray-800">
            <tr>
              <!-- <th class="py-2 px-4 text-left text-sm font-medium ">ID</th> -->
              <th class="py-2 px-2 text-center text-sm font-bold border ">Agent ID</th>
              <th class="py-2 px-2 text-center text-sm font-bold border">Month</th>
              <th class="py-2 px-2 text-center text-sm font-bold border">Year</th>
              <!-- <th class="py-2 px-4 text-left text-sm font-medium ">Date</th> -->
              <th class="py-2 px-2 text-center text-sm font-bold border ">Description</th>
              <th class="py-2 px-2 text-center text-sm font-bold  border flex justify-between items-center">
                Actions
                <!-- <button  :disabled="currentUser.role == 'user' || currentUser.agent_type == 1 || currentUser.agent_type == 0" -->
                 <button :disabled="currentUser.login_type != 'standarduser'"
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
              v-for="(attendance, index) in attendanceDetails" 
              :key="attendance.id + index" 
              class="odd:bg-white even:bg-green-50">
              <!-- <td class="py-2 px-4 text-sm ">{{ attendance.id }}</td> -->
              <td class="py-2 px-2 text-sm text-center border">{{ attendance.agent_id }}</td>
              <td class="py-2 px-2 text-sm text-center border">{{ attendance.month }}</td>
              <td class="py-2 px-2 text-sm text-center border ">{{ attendance.year }}</td>
              <!-- <td class="py-2 px-4 text-sm ">{{ attendance.date }}</td> -->
              <td class="py-2 px-2 text-sm text-center border">{{ attendance.description }}</td>
              <td class="py-1 px-2 text-sm  text-center border flex justify-center gap-2">
                <button  :disabled="currentUser.role == 'user' || currentUser.role == 'manager'"
                  @click="openModal('edit', index)" 
                  class="bg-green-500 text-white py-1 px-3 rounded-lg hover:bg-green-600  disabled:bg-gray-400 disabled:cursor-not-allowed">
                  Edit 
                </button>
                <button  :disabled="currentUser.role == 'user' || currentUser.role == 'manager'"
                  @click="deleteAttendanceType(attendance.id)" 
                  class="bg-red-500 text-white py-1 px-3 rounded-lg hover:bg-red-600  disabled:bg-gray-400 disabled:cursor-not-allowed">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <table v-else class="w-full table-auto border-collapse bg-white">
          <thead class="bg-gradient-to-r from-blue-300 to-blue-300 text-gray-800">
            <tr>


              <th class="py-2 px-4 text-left text-lg font-medium "></th>
              <th class="py-2 px-4 text-left text-sm font-medium "></th>
              <th class="py-2 px-4 text-left text-sm font-medium "></th>
              <th class="py-2 px-4 text-left text-sm font-medium "></th>
              <th class="py-2 px-4 text-left text-sm font-medium "></th>
              <th class="py-2 px-4 text-left text-lg font-medium ">Description</th>
              <th class="py-2 px-4 text-left text-sm font-medium "></th>
              <th class="py-2 px-4 text-left text-sm font-medium "></th>
              <th class="py-2 px-4 text-left text-sm font-medium "></th>
              <th class="py-2 px-4 text-left text-sm font-medium "></th>
              <th class="py-2 px-4 text-left text-sm font-medium "></th>
              <th class="py-2 px-4 text-left text-sm font-medium "></th>
              <th class="py-2 px-4 text-left text-sm font-medium "></th>
              <th class="py-2 px-4 text-left text-sm font-medium "></th>
              <th class="py-2 px-4 text-left text-sm font-medium "></th>
              <th class="py-2 px-4 text-left text-sm font-medium "></th>
              <th class="py-2 px-4 text-left text-sm font-medium "></th>
              <th class="py-2 px-4 text-left text-sm font-medium "></th>
              <th class="py-2 px-4 text-left text-sm font-medium "></th>
              <th class="py-2 px-4 text-left text-sm font-medium "></th>
              <th class="py-2 px-4 text-left text-sm font-medium "></th>
              <th class="py-2 px-4 text-left text-sm font-medium "></th>              
              <th class="py-2 px-4 text-left text-sm font-medium "></th>
              <th class="py-2 px-4 text-left text-sm font-medium "></th>
              <th class="py-2 px-4 text-left text-sm font-medium "></th>
              <th class="py-2 px-4 text-left text-sm font-medium "></th>
              <th class="py-2 px-4 text-left text-sm font-medium "></th>
              <th class="py-2 px-4 text-left text-sm font-medium "></th>
              <th class="py-2 px-4 text-left text-sm font-medium "></th>
              <th class="py-2 px-4 text-left text-sm font-medium "></th>
              <th class="py-2 px-4 text-left text-sm font-medium  flex justify-between items-center">
                <!-- <button  :disabled="currentUser.role == 'user' || currentUser.agent_type == 1 || currentUser.agent_type == 0" -->
                 <button :disabled="currentUser.login_type != 'standarduser'"
                  @click="openModal('add')" 
                  class="ml-2 bg-green-500 text-white py-1 px-3 rounded-lg flex items-center gap-2 hover:bg-green-600  disabled:bg-gray-400 disabled:cursor-not-allowed">
                  <font-awesome-icon icon="plus" />
                  Add
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
               <td class="py-2 px-4 text-sm "></td>
                <td class="py-2 px-4 text-sm "></td>
                <td class="py-2 px-4 text-sm "></td>
                <td class="py-2 px-4 text-sm "></td>
                <td class="py-2 px-4 text-sm "></td>
                <td class="py-2 px-4 text-medium font-bold ">No {{ attendanceType }} yet recorded for the {{ month }} {{ year }}</td>
                <td class="py-2 px-4 text-sm "></td>
                <td class="py-2 px-4 text-sm "></td>
            </tr>
          </tbody>
        </table>        
      </div>
  
      <!-- Modal -->
      <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-lg p-6 w-1/3">
          <h2 class="text-xl font-bold mb-4">{{ modalType === 'add' ? `Add ${attendanceType}`  : `Edit ${attendanceType}` }}</h2>
          <form @submit.prevent="submitForm">
            <div class="mb-4">
              <label class="block text-sm font-medium mb-2">Agent ID</label>
              <input v-model="form.agent_id" type="number" class="w-full border rounded-lg p-2" disabled required />
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium mb-2">Month</label>
              <input v-model="form.month" type="text" class="w-full border rounded-lg p-2"  disabled required />
            </div>
            <div class="mb-4" >
              <label class="block text-sm font-medium mb-2">Year</label>
              <input v-model="form.year" type="text" class="w-full border rounded-lg p-2" disabled required />
            </div>
            <div>
                <div class="mb-4" v-if="modalType==='add'">
                <label class="block text-sm font-medium mb-2">Date</label>
                <input v-model="form.date" type="date" class="w-full border rounded-lg p-2"  required />
                <p v-if="errorDate" class="text-red-500 text-sm mt-2">{{ errorDate }}</p>
              </div>
              <div class="mb-4"  v-else-if="modalType ==='edit'">
                <label class="block text-sm font-medium mb-2">Date</label>
                <input v-model="form.date" type="text" class="w-full border rounded-lg p-2"  disabled required />
              </div>
            </div>
      
            <div class="mb-4">
              <label class="block text-sm font-medium mb-2">Description</label>
              <textarea v-model="form.description" class="w-full border rounded-lg p-2" required></textarea>
            </div>
            <div class="flex justify-end gap-2">
              <button type="button" @click="closeModal" class="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600">Cancel</button>
              <button  :disabled="currentUser.role == 'user' || currentUser.role == 'manager'" type="submit" class="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600  disabled:bg-gray-400 disabled:cursor-not-allowed">Submit</button>
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
          attendanceTitle: {
              type: String,
              required: true,
          },
          attendanceType: {
              type: String,
              required: true,
          },
          attendanceDetails: {
              type: Array,
              required: true,
          },
          agent: {
            type:Object,
            required: true
          },
          submitted: {
            require: true,
            type:Number
          }
      });

      const route = useRoute()
      const router = useRouter()

      const showModal = ref(false);
      const modalType = ref('add');

      const month  = ref(null)
      const year = ref(null)
      const agentId = route.params.agent_id
      const errorDate = ref(null)


      const form = ref({
          id: null,
          agent_id: '',
          month: '',
          year: '',
          date: '',
          description: '',
        });


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
            errorDate.value = `Cannot Set ${props.attendanceType} on the  Future Date`
            return
          }

          if (month.value == inputMonth && year.value == inputYear){
            errorDate.value = ""
          }else{
            errorDate.value = "Please Enter Date on Specific Month And Year"
          }

      }
      
      const openModal = (type, index = null) => {

       if(props.agent.employee_status == 'Resigned'){
        alert(`Adding or Updating ${props.attendanceType} of Resigned Agent  is prohibited. `)
        return
      }

      if(props.submitted == 1){
        alert(`Adding or Updating ${props.attendanceType} that is already submitted  is prohibited. `)
        return
      }


      modalType.value = type;
      showModal.value = true;
        
      if (type === 'edit' && index !== null) {
        
        form.value = { ...props.attendanceDetails[index]}
        } else {
          validateDateEntry()
          form.value = {
            id: null,
            agent_id: agentId,
            month: month.value,
            year: year.value,
            date: '',
            description: '',
          };
        }
      };
      
      const closeModal = () => {
        showModal.value = false;
        modalType.value = null
      };
      
      const emit = defineEmits(['passAttendance', 'passUpdateAttendance', 'passDeleteAttendance'])
      const submitForm = () => {
          // If there are any errors, do not proceed
          if (errorDate.value) {
            return;
          }

          
          if (modalType.value === 'add') {
              const searchDeate = props.attendanceDetails.find(agentDetial => agentDetial.date  == form.value.date)
              if (searchDeate){
                alert(`Cannot Set ${props.attendanceType} with the same date`)
                return
              }
              if(currentUser.role != 'admin'){
                alert('"Access Denied: Insufficient Permission')
                closeModal();
              }
              emit('passAttendance', agentId, {month: month.value, year: year.value}, props.attendanceType, form.value)   
          } else if (modalType.value === 'edit') {
              emit('passUpdateAttendance', agentId, {month: month.value, year: year.value}, props.attendanceType, form.value)
              console.log(form.value)   
          }
          closeModal();
      };
      
      const deleteAttendanceType = (attendanceId) => {

        if(props.agent.employee_status == 'Resigned'){
          alert(`Deleting ${props.attendanceType} of Resigned Agent  is prohibited. `)
          return
        }

        if(props.submitted == 1){
          alert(`Deleting ${props.attendanceType} that is already submitted is prohibited. `)
          return
        }

        if (confirm(`Are you sure you want to delete this ${props.attendanceType}?`)) {
             emit('passDeleteAttendance', agentId, {month: month.value, year: year.value}, props.attendanceType, {id: attendanceId})
        };

      }

      watch(route, async (newRoute) => {
      console.log("The route is changed, reacting to the change..");
      router.push(newRoute.fullPath);
      month.value = newRoute.query.month 
      year.value = newRoute.query.year

    });

    // Watcher for the target field
    watch(
      () => form.value.date,
      (newValue) => {
          const inputDate = new Date(newValue)
          const inputYear = inputDate.getFullYear()
          const inputMonth = months[inputDate.getMonth()]

          if(inputDate.getTime() > new Date().getTime()) {
            errorDate.value =`Cannot Set ${props.attendanceType} on the  Future Date`
            return
          }
            
          if (month.value == inputMonth && year.value == inputYear){
              errorDate.value = ""
          }else{
              errorDate.value = "Please Enter Date on Specific Month And Year"
          }
      }
    );
</script>
  
<style>
  /* Add custom styles if needed */
</style>
  