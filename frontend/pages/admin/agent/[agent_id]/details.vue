<template>
    <div class="p-4 mt-20">
  
      <div v-if="currentUser.login_type == 'standarduser' || currentUser.agent_type === 2">
        <div class="p-4">
          <AgentBio :agents="salesAgentBio"></AgentBio>
        </div>
        <div>
         
        </div>
        <div class ="p-4 mt-5 mb-5">
          <TargetShipok :targetShipokDetails="salesAgentTargetShipok" 
          :agent="salesAgentBio[0]"
          :fullyear="fullyear"
           @passNewTarget="addNewTarget"
           @passUpdatedTarget="editTarget"
            @passDeleteTarget="deleteTarget" ></TargetShipok>
        </div>
        <div class ="p-4 mt-5 mb-5">
          <NewDeposit :newDepositDetails="salesAgentNewDeposit" 
          :agent="salesAgentBio[0]"
          @passNewDeposit="addNewDeposit" @passUpdatedNewDeposit="updateNewDeposit" 
          @passDeleteDeposit="deleteNewDeposit"
          
          ></NewDeposit>
        </div>

        <div class ="p-4 mt-5 mb-5" v-if="isAdmin">
          <feedback-by-admin-component :feedbackDetails="salesAgentFeedback"
          @passFeedback="addFeedback"
          @passUpdateFeedback="updateFeedback"
          @passDeleteFeedback="deleteFeedback"
          ></feedback-by-admin-component>
        </div>

       <div  class ="p-4 mt-5 mb-5">
          <agent-feedback-summary-component
          :agents="salesAgentBio"
           :averageAgentFeedbackByLm = "averageAgentFeedbackBylm" 
           :averageLmFeedbackByAgent = "averageLmFeedbackByAgent"
           :averageLmFeedbackByUm ="averageLmFeedbackByUm"
           :averageUmFeedbackByLm = "averageUmFeedbackByLm"
           :averageFeedbackByQa="averageFeedbackByQa"
           :overallAverageFeedback="overallAverageFeedback"
           :feedbackData="feedbackData"
           :lmFeedbackByAgent="lmFeedbackByAgent"
           :agentFeedbackByLm="agentFeedbackByLm"
           :lmFeedbackByUm="lmFeedbackByUm"
           :umFeedbackByLm="umFeedbackByLm"
           :feedbackByQa="feedbackByQa"
           :feedbackByAdmin="salesAgentFeedback"


          @passSalesEnableDisableFeedback="enableDisableSalesFeedback"
          @passSalesDeleteFeedback="deleteSalesFeedback"
           v-if="salesAgentBio.length > 0"
          >
          
          </agent-feedback-summary-component>
       </div>
        <div class ="p-4 mt-5 mb-5">
            <Absence attendanceType="absence" attendanceTitle="Sales Agent Absences" 
            :attendanceDetails="salesAgentAbsences"  @passAttendance="addAttendanceType" @passUpdateAttendance="updateAttendanceType"
             @passDeleteAttendance="deleteAttendanceType"
             />
        </div>
        <div  class =" p-4 mt-5 mb-5">
            <Tardiness attendanceType="tardiness" attendanceTitle="Sales Agent Tardiness" 
             :attendanceDetails="salesAgentTardiness"  @passAttendance="addAttendanceType"
               @passUpdateAttendance="updateAttendanceType"
               @passDeleteAttendance="deleteAttendanceType" 
            />
        </div>
        <div  class ="p-4 mt-5 mb-5">
            <Memo attendanceType="memo" attendanceTitle="Sales Agent Memo" 
             :attendanceDetails="salesAgentMemo" 
              @passAttendance="addAttendanceType" @passUpdateAttendance="updateAttendanceType"
              @passDeleteAttendance="deleteAttendanceType" 
              />
        </div>
    </div>
    <div v-else>
      <p>it came here insteasd??</p>
    </div>

  </div>
