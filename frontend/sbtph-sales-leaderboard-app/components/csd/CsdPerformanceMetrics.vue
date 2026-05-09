<template>
    <div >
        <!-- Modal -->
        <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-lg p-6 w-1/3">
            <h2 class="text-xl font-bold mb-4" v-if="modalType === 'add'">{{ modalMeticsTypeMessage[0] }}</h2>
              <h2 class="text-xl font-bold mb-4" v-else>{{ modalMeticsTypeMessage[1] }}</h2>
              <form @submit.prevent="submitForm">
                
                    <div class="mb-4">
                      <label class="block text-sm font-medium mb-2">Employee ID</label>
                      <input v-model="form.employee_id" type="number" class="w-full border rounded-lg p-2" disabled required />
                    </div>
                    
                    <div class="mb-4">
                      <label class="block text-sm font-medium mb-2">MOnth</label>
                      <input type="text" class="w-full border rounded-lg p-2" v-model="form.month" disabled required />
                    </div>

                    <!-- Year Field - Current Year -->
                    <div class="mb-4">
                      <label class="block text-sm font-medium mb-2">Year</label>
                      <input type="text" class="w-full border rounded-lg p-2" v-model="form.year" disabled required />
                    </div>
                    <div v-if="metricsType == 'email_response_time'">
                        <div class="mb-4" >
                          
                              <label class="block text-sm font-medium mb-2">Average Email Response Time</label>
                              <input v-model="form.avg_response_minutes" :disabled="currentUser.role != 'admin'" type="text" class="w-full border rounded-lg p-2"  />
                              <p v-if="errorOtherMetrics" class="text-red-500 text-sm mt-2">{{ errorOtherMetrics }}</p>
                        </div>
                     
                    </div>   
                    
                     <div v-if="metricsType == 'email_response_count'">
                        <div class="mb-4" >
                          
                              <label class="block text-sm font-medium mb-2">Response Count</label>
                              <input v-model="form.response_count" :disabled="currentUser.role != 'admin'" type="text" class="w-full border rounded-lg p-2"  />
                              <p v-if="errorOtherMetrics" class="text-red-500 text-sm mt-2">{{ errorOtherMetrics }}</p>

                              <label class="block text-sm font-medium mb-2">Resolved Tickets</label>
                              <input v-model="form.resolved_tickets" :disabled="currentUser.role != 'admin'" type="text" class="w-full border rounded-lg p-2"  />
                              <p v-if="errorOtherMetrics" class="text-red-500 text-sm mt-2">{{ errorOtherMetrics }}</p>
                        </div>
                     
                    </div>  

                     <div v-if="metricsType == 'error_report'">
                        <div class="mb-4" >
                          
                              <label class="block text-sm font-medium mb-2">Intial Result</label>
                              <input v-model="form.inital_result" disabled  />
                              <p v-if="errorOtherMetrics" class="text-red-500 text-sm mt-2">{{ errorOtherMetrics }}</p>

                              <label class="block text-sm font-medium mb-2">Error Count</label>
                              <input v-model="form.error_count" :disabled="currentUser.role != 'admin'" type="text" class="w-full border rounded-lg p-2"  />
                              <p v-if="errorOtherMetrics" class="text-red-500 text-sm mt-2">{{ errorOtherMetrics }}</p>
                        </div>
                     
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
     
        //get the current user
      const authStore = useAuthStore()
      authStore.fetchTokenFromLocalStore()

      const currentUser = authStore.state.user 


      

      const route = useRoute()
      const router = useRouter()
    
      const props = defineProps({

          agentData: {
            type: Object,
            required: true
          },
          showModal: {
            type: Boolean, 
            required: true
          },
          modalType: {
            type: String,
            required: true
          },
          modalMeticsTypeMessage: {
            type: Array, 
            required:true
          },
          metricsType: {
            type: String, 
            required: true
          }
      });

   // const showModal = ref(false);
    const  errorTarget = ref("")
    const errorOtherMetrics = ref("")


    const month = ref(null)
    const year = ref(null)

    const userEntry = ref("")
    
  

    const today = new Date()
    const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const agent_id = route.params.agent_id
   
   
    const form = ref({
        employee_id: '',
        month: '',
        year: '',
        avg_response_minutes: '',
        response_count: '',
        resolved_tickets: '',
        inital_result: '',
        error_count: ''
        
    })



 
    const emit = defineEmits([ 'passClose', 'passAddDataAgent', 'passEditDataAgent', 'passDeleteDataAgent'])

    const closeModal = () => {
       form.value = {
            employee_id: '',
            month: '',
            year: '',
            avg_response_minutes: '',
           response_count: '',
           resolved_tickets: '',
           inital_result: '',
           error_count: ''

         
          }

         userEntry.value = ''
        errorOtherMetrics.value = ''
        errorTarget.value = ''


       emit('passClose' )
      }

    const otherMetricsDataManipulation = (currentMetrics, newEntryMetircs ) => {
       let methodType = "add"
       let total;
        if(Number(newEntryMetircs) < 0 ){  // the entry is number but greater than zero
            methodType =  'delete'
        }

        total = Number(currentMetrics) + Number(newEntryMetircs)


        return { methodType, total}
    }
    const submitForm = () => {
          // If there are any errors, do not proceed
          if (errorTarget.value ||  errorOtherMetrics.value ) {
         
            return;
          }

          errorOtherMetrics.value = ''
          errorTarget.value = ''
          let dataManipulation

    
        switch(props.metricsType) {
          case "email_response_time":
          case "email_response_count":
          case "error_report":
               if (props.modalType === 'add'){
                 emit('passAddDataAgent', "", form.value)
               }else if (props.modalType === 'edit'){
                 emit('passEditDataAgent',  "", form.value )
               }
               closeModal();
            break
       

  
          default:
            console.log('Invalid Metrics type')
            break
        }

      };
      
    const deleteTarget = (agent_id, target_date) => {
        if (confirm(`Are you sure you want to delete this target?`)) {

        emit('passDeleteTarget', agent_id, {month:month.value, year:year.value}, target_date )

        }
      };




      // Watcher for the target field
    watch (() => props.metricsType, (newValue) => {
       if(newValue != 'targetShipok'){
        errorTarget.value = ''
       }else{
        errorOtherMetrics.value = ''
       }
    })
   
    watch( () => form.value.avg_response_minutes, (newValue) => {
       if(newValue === '' || !/^[+-]?\d+$/.test(newValue)){
         errorOtherMetrics.value = 'Please enter a valid whole number'
       }else{
         errorOtherMetrics.value = '';
       }
       form.value.avg_response_minutes = Number(newValue)
    })


    watch( () => form.value.response_count, (newValue) => {
       if(newValue === '' || !/^[+-]?\d+$/.test(newValue)){
         errorOtherMetrics.value = 'Please enter a valid whole number'
       }else{
         errorOtherMetrics.value = '';
       }
       form.value.response_count = Number(newValue)
    })

    watch( () => form.value.resolved_tickets, (newValue) => {
       if(newValue === '' || !/^[+-]?\d+$/.test(newValue)){
         errorOtherMetrics.value = 'Please enter a valid whole number'
       }else{
         errorOtherMetrics.value = '';
       }
       form.value.resolved_tickets = Number(newValue)
    })

    watch( () => form.value.error_count, (newValue) => {
       if(newValue === '' || !/^[+-]?\d+$/.test(newValue)){
         errorOtherMetrics.value = 'Please enter a valid whole number'
       }else{
         errorOtherMetrics.value = '';
       }
       form.value.error_count = Number(newValue)
    })
      
      
      
    watch(
    () => props.agentData,
    (newVal) => {
        if (newVal) {

        form.value = {
            employee_id: newVal.employee_id|| "",
            agent_dbname: newVal.agent_dbname || "",
            agent_image_link: newVal.image_link || "",
            month: newVal.month || "",
            year: newVal.year || "",
       
            date: date,
            shipok: newVal.shipok || "",
       
            team_id: newVal.team_id || 0,
            avg_response_minutes: newVal.avg_response_minutes || "",
            response_count: newVal.response_count || 0,
            resolved_tickets:  newVal.resolved_tickets|| 0, 
            inital_result: newVal.inital_result || 100,
            error_count : newVal.error_count || 0,
           
        }
        // if(props.metricsType == 'targetShipok'){
        //    userEntry.value = newVal.shipok || ""
        // }
       
        }
    },
    { immediate: true } // run once on mount
    )   

  </script>
  
  <style>
  /* Add custom styles if needed */
  </style>
  