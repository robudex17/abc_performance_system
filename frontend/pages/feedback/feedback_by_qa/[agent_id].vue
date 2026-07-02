<template>
    <div class="p-4 mt-20">

        <div class="p-4">
          <!-- <AgentBio :agents="salesAgentBio"></AgentBio> -->
          <agent-feedback-summary-component :agents="salesAgentBio"
           :averageAgentFeedback = "averageAgentFeedback" 
           :averageManagerFeedback = "averageManagerFeedback"
           :averageLmsFeedback="averageLmsFeedback"
           :averageFeedbackByQa="averageFeedbackByQa"
           :overallAverageFeedback="overallAverageFeedback"
           v-if="salesAgentBio.length > 0"
            
            ></agent-feedback-summary-component>

        </div> 
        <div v-if="agentType == 0  && agentRole == 'user'" class="p-4">
          <agents-feedback-component  :agents="agentFeedback"> </agents-feedback-component>
        </div>
        <div v-else-if="agentType == 1  && agentRole == 'manager'"  class="p-4" >
          <managers-feedback-component :managers="managerFeedback" title="Feedback By Your Agents" ></managers-feedback-component>
          <lm-feedback-component :lms="lmsFeedback" class="mt-8"></lm-feedback-component>
        </div>
        <div v-else-if="agentType == 2  && agentRole == 'manager'" class="p-4">
          <managers-feedback-component :managers="managerFeedback" title="Feedback By Your Local Manager"></managers-feedback-component>
        </div>

        <div  class="p-4">
          <feedback-by-qa-component
          :feedbackByQa="feedbackByQa"
          title="Feedback By QA"
          @passFeedback="addQaFeedback"
          @passUpdateFeedback="updateQaFeedback"
          @passDeleteFeedback="deleteQaFeedback"
          ></feedback-by-qa-component>
        </div>
 
        
 
    </div>
  </template>
  
  <script setup>

  definePageMeta({
    middleware: 'auth'
  })

  import { onMounted, watch, computed } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { months } from '@/utils/constants'

  
  import AgentBio from '../../../components/AgentBioComponent.vue'


  const router = useRouter();
  const route = useRoute();
  
  const query = route.query;
  const month = ref(null)
  const year = ref(null)
  // const agentId = route.params.agent_id;
  const feedbackDetails = ref([])

  
  //get the current user
  const authStore = useAuthStore()
  authStore.fetchTokenFromLocalStore()

  const currentUser = authStore.state.user 



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

  const agentId = route.params.agent_id
 
  const agentType = query.agent_type 
  const agentRole = query.agent_role

 
  const useManageSalesStore = useManageSalesAgentStore();

  const salesAgentBio = computed(() => useManageSalesStore.state.salesAgentBio);

  
  //use feedback state management
  const useFeedbackStore  = feedbackStore()
  
  // Reset the feedback data
  useFeedbackStore.state.agents = [];
  useFeedbackStore.state.managers = [];
  useFeedbackStore.state.lms = [];
  useFeedbackStore.state.qa = [];

  const agentFeedback = computed(() => useFeedbackStore.state.agents);
  const managerFeedback = computed(() => useFeedbackStore.state.managers);
  const lmsFeedback = computed(() => useFeedbackStore.state.lms);

  const feedbackByQa =  computed(() => useFeedbackStore.state.qa);

  const averageAgentFeedback = computed(() => {
  if (!Array.isArray(agentFeedback.value) || agentFeedback.value.length === 0) return null;
  const total = agentFeedback.value.reduce((sum, item) => sum + parseFloat(item.feedback_score || 0), 0);
  return (total / agentFeedback.value.length).toFixed(2);
});

const averageManagerFeedback = computed(() => {
  if (!Array.isArray(managerFeedback.value) || managerFeedback.value.length === 0) return null;
  const total = managerFeedback.value.reduce((sum, item) => sum + parseFloat(item.feedback_score || 0), 0);
  return (total / managerFeedback.value.length).toFixed(2);
});

const averageLmsFeedback = computed(() => {
  if (!Array.isArray(lmsFeedback.value) || lmsFeedback.value.length === 0) return null;
  const total = lmsFeedback.value.reduce((sum, item) => sum + parseFloat(item.feedback_score || 0), 0);
  return (total / lmsFeedback.value.length).toFixed(2);
});

const averageFeedbackByQa  = computed(() => {
  if (!Array.isArray(feedbackByQa.value) || feedbackByQa.value.length === 0) return null;
  const total = feedbackByQa.value.reduce((sum, item) => sum + parseFloat(item.feedback_score || 0), 0);
  return (total / feedbackByQa.value.length).toFixed(2);
});



// Compute the overall average, excluding empty feedback categories
const overallAverageFeedback = computed(() => {
  const scores = [];

  if (averageAgentFeedback.value !== null) scores.push(parseFloat(averageAgentFeedback.value));
  if (averageManagerFeedback.value !== null) scores.push(parseFloat(averageManagerFeedback.value));
  if (averageLmsFeedback.value !== null) scores.push(parseFloat(averageLmsFeedback.value));
  if (averageFeedbackByQa.value !== null) scores.push(parseFloat(averageFeedbackByQa.value));
 
  if (scores.length === 0) return null; // Return null if there's no valid data

  return (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(2);
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
      
      await  useManageSalesStore.fetchSalesAgent(agentId)
     
      if (agentType == 0 && agentRole =='user'){
        await useFeedbackStore.fetchFeedback(agentId, {month:month.value, year: year.value}, 'agents')
      }else if(agentType == 1 && agentRole =='manager'){
        await useFeedbackStore.fetchFeedback(agentId, {month:month.value, year: year.value, }, 'managers')
        await useFeedbackStore.fetchFeedback(agentId, {month:month.value, year: year.value}, 'lms')
     
      }else if (agentType == 2 && agentRole =='manager'){

        await useFeedbackStore.fetchFeedback(agentId, {month:month.value, year: year.value}, 'managers')
      }

      await  useFeedbackStore.fetchFeedback(agentId, {month:month.value, year: year.value}, 'qa')

  })


watch(route, async (newRoute) => {
  // Reset the feedback data
  useFeedbackStore.state.agents = [];
  useFeedbackStore.state.managers = [];
  useFeedbackStore.state.lms = [];

  router.push(newRoute.fullPath);

  const newAgentId = newRoute.params.agent_id;
  await useManageSalesStore.fetchSalesAgent(newAgentId);

  if (agentType == 0 && agentRole == 'user') {
    await useFeedbackStore.fetchFeedback(newAgentId, newRoute.query, 'agents');
  } else if (agentType == 1 && agentRole == 'manager') {
    await useFeedbackStore.fetchFeedback(newAgentId,  newRoute.query, 'managers');
    await useFeedbackStore.fetchFeedback(newAgentId,  newRoute.query, 'lms');
  } else if (agentType == 2 && agentRole == 'manager') {
    await useFeedbackStore.fetchFeedback(newAgentId,  newRoute.query, 'managers');
  }
  await  useFeedbackStore.fetchFeedback(newAgentId, newRoute.query, 'qa')

});


  </script>
  