</template>
  
  <script setup>

  definePageMeta({
    middleware: ['auth']
  })

  import { onMounted, watch, computed } from 'vue';
  import { useRouter, useRoute } from 'vue-router';

  import Absence from '../../../components/AttendanceComponent.vue'
  import Tardiness from '../../../components/AttendanceComponent.vue'
  import Memo from '../../../components/AttendanceComponent.vue'
  import TargetShipok from '../../../components/TargetShipokComponent.vue'
  // import FeedbackByAdmin from '../../../components/FeedbackByAdminComponent.vue'
  import NewDeposit from '../../../components/NewDepositComponent.vue'
  import AgentBio from '../../../components/AgentBioComponent.vue'
  import { months, getWholeNumberPercentage } from '@/utils/constants'

 
  const props = defineProps({
      fullyear: {
        type: Boolean, 
        required: true
      }

    });

  
  const router = useRouter();
  const route = useRoute();
  const query = route.query;
  // const agentId = route.params.agent_id;




  const month = ref(null)
  const year = ref(null)


    if(!query.month || query.month == ""){
      query.month = months[new Date().getMonth()]
      month.value =  months[new Date().getMonth()]
    }else{
      month.value = query.month
    }

    if(!query.year || query.year == ""){
      query.year = new Date().getFullYear()
      year.value = new Date().getFullYear()
    }else{
      year.value = query.year
    }

    query.fullyear = props.fullyear


   
  
    const today = new Date()
    const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  
  //get the current user
  const authStore = useAuthStore()
  authStore.fetchTokenFromLocalStore()
  const isAdmin = ref(false)

  const isSalesAdmin = ref(false)

  const currentUser = authStore.state.user 

 const agentType = ref("")
  const agentRole = ref("")

  agentType.value = query.agent_type
  agentRole.value = query.agent_role




  if (currentUser.login_type == 'standarduser' && currentUser.role == 'admin'){
    isAdmin.value = true
    
  }

  if( currentUser.agent_type == 2 && currentUser.role == 'manager'){
    isSalesAdmin.value = true
    query.is_sales_admin = true

  }


   console.log('the isSalesAdmin is' , isSalesAdmin.value)
 
  let agentId;

  agentId = route.params.agent_id
 
  if(!agentId){
    if (query.agent_id) {
      if (currentUser.login_type == 'standarduser' && currentUser.role == 'admin'){
        agentId = query.agent_id
        
      }else{
        agentId = currentUser.login_id
        query.agent_id = agentId
      }
    }else {
      agentId = currentUser.login_id
      query.agent_id = agentId
    }
  }

//isSalesAdmin.value is false? if yes then  true
//login_type is not standuser? if yes true 
if(!isSalesAdmin.value && currentUser.login_type != 'standarduser'){
    query.agent_role = currentUser.role
    query.agent_type = currentUser.agent_type
}
// if( currentUser.login_type != 'standarduser'  ){
  
//     query.agent_role = currentUser.role
//     query.agent_type = currentUser.agent_type
//   }


 
  

  const useManageSalesStore = useManageSalesAgentStore();

  const addNewTarget = async(agentId, query, target) => {
    try {
      await useManageSalesStore.addAgentTarget(agentId, query, target)
    }catch(error){
      console.log(error.errors)
    }
   
    
  }

  const deleteTarget= async(agentId, query, target_date) => {
 
    try {
      await useManageSalesStore.deleteAgentTarget(agentId, query, target_date)
    }catch(error){
      console.log(error.errors)
    }
   
    
  }

  const editTarget = async(agentId, query, target) => {
   
    try {
      await useManageSalesStore.updateAgentTarget(agentId, query, target)
    }catch(error){
      console.log(error.errors)
    }
   
    
  }

  const addNewDeposit = async (agentId, query, newDeposit) => {
    try {
      await useManageSalesStore.addAgentDeposit(agentId, query, newDeposit)
    }catch(error){
      console.log(error.errors)
    }
  }


  const updateNewDeposit = async(agentId, query,  updateNewDeposit) => {
   
   try {
     await useManageSalesStore.updateAgentDeposit(agentId, query,  updateNewDeposit)
   }catch(error){
     console.log(error.errors)
   }
  
   
 }

 const  deleteNewDeposit= async(agentId, query, newDeposit) => {
 
 try {
   await useManageSalesStore.deleteAgentNewDeposit(agentId, query, newDeposit)
 }catch(error){
   console.log(error.errors)
 }

 
}

