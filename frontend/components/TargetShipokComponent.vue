<template>
    <div >
        <h1 class="text-2xl font-bold mb-4 text-center">Sales Agent Target/ShipOk</h1>
        <div class="overflow-x-auto">
         
        <table class="w-full table-auto border-collapse bg-white">
          <thead class="bg-gradient-to-r from-blue-300 to-blue-300 text-gray-800">
              <tr>
                <!-- <th class="py-2 px-4 text-left text-sm font-medium border ">Agent ID</th> -->
                <th class="py-2 px-2 text-center text-sm font-bold border ">Month</th>
                <th class="py-2 px-2 text-center text-sm font-bold border">Year</th>
                <!-- <th class="py-2 px-4 text-left text-sm font-medium ">Date</th> -->
                <th class="py-2 px-2 text-center text-sm font-bold border">Target</th>
                <th class="py-2 px-2 text-center text-sm font-bold border">Shipok</th>
                <th class="py-2 px-2 text-center text-sm font-bold border">Percentage</th>
                <th class="py-2 px-2 text-center text-sm font-bold border">Market</th>
                <th class="py-2 px-2 text-center text-sm font-bold border">Team</th>
                <th class="py-1 px-2 text-center text-sm font-bold border flex justify-between items-center">
                  Actions
                  <button :disabled="targetShipokDetails.length == 1 || currentUser.agent_type == 1 || currentUser.role == 'user' || currentUser.agent_type == 2"   class="disabled:bg-gray-400 disabled:cursor-not-allowed"
                    @click="openModal('add')" 
                    :class="hasTarget">
                    <font-awesome-icon icon="plus" />
                    Add 
                  </button>
                </th>
              </tr>
            </thead>
              <tbody>
                <tr 
                v-for="(targetShipokDetail, index) in targetShipokDetails" 
                :key="targetShipokDetails.id + index" 
                  class="odd:bg-white even:bg-green-50">
                  <!-- <td class="py-2 px-4 text-sm ">{{ targetShipokDetail.id }}</td> -->
                  <td class="py-2 px-2 text-sm text-center border">{{ targetShipokDetail.eval_month }}</td>
                  <td class="py-2 px-2 text-sm  text-center border">{{ targetShipokDetail.eval_year }}</td>
                  <!-- <td class="py-2 px-4 text-sm text-green-800">{{ targetShipokDetail.date }}</td> -->
                  <td class="py-2 px-2 text-sm  text-center border">{{ targetShipokDetail.target }}</td>
                  <td class="py-2 px-2 text-sm  text-center border">{{ targetShipokDetail.shipok }}</td>
                  <td class="py-2 px-2 text-sm   text-center border font-bold"
                    :class="{
                      'text-red-500': percentage(targetShipokDetail) <= 50,
                      'text-green-500': percentage(targetShipokDetail) >= 51 && percentage(targetShipokDetail) <= 100,
                      'text-purple-500': percentage(targetShipokDetail) > 100
                    }"
                    >{{ percentage(targetShipokDetail)}}% </td>
                  <td class="py-2 px-2 text-sm  text-center font-medium border">{{ targetShipokDetail.market_name.toUpperCase() }}</td> 
                  <td class="py-2 px-2 text-sm  text-center font-medium border">{{ targetShipokDetail.team_name.toUpperCase()}}</td>
                  <td class="py-1 px-2 text-sm  text-center border text-green-800  flex justify-center items-center gap-2">
                    <button 
                        :disabled="currentUser.role == 'user' ||
                        currentUser.agent_type == 1 ||
                        currentUser.agent_type == 0  || 
                        fullyear == true"
                        @click="openModal('edit', targetShipokDetail)" 
                        class="bg-green-500 text-white py-1 px-3 rounded-lg hover:bg-green-600  disabled:bg-gray-400 disabled:cursor-not-allowed">
                        Edit
                    </button>
                    <button  
                      :disabled="currentUser.role == 'user' ||
                        currentUser.agent_type == 1 || 
                        currentUser.agent_type == 0 ||
                        currentUser.agent_type == 2"
                        @click="deleteTarget(targetShipokDetail)" 
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
            <h2 class="text-xl font-bold mb-4">{{ modalType === 'add' ? `Add  Target/Shipok`  : `Edit Target/Shipok` }}</h2>
              <form @submit.prevent="submitForm">
                
                    <div class="mb-4">
                      <label class="block text-sm font-medium mb-2">Agent ID</label>
                      <input v-model="form.id" type="number" class="w-full border rounded-lg p-2" disabled required />
                    </div>
                    
                    <div class="mb-4">
                      <label class="block text-sm font-medium mb-2">MOnth</label>
                      <input type="text" class="w-full border rounded-lg p-2" v-model="form.eval_month" disabled required />
                    </div>

                    <!-- Year Field - Current Year -->
                    <div class="mb-4">
                      <label class="block text-sm font-medium mb-2">Year</label>
                      <input type="text" class="w-full border rounded-lg p-2" v-model="form.eval_year" disabled required />
                    </div>
              
                    <div class="mb-4" >
                          <label class="block text-sm font-medium mb-2">Target</label>
                          <input v-model="form.target" :disabled="currentUser.login_type != 'standarduser'" type="text" class="w-full border rounded-lg p-2"  />
                          <p v-if="errorTarget" class="text-red-500 text-sm mt-2">{{ errorTarget }}</p>
                    </div>
                    <div class="mb-4"  >
                          <label class="block text-sm font-medium mb-2">ShipOk</label>
                          <input v-if="currentUser.login_type == 'standarduser'" v-model="form.shipok" type="text" class="w-full border rounded-lg p-2"  />
                          <input v-else v-model="shipOKEntry" type="text" class="w-full border rounded-lg p-2"  />
                          <p v-if="errorShipOk" class="text-red-500 text-sm mt-2">{{ errorShipOk }}</p>
                    </div>                
                    <div class="flex justify-end gap-2">
                        <button type="button" @click="closeModal" class="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600">Cancel</button>
                        <button  :disabled="currentUser.role == 'user'"   type="submit" class="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600  disabled:bg-gray-400 disabled:cursor-not-allowed"  >
                            Submit
                         </button>
                  </div>
              </form>
          </div>
        </div>
    </div>
  </template>
  
  <script setup>
      import { ref, defineProps, defineEmits,computed, onMounted, watch } from 'vue';
      import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

        //get the current user
      const authStore = useAuthStore()
      authStore.fetchTokenFromLocalStore()

      const currentUser = authStore.state.user 
      

      const route = useRoute()
      const router = useRouter()
    
      const props = defineProps({

          targetShipokDetails: {
              type: Object,
              required: true,
          },
          agent: {
            type: Object,
            required: true
          },
          fullyear: {
            type: Boolean, 
            required: true
          }
      });

    const showModal = ref(false);
    const  errorTarget = ref("")
    const errorShipOk = ref("")
    const modalType = ref('add');
    const month = ref(null)
    const year = ref(null)

    const shipOKEntry = ref("")


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

    const today = new Date()
    const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const agent_id = route.params.agent_id
 
    const form = ref({
        id: agent_id,
        eval_month: month.value,
        eval_year:  year.value,
        date: date,
        target: '',
        shipok: '',
        market_id: '',
      
      });

        // Validate Target input on every keystroke
    const validateTarget = () =>{
          if (form.value.target === "" || !/^\d+$/.test(form.value.target)) {
            errorTarget.value= "Please enter a valid whole number.";
          } else {
            errorTarget.value = "";
          }
    }

        // Validate Ship OK input on every keystroke
    const validateShipOk  = () => {
         if(currentUser.login_type == 'standarduser' && currentUser.role == 'admin'){
          if (form.value.shipok === "" || !/^\d+$/.test(form.value.shipok)) {
            errorShipOk.value = "Please enter a valid whole number.";
          } else {
            errorShipOk.value = "";
          }
        }else{
          if (shipOKEntry.value === "" || !/^[+-]?\d+$/.test(shipOKEntry)) {
            errorShipOk.value = "Please enter a valid whole number (positive or negative).";
          } else {
            errorShipOk.value = "";
          }
        }
        
     }


    const openModal = (type, agent = null) => {
       
      if(props.agent.employee_status == 'Resigned'){
        alert(`Adding or Updating Target/Shipok of Resigned Agent  is prohibited. `)
        return
      }

      if( agent != null && agent.employee_status == 'Resigned'){
         alert(`Adding or Updating Target/Shipok of Resigned Agent  is prohibited. `)
         return
        }
      //Dont allow delete  on already submitted.
       if(agent != null && agent.submitted == 1){
        alert(`Adding or Updating Target/Shipok that already submitted is prohibited. `)
        return
       }

        modalType.value = type;
        showModal.value = true;

        if (type === 'edit' && agent !== null) {
          validateTarget();
          validateShipOk();
          form.value = { ...agent}

        }
   
      
      };

   const closeModal = () => {
        showModal.value = false
        errorShipOk.value = ""
        errorTarget.value = ""
        shipOKEntry.value = ""
      }
      
    const percentage = ((data) => {
        
        return Math.ceil((Number(data.shipok) / Number(data.target)) * 100 * 100) / 100;
      })
      
    const emit = defineEmits(['passNewTarget', 'passUpdatedTarget', 'passDeleteTarget'])

    const submitForm = () => {
          // If there are any errors, do not proceed
          if (errorTarget.value || errorShipOk.value) {
            return;
          }

          if (modalType.value === 'add') {

          emit('passNewTarget', agent_id,{month:month.value, year:year.value}, form.value )

          } else if (modalType.value === 'edit') {
            if (currentUser.login_type == 'standarduser' && currentUser.role == 'admin') {
              emit('passUpdatedTarget', agent_id,{month:month.value, year:year.value}, form.value )
            }else{
              // do some shipok manipulation before emitting
              form.value.shipok =  Number(form.value.shipok) + Number(shipOKEntry.value)
              if (form.value.shipok < 0) {
                alert("Ship OK value cannot be negative.");
                return
              }
              emit('passUpdatedTarget', agent_id,{month:month.value, year:year.value}, form.value )
            }
            closeModal();
          }
          closeModal();
      };
      
    const deleteTarget = (agent) => {
      //Dont allow delete on agent that already resigne

      if(agent.employee_status == 'Resigned'){
         alert(`Deleting Target/Shipok of Resigned Agent  is prohibited. `)
         return
      }
      //Dont allow delete  on already submitted.
       if(agent.submitted == 1){
        alert(`Deleting Target/Shipok that already submitted is prohibited. `)
        return
       }


       //dont allow delete not admin

       if(currentUser.role != 'admin'){
         alert('Access Denied')
       }

       

        if (confirm(`Are you sure you want to delete this target?`)) {

        emit('passDeleteTarget', agent.id, {month:month.value, year:year.value}, "" )

        }
      };

    const hasTarget = computed(() => {
        return props.targetShipokDetails.length === 1 //if already has target
          ? 'ml-2 bg-gray-500 text-white py-1 px-3 rounded-lg flex items-center gap-2 cursor-not-allowed' // Disabled styles
          : 'ml-2 bg-green-500 text-white py-1 px-3 rounded-lg flex items-center gap-2 hover:bg-green-600'; // Enabled styles
      });

    watch(route, async (newRoute) => {
        console.log("The route is changed, reacting to the change..");
        router.push(newRoute.fullPath);
        month.value = newRoute.query.month 
        year.value = newRoute.query.year

      });

      // Watcher for the target field
    watch(
        () => form.value.target,
        (newValue) => {
          // If empty or not a whole number, set error
          if (newValue === '' || !/^\d+$/.test(newValue)) {
            errorTarget.value = 'Please enter a valid whole number.';
          } else {
            errorTarget.value = '';
          }
        }
      );

      // Watcher for the ship_ok field
    watch(
        () => form.value.shipok,
        (newValue) => {
          // If empty or not a whole number, set error
          if (newValue === '' || !/^\d+$/.test(newValue)) {
            errorShipOk.value = 'Please enter a valid whole number.';
          } else {
            errorShipOk.value = '';
          }
        }
      );

       watch(
        () => shipOKEntry.value,
        (newValue) => {
          // If empty or not a whole number, set error
          if (newValue === '' || !/^[+-]?\d+$/.test(newValue)) {
            errorShipOk.value = 'Please enter a valid whole number (positive or negative).';
          } else {
            errorShipOk.value = '';
          }
        }
      );   

  </script>
  
  <style>
  /* Add custom styles if needed */
  </style>
  