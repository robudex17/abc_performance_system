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
                      <label class="block text-sm font-medium mb-2">Db Name</label>
                      <input v-model="form.agent_dbname" type="text" class="w-full border rounded-lg p-2" disabled required />
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
                              <input v-model="form.inital_result"  type="text" class="w-full border rounded-lg p-2" disabled  />
                              <p v-if="errorOtherMetrics" class="text-red-500 text-sm mt-2">{{ errorOtherMetrics }}</p>

                              <label class="block text-sm font-medium mb-2">Error Count</label>
                              <input v-model="form.error_count" :disabled="currentUser.role != 'admin'" type="text" class="w-full border rounded-lg p-2"  />
                              <p v-if="errorOtherMetrics" class="text-red-500 text-sm mt-2">{{ errorOtherMetrics }}</p>
                        </div>
                     
                    </div>  

                     <div v-if="metricsType == 'customer_satisfaction_report'">
                        <div class="mb-4" >
                              <label class="block text-sm font-medium mb-2">Total Feedback</label>
                              <input v-model="form.csr_total_feedback"  type="text" class="w-full border rounded-lg p-2" disabled />
                              <p v-if="errorOtherMetrics" class="text-red-500 text-sm mt-2">{{ errorOtherMetrics }}</p>

                              <label class="block text-sm font-medium mb-2">Resolved Tickets</label>
                              <input v-model="form.resolved_tickets"  type="text" class="w-full border rounded-lg p-2" disabled />
                              <p v-if="errorOtherMetrics" class="text-red-500 text-sm mt-2">{{ errorOtherMetrics }}</p>                              

                              <label class="block text-sm font-medium mb-2">Not Good</label>
                              <input v-model="form.customer_not_good" :disabled="currentUser.role != 'admin'" type="text" class="w-full border rounded-lg p-2"  />
                              <p v-if="errorOtherMetrics" class="text-red-500 text-sm mt-2">{{ errorOtherMetrics }}</p>

                              <label class="block text-sm font-medium mb-2">Just Ok</label>
                              <input v-model="form.customer_just_ok" :disabled="currentUser.role != 'admin'" type="text" class="w-full border rounded-lg p-2"  />
                              <p v-if="errorOtherMetrics" class="text-red-500 text-sm mt-2">{{ errorOtherMetrics }}</p>

                              <label class="block text-sm font-medium mb-2">Awesome</label>
                              <input v-model="form.customer_awesome" :disabled="currentUser.role != 'admin'" type="text" class="w-full border rounded-lg p-2"  />
                              <p v-if="errorOtherMetrics" class="text-red-500 text-sm mt-2">{{ errorOtherMetrics }}</p>                              


                        </div>
                     </div>   

                     <div v-if="metricsType == 'call_email_calibration'">
                        <div class="mb-4" >
                              <label class="block text-sm font-medium mb-2">Not Good</label>
                             <input v-model="form.calibration_not_good" :disabled="currentUser.role != 'admin'" type="text" class="w-full border rounded-lg p-2"  />
                              <p v-if="errorOtherMetrics" class="text-red-500 text-sm mt-2">{{ errorOtherMetrics }}</p>

                              <label class="block text-sm font-medium mb-2">Just Ok</label>
                              <input v-model="form.calibration_just_ok" :disabled="currentUser.role != 'admin'" type="text" class="w-full border rounded-lg p-2"  />
                              <p v-if="errorOtherMetrics" class="text-red-500 text-sm mt-2">{{ errorOtherMetrics }}</p>

                              <label class="block text-sm font-medium mb-2">Awesome</label>
                              <input v-model="form.calibration_awesome" :disabled="currentUser.role != 'admin'" type="text" class="w-full border rounded-lg p-2"  />
                              <p v-if="errorOtherMetrics" class="text-red-500 text-sm mt-2">{{ errorOtherMetrics }}</p>                              


                        </div>                        
                     
                    </div>    


                  <div v-if="metricsType == 'outboundcalls'">
                        <div class="mb-4" >
                              <label class="block text-sm font-medium mb-2">Total Outbound Calls</label>
                             <input v-model="form.total_outbound_calls"  type="text" class="w-full border rounded-lg p-2" disabled  />
                              <p v-if="errorOtherMetrics" class="text-red-500 text-sm mt-2">{{ errorOtherMetrics }}</p>

                              <label class="block text-sm font-medium mb-2">Agent Outbound Calls</label>
                              <input v-model="form.outbound_calls" type="text" class="w-full border rounded-lg p-2" disabled />
                              <p v-if="errorOtherMetrics" class="text-red-500 text-sm mt-2">{{ errorOtherMetrics }}</p>

                        </div>                        
                     
                    </div>  
                    
                    
                  <div v-if="metricsType == 'inboundcalls'">
                        <div class="mb-4" >
                              <label class="block text-sm font-medium mb-2">Total Inbound Calls</label>
                             <input v-model="form.total_inbound_calls"  type="text" class="w-full border rounded-lg p-2" disabled  />
                              <p v-if="errorOtherMetrics" class="text-red-500 text-sm mt-2">{{ errorOtherMetrics }}</p>

                              <label class="block text-sm font-medium mb-2">Agent Inbound Calls</label>
                              <input v-model="form.inbound_calls" type="text" class="w-full border rounded-lg p-2" disabled />
                              <p v-if="errorOtherMetrics" class="text-red-500 text-sm mt-2">{{ errorOtherMetrics }}</p>

                        </div>                        
                     
                    </div>   


                    
                    
                   <div v-if="metricsType == 'missedcalls'">
                        <div class="mb-4" >
                              <label class="block text-sm font-medium mb-2">Total Missed Calls</label>
                             <input v-model="form.total_missed_calls"  type="text" class="w-full border rounded-lg p-2" disabled  />
                              <p v-if="errorOtherMetrics" class="text-red-500 text-sm mt-2">{{ errorOtherMetrics }}</p>

                              <label class="block text-sm font-medium mb-2">Agent Missed Calls</label>
                              <input v-model="form.missed_calls" type="text" class="w-full border rounded-lg p-2" disabled />
                              <p v-if="errorOtherMetrics" class="text-red-500 text-sm mt-2">{{ errorOtherMetrics }}</p>

                        </div>                        
                     
                    </div>                       
                                                            

                      <div v-if="metricsType == 'attrition_rate'">
                        <div class="mb-4" >
                              <label class="block text-sm font-medium mb-2">Opening HC</label>
                             <input v-model="form.opening_hc"  class="w-full border rounded-lg p-2"  disabled />
                              <p v-if="errorOtherMetrics" class="text-red-500 text-sm mt-2">{{ errorOtherMetrics }}</p>

                              <label class="block text-sm font-medium mb-2">Closing HC</label>
                              <input v-model="form.closing_hc"  type="text" class="w-full border rounded-lg p-2" disabled  />
                              <p v-if="errorOtherMetrics" class="text-red-500 text-sm mt-2">{{ errorOtherMetrics }}</p>

                              <label class="block text-sm font-medium mb-2">Number of Resignations</label>
                              <input v-model="form.no_of_resignation"  type="text" class="w-full border rounded-lg p-2" disabled />
                              <p v-if="errorOtherMetrics" class="text-red-500 text-sm mt-2">{{ errorOtherMetrics }}</p>                              


                        </div>                        
                     
                    </div>                     
                   <div class="flex justify-end gap-2">
                        <button type="button" @click="closeModal" class="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600">Cancel</button>
                        <button  :disabled="currentUser.role == 'user' || ['attrition_rate', 'missedcalls', 'inboundcalls', 'outboundcalls'].includes(metricsType) "   type="submit" class="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600  disabled:bg-gray-400 disabled:cursor-not-allowed"  >
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
        error_count: '',
        customer_not_good: '',
        customer_just_ok: '', 
        customer_awesome: '',
        csr_total_feedback: '',
        calibration_not_good: '',
        calibration_just_ok: '',
        calibration_awesome: '', 
        opening_hc: '',
        closing_hc: '',
        no_of_resignation: '',
        inbound_calls: '',
        outbound_calls: '',
        missed_calls: '', 
        total_inbound_calls: '',
        total_outbound_calls: '',
        total_missed_calls: ''
        
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
           error_count: '',
           customer_not_good: '',
           customer_just_ok: '', 
            customer_awesome: '',
           csr_total_feedback: '',
           calibration_not_good: '',
           calibration_just_ok: '',
           calibration_awesome: '',  
           opening_hc: '',
           closing_hc: '',
           no_of_resignation: '',   
           inbound_calls: '',
           outbound_calls: '',
           missed_calls: '', 
           total_inbound_calls: '',
           total_outbound_calls: '',
           total_missed_calls: ''       

         
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
          case "customer_satisfaction_report":
          case "call_email_calibration":
          case "inboundcalls":
          case "outboundcalls": 
          case "missedcalls":
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
        closeModal();
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
       if(newValue === '' || !/^[+-]?\d+$/.test(newValue) ){
         errorOtherMetrics.value = 'Please enter a valid whole number'
       }else{
         errorOtherMetrics.value = '';
       }
       form.value.response_count = Number(newValue)
    })

    watch( () => form.value.resolved_tickets, (newValue) => {
       if(newValue === '' || !/^[+-]?\d+$/.test(newValue) ){
         errorOtherMetrics.value = 'Please enter a valid whole number'
       }else{
         errorOtherMetrics.value = '';
       }
       form.value.resolved_tickets = Number(newValue)
    })

    watch( () => form.value.error_count, (newValue) => {
       if(newValue === '' || !/^[+-]?\d+$/.test(newValue) ){
         errorOtherMetrics.value = 'Please enter a valid whole number'
       }else{
         errorOtherMetrics.value = '';
       }
       form.value.error_count = Number(newValue)
    })

    watch( () => form.value.customer_not_good, (newValue) => {
       if(newValue === '' || !/^[+-]?\d+$/.test(newValue)){
         errorOtherMetrics.value = 'Please enter a valid whole number'
       }else{
         errorOtherMetrics.value = '';
       }
       form.value.customer_not_good = Number(newValue)
    })  
    
    
    watch( () => form.value.customer_just_ok, (newValue) => {
       if(newValue === '' || !/^[+-]?\d+$/.test(newValue)){
         errorOtherMetrics.value = 'Please enter a valid whole number'
       }else{
         errorOtherMetrics.value = '';
       }
       form.value.customer_just_ok = Number(newValue)
    })    
    
    
    watch( () => form.value.customer_awesome, (newValue) => {
       if(newValue === '' || !/^[+-]?\d+$/.test(newValue)){
         errorOtherMetrics.value = 'Please enter a valid whole number'
       }else{
         errorOtherMetrics.value = '';
       }
       form.value.customer_awesome = Number(newValue)
    })  

     watch( () => form.value.calibration_not_good, (newValue) => {
       if(newValue === '' || !/^[+-]?\d+$/.test(newValue)){
         errorOtherMetrics.value = 'Please enter a valid whole number'
       }else{
         errorOtherMetrics.value = '';
       }
       form.value.calibration_not_good = Number(newValue)
    }) 

     watch( () => form.value.calibration_just_ok, (newValue) => {
       if(newValue === '' || !/^[+-]?\d+$/.test(newValue)){
         errorOtherMetrics.value = 'Please enter a valid whole number'
       }else{
         errorOtherMetrics.value = '';
       }
       form.value.calibration_just_ok = Number(newValue)
    }) 
    
     watch( () => form.value.calibration_awesome, (newValue) => {
       if(newValue === '' || !/^[+-]?\d+$/.test(newValue)){
         errorOtherMetrics.value = 'Please enter a valid whole number'
       }else{
         errorOtherMetrics.value = '';
       }
       form.value.calibration_awesome = Number(newValue)
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
            avg_response_minutes: typeof(newVal.avg_response_minutes) === 'number' ? newVal.avg_response_minutes : '',
            response_count: typeof(newVal.response_count) === 'number' ? newVal.response_count : '',
            resolved_tickets:  typeof(newVal.resolved_tickets) === 'number' ? newVal.resolved_tickets : '',
            inital_result: newVal.inital_result || 100,
            error_count : typeof(newVal.error_count) === 'number' ? newVal.error_count : '',
            customer_not_good: typeof(newVal.customer_not_good) === 'number' ? newVal.customer_not_good : '',
            customer_just_ok:  typeof(newVal.customer_just_ok) === 'number' ? newVal.customer_just_ok : '',
            customer_awesome:  typeof(newVal.customer_awesome) === 'number' ? newVal.customer_awesome : '',
            csr_total_feedback:  typeof(newVal.csr_total_feedback) === 'number' ? newVal.csr_total_feedback : '',
            calibration_not_good: typeof(newVal.calibration_not_good) === 'number' ? newVal.calibration_not_good : '',
            calibration_just_ok:  typeof(newVal.calibration_just_ok) === 'number' ? newVal.calibration_just_ok : '',
            calibration_awesome:  typeof(newVal.calibration_awesome) === 'number' ? newVal.calibration_awesome : '',
            opening_hc: newVal.opening_hc ||  '',
            closing_hc: newVal.closing_hc ||  '',
            no_of_resignation: newVal.no_of_resignation || '',
            inbound_calls: newVal.inbound_calls || '',
            outbound_calls: newVal.outbound_calls || '',  
            missed_calls: newVal.missed_calls || '',
            total_inbound_calls: newVal.total_inbound_calls || '',
            total_outbound_calls: newVal.total_outbound_calls || '',
            total_missed_calls: newVal.total_missed_calls || ''
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
  