const addAttendanceType = async (agentId, query,  attendanceType,attendance) => {
    try {
      await useManageSalesStore.addAgentAttendanceType(agentId, query, attendanceType, attendance)
      
    }catch(error){
      console.log(error.errors)
    }

    
  }

const  updateAttendanceType = async(agentId, query,  attendanceType,attendance) => {
   
   try {
     await useManageSalesStore.updateAgentAttendanceType(agentId, query, attendanceType, attendance)
   }catch(error){
     console.log(error.errors)
   }
  
   
 }


 const  deleteAttendanceType = async(agentId, query,  attendanceType,attendance) => {
 
 try {
   await useManageSalesStore.deleteAgentAttendanceType(agentId, query,  attendanceType, attendance)
 }catch(error){
   console.log(error.errors)
 }

 
}


const addFeedback = async(agentId, query, feedback) => {
    try {
      await useManageSalesStore.addAgentFeedback(agentId, query, feedback)
    }catch(error){
      console.log(error.errors)
    }
   
    
  }

 const deleteFeedback= async(agentId, query, feedback_date) => {
 
 try {
   await useManageSalesStore.deleteAgentFeedback(agentId, query, feedback_date)
 }catch(error){
   console.log(error.errors)
 }

 
}

const updateFeedback = async(agentId, query, feedback) => {

 try {
   await useManageSalesStore.updateAgentFeedback(agentId, query, feedback)
 }catch(error){
   console.log(error.errors)
 }

 
}

const enableDisableSalesFeedback = async(data) => {
  await  useFeedbackStore.enableDisableSalesFeedback(data, 'PUT')

} 

const deleteSalesFeedback = async(data) => {
    await  useFeedbackStore.enableDisableSalesFeedback(data, 'DELETE')
   
} 



  const salesAgentBio = computed(() => useManageSalesStore.state.salesAgentBio);
  const salesAgentTargetShipok = computed(() => useManageSalesStore.state.salesAgentTargetShipok);
  const salesAgentNewDeposit = computed(() => useManageSalesStore.state.salesAgentNewDeposit);
  const salesAgentAbsences = computed(() => useManageSalesStore.state.salesAgentAbsences);
  const salesAgentMemo = computed(() => useManageSalesStore.state.salesAgentMemo);
  const salesAgentTardiness = computed(() => useManageSalesStore.state.salesAgentTardiness);

  const salesAgentFeedback = computed(() => useManageSalesStore.state.salesAgentFeedback);


       //use feedback state management
  const useFeedbackStore  = feedbackStore()
       // Reset the feedback data
  useFeedbackStore.state.agent_by_lm = [];
  useFeedbackStore.state.lm_by_agent = [];
  useFeedbackStore.state.lm_by_um = [];
  useFeedbackStore.state.um_by_lm = [];
  useFeedbackStore.state.qa = [];

  const agentFeedbackByLm = computed(() => useFeedbackStore.state.agent_by_lm);
  const lmFeedbackByAgent = computed(() => useFeedbackStore.state.lm_by_agent);
  const lmFeedbackByUm = computed(() => useFeedbackStore.state.lm_by_um);
  const umFeedbackByLm = computed(() => useFeedbackStore.state.um_by_lm);
  const feedbackByQa =  computed(() => useFeedbackStore.state.qa);


