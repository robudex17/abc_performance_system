<template>
    <div >
        <!-- Modal -->
        <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-lg p-6 w-1/3">
            <h2 class="text-xl font-bold mb-4" v-if="modalType === 'add'">{{ modalEvalTypeMessage[0] }}</h2>
              <h2 class="text-xl font-bold mb-4" v-else>{{ modalEvalTypeMessage[1] }}</h2>
              <form @submit.prevent="submitForm">
                
                    <div class="mb-4">
                      <label class="block text-sm font-medium mb-2">Employee ID</label>
                      <input v-model="form.employee_id" type="number" class="w-full border rounded-lg p-2" disabled required />
                    </div>

                
                    <div class="mb-4">
                      <label class="block text-sm font-medium mb-2">DB Name</label>
                      <input v-model="form.db_name" type="text" class="w-full border rounded-lg p-2" disabled required />
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
     


                    <div v-if="evalType == 'absences'">
                     
                        <div class="mb-4" >
                          
                              <label class="block text-sm font-medium mb-2">Total Absences</label>
                              <input v-model="form.absences" disabled  type="number" class="w-full border rounded-lg p-2"  />
                              <!-- <p v-if="errorOtherMetrics" class="text-red-500 text-sm mt-2">{{ errorOtherMetrics }}</p> -->
                        </div>
                        <div class="mb-4"  >
                              <label class="block text-sm font-medium mb-2">Add New Absence</label>
                              <input  v-model="userEntry" type="text" class="w-full border rounded-lg p-2" />
                              <p v-if="errorOtherMetrics" class="text-red-500 text-sm mt-2">{{ errorOtherMetrics }}</p>
                        </div>   
                    </div>

                    <div v-if="evalType == 'tardiness'">
                        <div class="mb-4" >
                          
                              <label class="block text-sm font-medium mb-2">Total Tardiness</label>
                              <input v-model="form.tardiness" disabled  type="number" class="w-full border rounded-lg p-2"  />
                              <!-- <p v-if="errorOtherMetrics" class="text-red-500 text-sm mt-2">{{ errorOtherMetrics }}</p> -->
                        </div>
                        <div class="mb-4"  >
                              <label class="block text-sm font-medium mb-2">Add New Tardiness</label>
                              <input  v-model="userEntry" type="text" class="w-full border rounded-lg p-2" />
                              <p v-if="errorOtherMetrics" class="text-red-500 text-sm mt-2">{{ errorOtherMetrics }}</p>
                        </div>   
                    </div>

                     <div v-if="evalType == 'memo'">
                        <div class="mb-4" >
                          
                              <label class="block text-sm font-medium mb-2">Total Memo</label>
                              <input v-model="form.memo" disabled  type="number" class="w-full border rounded-lg p-2"  />
                              <!-- <p v-if="errorOtherMetrics" class="text-red-500 text-sm mt-2">{{ errorOtherMetrics }}</p> -->
                        </div>
                        <div class="mb-4"  >
                              <label class="block text-sm font-medium mb-2">Add New Memo</label>
                              <input  v-model="userEntry" type="text" class="w-full border rounded-lg p-2" />
                              <p v-if="errorOtherMetrics" class="text-red-500 text-sm mt-2">{{ errorOtherMetrics }}</p>
                        </div>   
                    </div>

                   <div v-if="evalType == 'feedback_by_admin'">
     
                        <div class="mb-4"  >
                              <label class="block text-sm font-medium mb-2">Feedback </label>
                              <input  v-model="form.feedback_by_admin" type="text" class="w-full border rounded-lg p-2" />
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
          modalEvalTypeMessage: {
            type: Array, 
            required:true
          },
          evalType: {
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
        db_name: '',
        month: '',
        year: '',
        absences: '',
        tardiness: '',
        memo: '', 
        feedback_by_admin: '' ,
        admin_id : '',
        admin_dbname: '',
        admin_role:  '',
    })



 
    const emit = defineEmits([ 'passClose', 'passAddDataAgent', 'passEditDataAgent', 'passDeleteDataAgent'])

    const closeModal = () => {
       form.value = {
        employee_id: '',
        db_name: '',
        month: '',
        year: '',       
        absences: '',
        tardiness: '',
        memo: '',
        feedback_by_admin: '',
        admin_id : currentUser.login_id,
        admin_dbname: currentUser.db_name,
        admin_role:  currentUser.role,
       
         
          }

        userEntry.value = ''
        errorOtherMetrics.value = ''
        errorTarget.value = ''


       emit('passClose')
      }

    const otherMetricsDataManipulation = (currentValue, newValue ) => {
       let methodType 
       let total;
     
        total = Number(currentValue) + Number(newValue)

        if (Number(currentValue) == 0 ){
           methodType = "add"
        }else if(total == 0){
          methodType = "delete"
        }else{
          methodType = "update"
        }

      
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
         
            "absences": form.value.absences,
            "tardiness": form.value.tardiness,
            "memo": form.value.memo
          }
        switch(props.evalType) {
          
          case "absences":
          case "tardiness":
          case "memo":
        
            dataManipulation = otherMetricsDataManipulation( dataMetricsObject[props.evalType], userEntry.value)
             if(Number(dataManipulation.total) < 0){
              alert(`You can't delete greater than the current  ${props.evalType}` )
              userEntry.value = ''
              return
            }
             form.value[props.evalType] = dataManipulation.total
             form.value.new_count =  dataManipulation.total
             
            if(dataManipulation.methodType == 'add'){
               
               emit('passAddDataAgent',  form.value )
            }else if(dataManipulation.methodType == 'update'){
               emit('passEditDataAgent', form.value)
            }else if(dataManipulation.methodType == 'delete'){
              emit('passDeleteDataAgent', form.value)
            }
             closeModal();
            break 

          case "feedback_by_admin":
            if(props.modalType === 'add'){
              emit('passAddDataAgent',  form.value)
            }else if(props.modalType == 'edit'){
               emit('passEditDataAgent', form.value )
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
        () => form.value.feedback_by_admin,
        (newValue) => {
          // If empty or not a whole number, set error
          if (!newValue || !/^\d+(\.\d+)?$/.test(form.value.feedback_by_admin)) {
           errorOtherMetrics.value = `Please enter a valid numeric ${props.modalType}.`;
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
            employee_id: newVal.employee_id || "",
            db_name: newVal.db_name || "",
            image_link: newVal.image_link || "",
            month: newVal.month || "",
            year: newVal.year || "",
            absences: newVal.absences || 0,
            tardiness: newVal.tardiness || 0, 
            memo: newVal.memo || 0,
            feedback_by_admin: newVal.feedback_by_admin | "",
            admin_id : currentUser.login_id,
            admin_dbname: currentUser.db_name,
            admin_role:  currentUser.role,
          
           
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
  