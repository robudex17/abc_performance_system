<template>
    <div >
        <!-- Modal -->
        <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-lg p-6 w-1/3">
            <h2 class="text-xl font-bold mb-4" v-if="modalType === 'add'">{{ modalMeticsTypeMessage[0] }}</h2>
              <h2 class="text-xl font-bold mb-4" v-else>{{ modalMeticsTypeMessage[1] }}</h2>
              <form @submit.prevent="submitForm">
                
                    <div class="mb-4">
                      <label class="block text-sm font-medium mb-2">Agent ID</label>
                      <input v-model="form.agent_id" type="number" class="w-full border rounded-lg p-2" disabled required />
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
                    <div v-if="metricsType == 'targetShipok'">
                        <div class="mb-4" >
                          
                              <label class="block text-sm font-medium mb-2">Target</label>
                              <input v-model="form.target" :disabled="currentUser.role != 'admin'" type="text" class="w-full border rounded-lg p-2"  />
                              <p v-if="errorTarget" class="text-red-500 text-sm mt-2">{{ errorTarget }}</p>
                        </div>
                        <div class="mb-4"  >
                              <label class="block text-sm font-medium mb-2">ShipOk</label>
                              <input v-if="currentUser.role == 'admin'" v-model="form.shipok" type="text" class="w-full border rounded-lg p-2" />
                              <input v-else v-model="userEntry" type="text" class="w-full border rounded-lg p-2"  />
                              <p v-if="errorOtherMetrics" class="text-red-500 text-sm mt-2">{{ errorOtherMetrics }}</p>
                        </div>   
                    </div>

                    <div v-if="metricsType == 'newDeposit'">
                        <div class="mb-4" >
                          
                              <label class="block text-sm font-medium mb-2">Total New Deposit</label>
                              <input v-model="form.total_new_deposit" disabled  type="text" class="w-full border rounded-lg p-2"  />
                              <!-- <p v-if="errorOtherMetrics" class="text-red-500 text-sm mt-2">{{ errorOtherMetrics }}</p> -->
                        </div>
                        <div class="mb-4"  >
                              <label class="block text-sm font-medium mb-2">Add New Customer Deposit</label>
                              <input  v-model="userEntry" type="text" class="w-full border rounded-lg p-2" />
                              <p v-if="errorOtherMetrics" class="text-red-500 text-sm mt-2">{{ errorOtherMetrics }}</p>
                        </div>   
                    </div>

                    <div v-if="metricsType == 'absence'">
                        <div class="mb-4" >
                          
                              <label class="block text-sm font-medium mb-2">Total Absences</label>
                              <input v-model="form.total_absences" disabled  type="text" class="w-full border rounded-lg p-2"  />
                              <!-- <p v-if="errorOtherMetrics" class="text-red-500 text-sm mt-2">{{ errorOtherMetrics }}</p> -->
                        </div>
                        <div class="mb-4"  >
                              <label class="block text-sm font-medium mb-2">Add New Absence</label>
                              <input  v-model="userEntry" type="text" class="w-full border rounded-lg p-2" />
                              <p v-if="errorOtherMetrics" class="text-red-500 text-sm mt-2">{{ errorOtherMetrics }}</p>
                        </div>   
                    </div>

                    <div v-if="metricsType == 'tardiness'">
                        <div class="mb-4" >
                          
                              <label class="block text-sm font-medium mb-2">Total Tardiness</label>
                              <input v-model="form.total_tardiness" disabled  type="text" class="w-full border rounded-lg p-2"  />
                              <!-- <p v-if="errorOtherMetrics" class="text-red-500 text-sm mt-2">{{ errorOtherMetrics }}</p> -->
                        </div>
                        <div class="mb-4"  >
                              <label class="block text-sm font-medium mb-2">Add New Tardiness</label>
                              <input  v-model="userEntry" type="text" class="w-full border rounded-lg p-2" />
                              <p v-if="errorOtherMetrics" class="text-red-500 text-sm mt-2">{{ errorOtherMetrics }}</p>
                        </div>   
                    </div>

                     <div v-if="metricsType == 'memo'">
                        <div class="mb-4" >
                          
                              <label class="block text-sm font-medium mb-2">Total Memo</label>
                              <input v-model="form.total_memo" disabled  type="text" class="w-full border rounded-lg p-2"  />
                              <!-- <p v-if="errorOtherMetrics" class="text-red-500 text-sm mt-2">{{ errorOtherMetrics }}</p> -->
                        </div>
                        <div class="mb-4"  >
                              <label class="block text-sm font-medium mb-2">Add New Memo</label>
                              <input  v-model="userEntry" type="text" class="w-full border rounded-lg p-2" />
                              <p v-if="errorOtherMetrics" class="text-red-500 text-sm mt-2">{{ errorOtherMetrics }}</p>
                        </div>   
                    </div>

                   <div v-if="metricsType == 'feedback_admin' || metricsType == 'feedback_qa' ">
     
                        <div class="mb-4"  >
                              <label class="block text-sm font-medium mb-2">Feedback</label>
                              <input  v-model="form.feedback" type="text" class="w-full border rounded-lg p-2" />
                              <p v-if="errorOtherMetrics" class="text-red-500 text-sm mt-2">{{ errorOtherMetrics }}</p>
                        </div>   
                    </div>

                   <div v-if="metricsType == 'deduction' ">
     
                        <div class="mb-4"  >
                              <label class="block text-sm font-medium mb-2">Deduction</label>
                              <input  v-model="form.deduction" type="text" class="w-full border rounded-lg p-2" />
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
        agent_id: '',
        month: '',
        year: '',
        date: '',
        target: '',
        shipok: '',
        total_new_deposit: '',
        total_absences: '',
        total_tardiness: '',
        total_memo: '',
        deduction: ''
         
      
        
    })



 
    const emit = defineEmits([ 'passClose', 'passAddDataAgent', 'passEditDataAgent', 'passDeleteDataAgent'])

    const closeModal = () => {
       form.value = {
            agent_id: '',
            month: '',
            year: '',
            date: '',
           target:'',
           shipok: '',
          total_new_deposit: '',
          total_absences: '',
          total_tardiness: '',
          total_memo: '',
           deduction: '',
         
          }

       userEntry.value = ''
        errorOtherMetrics.value = ''
        errorTarget.value = ''


       emit('passClose'  )
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

          const dataMetricsObject = {
            "newDeposit": form.value.total_new_deposit,
            "absence": form.value.total_absences,
            "tardiness": form.value.total_tardiness,
            "memo": form.value.total_memo
          }
        switch(props.metricsType) {
          
          case "targetShipok":
              if (props.modalType === 'add') {
                  emit('passAddDataAgent', "", form.value)
                 
              } else if (props.modalType === 'edit') {
                if (currentUser.role == 'admin') {
                  emit('passEditDataAgent',  "", form.value )
                 
                }else{
                  // do some shipok manipulation before emitting
                  form.value.shipok =  Number(form.value.shipok) + Number(userEntry.value)
                  if (form.value.shipok < 0) {
                    alert("Ship OK value cannot be negative.");
                    return
                  }
                  emit('passEditDataAgent', "", form.value )
                }
                
              }
            
              closeModal();
              
              break
          case "newDeposit": 
          case "absence":
          case "tardiness":
          case "memo":
        
            dataManipulation = otherMetricsDataManipulation( dataMetricsObject[props.metricsType], userEntry.value, props.metricsType)
             if(Number(dataManipulation.total) < 0){
              alert(`You can't delete greater than the current  ${props.metricsType}` )
              userEntry.value = ''
              return
            }

            if(dataManipulation.methodType == 'add'){
               emit('passAddDataAgent', userEntry.value, form.value )
            }else if(dataManipulation.methodType == 'delete'){
               emit('passDeleteDataAgent', Math.abs(userEntry.value), form.value)
            }
             closeModal();
            break 

          case "feedback_admin":
          case "feedback_qa":
            if(props.modalType === 'add'){
              emit('passAddDataAgent', "", form.value)
            }else if(props.modalType == 'edit'){
               emit('passEditDataAgent',  "", form.value )
            }
            closeModal();
            break
          case "deduction":  
            if(props.modalType === 'add'){
              emit('passAddDataAgent', "", form.value)
            }else if(props.modalType == 'edit' && Number(form.value.deduction) === 0){
               emit('passDeleteDataAgent',"" ,form.value )
            }else if(props.modalType == 'edit' && Number(form.value.deduction) > 0){
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
    watch(
        () => form.value.target,

        (newValue) => {
          // If empty or not a whole number, set error
        
          if (newValue === '' || !/^\d+$/.test(newValue) || Number(newValue) == 0) {
            errorTarget.value = 'Please enter a valid whole number And Should not be a zero.';
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
           errorOtherMetrics.value = 'Please enter a valid whole number.';
          } else {
            errorOtherMetrics.value = '';
          }
        }
      );


      // Watcher for the fedback field
    watch(
        () => form.value.feedback,
        (newValue) => {
          // If empty or not a whole number, set error
          if (!newValue || !/^\d+(\.\d+)?$/.test(form.value.feedback)) {
           errorOtherMetrics.value = `Please enter a valid numeric ${props.metricsType}.`;
          } else if(parseFloat(newValue) > 5){
             errorOtherMetrics.value = 'The Highest Feedback you can give is 5.0.';
          } else if(parseFloat(newValue) == 0 || parseFloat(newValue) < 0){
             errorOtherMetrics.value = 'Feedback value of zero(0) or negative value is not allowed';
          }
          else {
            errorOtherMetrics.value = '';
          }
        }
      );  
      
      // Watcher for the fedback field
    watch(
        () => form.value.deduction,
        (newValue) => {
          // If empty or not a whole number, set error
          if (!newValue || !/^\d+(\.\d+)?$/.test(form.value.deduction)) {
           errorOtherMetrics.value = `Please enter a valid numeric ${props.metricsType}.`;
          } else if(parseFloat(newValue) > 5){
             errorOtherMetrics.value = 'The Highest Deduction you can give is 5.0.';
          }   
          // } else if(parseFloat(newValue) == 0 || parseFloat(newValue) < 0){
          //    errorOtherMetrics.value = 'Deduction value of zero(0) or negative value is not allowed';
          // }
          else {
            errorOtherMetrics.value = '';
          }
        }
      );      
      


      
      
  
       watch(
        () => userEntry.value,
        (newValue) => {
          // If empty or not a whole number, set error
          if (newValue === '' || !/^[+-]?\d+$/.test(newValue) || Number(newValue) == 0) {
            errorOtherMetrics.value = 'Please enter a valid whole number (positive or negative) and it should not be zero.';
          } else {
            errorOtherMetrics.value = '';
          }
          form.value.userEntry  = Number(newValue)
        }
      ); 
    

      
    watch(
    () => props.agentData,
    (newVal) => {
        if (newVal) {

        form.value = {
            agent_id: newVal.agent_id || "",
            agent_dbname: newVal.agent_dbname || "",
            agent_image_link: newVal.image_link || "",
            month: newVal.month || "",
            year: newVal.year || "",
            target: newVal.target || "",
            date: date,
            shipok: newVal.shipok || "",
            total_new_deposit:  newVal.total_new_deposit || 0,
            total_absences: newVal.total_absences || 0,
            total_tardiness: newVal.total_tardiness || 0 ,
            total_memo: newVal.total_memo || 0,
            feedback: newVal.feedback || "",
            deduction: newVal.deduction || "",
            team_id: newVal.team_id || 0,
           
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
  