const feedbackData = computed(() => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonthIndex = currentDate.getMonth(); // 0-based index

    const results = [];

    const processMonth = (month, index) => {
      // Skip future months in current year
      if (parseInt(year.value) === currentYear && index > currentMonthIndex) return;

      // Filter feedbacks by month and year
      const filterByMonthYear = (data) => {
      
        return data.filter(item => 
          
          item.month === month && parseInt(item.year) === parseInt(year.value)
        );
      };

      const agentDataByLm = filterByMonthYear(agentFeedbackByLm.value || []);
      const lmDataByAgent = filterByMonthYear(lmFeedbackByAgent.value || []);
      const lmDataByUm = filterByMonthYear(lmFeedbackByUm.value || []);
      const umDataByLm = filterByMonthYear(umFeedbackByLm.value || []);
      const qaData = filterByMonthYear(feedbackByQa.value || []);
      

      //  console.log('avgAgentByLm', agentFeedbackByLm.value )
      // console.log('avgLmByAgent', lmFeedbackByAgent.value  )
      // console.log('avgLmByUm' , lmFeedbackByUm.value )
      // console.log('avgUmByLm',  umFeedbackByLm.value)
      // console.log('avgQa', umFeedbackByLm.value)
    
      const calculateAverage = (data) => {
      

        // Filter and sort the data
        const filteredAndSorted = data
        .filter(item => parseFloat(item.feedback_score) > 0)   // keep only scores > 0
        .sort((a, b) => parseFloat(b.feedback_score) - parseFloat(a.feedback_score)); // sort high → low

        if (!Array.isArray(filteredAndSorted ) || filteredAndSorted .length === 0) return null;
        const total = data.reduce((sum, item) => sum + parseFloat(item.feedback_score || 0), 0);

        return (total / filteredAndSorted.length).toFixed(4) || 0;

      };

      const avgAgentByLm = calculateAverage(agentDataByLm);
      const avgLmByAgent = calculateAverage(lmDataByAgent);
      const avgLmByUm = calculateAverage(lmDataByUm);
      const avgUmByLm = calculateAverage(umDataByLm);
      const avgQa = calculateAverage(qaData);

      // console.log('avgAgentByLm', avgAgentByLm)
      // console.log('avgLmByAgent', avgLmByAgent)
      // console.log('avgLmByUm' , avgLmByUm)
      // console.log('avgUmByLm', avgUmByLm)
      // console.log('avgQa',avgQa)

      const overall = (() => {
        const scores = [avgAgentByLm, avgLmByAgent, avgLmByUm, avgUmByLm, avgQa]
          .filter(score => score !== null)
          .map(parseFloat);
        if (scores.length === 0) return null;
        return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(4);
      })();

      results.push({
        month: month,
        year: year.value,
        averageAgentFeedbackByLm: avgAgentByLm,
        averageLmFeedbackByAgent: avgLmByAgent,
        averageLmFeedbackByUm: avgLmByUm,
        averageUmFeedbackByLm: avgUmByLm,
        averageFeedbackByQa: avgQa,
        overallAverageFeedback: overall
      });
    };

    if (props.fullyear) {
      months.forEach((month, index) => {
        processMonth(month, index);
      });
    } else {
      const selectedIndex = months.findIndex(m => m === month.value);
    
      if (selectedIndex !== -1) {
        processMonth(month.value, selectedIndex);
      }
    }

    return results;
});

 const filteredAndSorted = (data) => {
        return data
        .filter(item => parseFloat(item.feedback_score) > 0)   // keep only scores > 0
        .sort((a, b) => parseFloat(b.feedback_score) - parseFloat(a.feedback_score)); // sort high → low
      };

  const averageAgentFeedbackBylm = computed(() => {
 
  const cleanData = filteredAndSorted(agentFeedbackByLm.value || []);

  if (!Array.isArray(cleanData) || cleanData.length === 0) return null;
  const total = cleanData.reduce((sum, item) => sum + parseFloat(item.feedback_score || 0), 0);

  return (total / cleanData.length).toFixed(4) || 0;
});

const averageLmFeedbackByAgent = computed(() => {
  const lmData = filteredAndSorted(lmFeedbackByAgent.value || []);
  if (!Array.isArray(lmData) || lmData.length === 0) return null;
  const total = lmData.reduce((sum, item) => sum + parseFloat(item.feedback_score || 0), 0);
  return (total / lmData.length).toFixed(4) || 0;
});

const averageLmFeedbackByUm = computed(() => {
  const lmData = filteredAndSorted(lmFeedbackByUm.value || []);
  if (!Array.isArray(lmData) || lmData.length === 0) return null;
  const total = lmData.reduce((sum, item) => sum + parseFloat(item.feedback_score || 0), 0);
  return (total / lmData.length).toFixed(4) || 0;
});

const averageUmFeedbackByLm = computed(() => {
  const umData = filteredAndSorted(umFeedbackByLm.value || []);
  if (!Array.isArray(umData) || umData.length === 0) return null;
  const total = umData.reduce((sum, item) => sum + parseFloat(item.feedback_score || 0), 0);
  return (total / umData.length).toFixed(4) || 0;
});

const averageFeedbackByQa  = computed(() => {
  const cleanData = filteredAndSorted(feedbackByQa.value || []);
  if (!Array.isArray(cleanData) || cleanData.length === 0) return null;
  const total = cleanData.reduce((sum, item) => sum + parseFloat(item.feedback_score || 0), 0);
  return (total / cleanData.length).toFixed(4) || 0;
});



// Compute the overall average, excluding empty feedback categories
const overallAverageFeedback = computed(() => {

  

  const scores = [];

  if (averageAgentFeedbackBylm.value !== null) scores.push(parseFloat(averageAgentFeedbackBylm.value));
  if (averageLmFeedbackByAgent.value !== null) scores.push(parseFloat(averageLmFeedbackByAgent.value));
  if (averageLmFeedbackByUm.value !== null) scores.push(parseFloat(averageLmFeedbackByUm.value));
  if (averageUmFeedbackByLm.value !== null) scores.push(parseFloat(averageUmFeedbackByLm.value));
  if (averageFeedbackByQa.value !== null) scores.push(parseFloat(averageFeedbackByQa.value));
 
  if (scores.length === 0) return null; // Return null if there's no valid data

  return (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(4);
});

//QA Feedback
const addQaFeedback = async(id, feedbackResponse, feedbackType, query, httpMethod) => {
    try {
        await useFeedbackStore.addUpdateDeleteFeedback(id, feedbackResponse, feedbackType, query, httpMethod)
    }catch(error){
      console.log(error)
    }
}

const updateQaFeedback = async(id, feedbackResponse, feedbackType, query, httpMethod) => {
    try {
        await useFeedbackStore.addUpdateDeleteFeedback(id, feedbackResponse, feedbackType, query, httpMethod)
    }catch(error){
      console.log(error)
    }
}

const deleteQaFeedback = async(id, feedbackResponse, feedbackType, query, httpMethod) => {
    try {
        await useFeedbackStore.addUpdateDeleteFeedback(id, feedbackResponse, feedbackType, query, httpMethod)
    }catch(error){
      console.log(error)
    }
    
}


  onMounted(async()=> {
         // Reset the feedback data
    useFeedbackStore.state.agent_by_lm = [];
    useFeedbackStore.state.lm_by_agent = [];
    useFeedbackStore.state.lm_by_um = [];
    useFeedbackStore.state.um_by_lm = [];
    useManageSalesStore.state.salesAgentTargetShipok = []
    useManageSalesStore.state.salesAgentNewDeposit = []
    useManageSalesStore.state.salesAgentAbsences = []
    useManageSalesStore.state.salesAgentMemo = []
    useManageSalesStore.state.salesAgentTardiness = []
    useManageSalesStore.state.salesAgentFeedback = []

   

      if (agentType.value == 0){
        query.feedback_type = 'agent_by_lm'
        await useFeedbackStore.fetchFeedback(agentId, query, 'agent_by_lm')
      }else if(agentType.value == 1 ){
        query.feedback_type = 'lm_by_agent'
        await useFeedbackStore.fetchFeedback(agentId, query, 'lm_by_agent')
        query.feedback_type = 'lm_by_um'
        await useFeedbackStore.fetchFeedback(agentId, query, 'lm_by_um')

      }else if (agentType.value == 2){
        query.feedback_type = 'um_by_lm'
        await useFeedbackStore.fetchFeedback(agentId, query, 'um_by_lm')
      }

      await  useFeedbackStore.fetchFeedback(agentId, query, 'qa')
      await  useManageSalesStore.fetchSalesAgent(agentId)
      await   useManageSalesStore.fetchSalesAgentDetails(agentId,query, 'salesAgentTargetShipok')
      await   useManageSalesStore.fetchSalesAgentDetails(agentId,query, 'salesAgentNewDeposit')
      await   useManageSalesStore.fetchSalesAgentDetails(agentId,query, 'salesAgentAbsences')
      await   useManageSalesStore.fetchSalesAgentDetails(agentId,query, 'salesAgentMemo')
      await   useManageSalesStore.fetchSalesAgentDetails(agentId,query, 'salesAgentTardiness')
      await   useManageSalesStore.fetchSalesAgentDetails(agentId,query, 'salesAgentFeedback')

    })


  watch(route, async (newRoute) => {

    if(currentUser.agent_type == 2 && currentUser.role == 'manager'){
      isSalesAdmin.value = true
       query.is_sales_admin = isSalesAdmin.value 
       
  }





     // Reset the feedback data
  useFeedbackStore.state.agent_by_lm = [];
  useFeedbackStore.state.lm_by_agent = [];
  useFeedbackStore.state.lm_by_um = [];
  useFeedbackStore.state.um_by_lm = [];
  useManageSalesStore.state.salesAgentTargetShipok = []
  useManageSalesStore.state.salesAgentNewDeposit = []
  useManageSalesStore.state.salesAgentAbsences = []
  useManageSalesStore.state.salesAgentMemo = []
  useManageSalesStore.state.salesAgentTardiness = []
  useManageSalesStore.state.salesAgentFeedback = []




  agentType.value = newRoute.query.agent_type;
  agentRole.value  = newRoute.query.role;

  const newAgentId = newRoute.params.agent_id;
  await useManageSalesStore.fetchSalesAgent(newAgentId);

  newRoute.query.fullyear = props.fullyear

  month.value = newRoute.query.month 
  year.value = newRoute.query.year


  if (agentType.value == 0 ) {
    newRoute.query.feedback_type = 'agent_by_lm'
    await useFeedbackStore.fetchFeedback(newAgentId, newRoute.query, 'agent_by_lm');
  } else if (agentType.value == 1 ) {
    newRoute.query.feedback_type = 'lm_by_agent'
    await useFeedbackStore.fetchFeedback(newAgentId,  newRoute.query, 'lm_by_agent');
    newRoute.query.feedback_type = 'lm_by_um'
    await useFeedbackStore.fetchFeedback(newAgentId,  newRoute.query, 'lm_by_um');
  } else if (agentType.value == 2) {
    newRoute.query.feedback_type = 'um_by_lm'
    await useFeedbackStore.fetchFeedback(newAgentId,  newRoute.query, 'um_by_lm');
  }
  await  useFeedbackStore.fetchFeedback(newAgentId,  newRoute.query, 'qa')
  router.push(newRoute.fullPath);
  await  useManageSalesStore.fetchSalesAgent(newAgentId)
  await   useManageSalesStore.fetchSalesAgentDetails(newAgentId,newRoute.query, 'salesAgentTargetShipok')
  await   useManageSalesStore.fetchSalesAgentDetails(newAgentId,newRoute.query, 'salesAgentNewDeposit')
  await   useManageSalesStore.fetchSalesAgentDetails(newAgentId,newRoute.query, 'salesAgentAbsences')
  await   useManageSalesStore.fetchSalesAgentDetails(newAgentId,newRoute.query, 'salesAgentMemo')
  await   useManageSalesStore.fetchSalesAgentDetails(newAgentId,newRoute.query, 'salesAgentTardiness')
  await   useManageSalesStore.fetchSalesAgentDetails(newAgentId,newRoute.query, 'salesAgentFeedback')
});


  </script>
  
  



  