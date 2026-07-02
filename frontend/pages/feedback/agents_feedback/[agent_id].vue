<template>
    <div>
        <feedback-form-component 
         v-if="agentFeedback.length > 0"
        :questions="managerQuestions" feedbackTitle="SALES FEEDBACK EVALUATION" 
        feedbackSubtitle="Rate your agent based on the following questions."
         :feedback="agentFeedback" :feedbackType="feedbackType"
         @passFeedbackData="addUpdateDeleteFeedback">

        </feedback-form-component>
        <feedback-form-component v-else 
          :questions="managerQuestions" feedbackTitle="SALES FEEDBACK EVALUATION" 
         feedbackSubtitle="Rate your agent based on the following questions."
         :feedback="[]" :feedbackType="feedbackType"
         @passFeedbackData="addUpdateDeleteFeedback">

        >

        </feedback-form-component>
    </div>
  </template>
  
  <script setup>

      definePageMeta({
         middleware: 'auth'
     })

     import { onMounted, watch, computed } from 'vue';
     import { feedbackStore } from '~/stores/feedback';

     const router = useRouter()
     const route = useRoute()
     const query = route.query
     const month = ref(null)
     const year = ref(null)

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
   
    console.log('the month is', month.value )
    console.log('the year is ', year.value)
    const today = new Date()
    const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;


      //get the current user
    const authStore = useAuthStore()
    authStore.fetchTokenFromLocalStore()

    const currentUser = authStore.state.user 
    const  feedbackType = ref('agents')

     //get agent_id
     const agentId = route.params.agent_id

     //use feedback state management
     const useFeedbackStore  = feedbackStore()

    const agentFeedback = computed(() => useFeedbackStore.state.agents)

   

    const addUpdateDeleteFeedback  = async(feedbackResponse, httpMethod)  => {
        feedbackResponse.date = date 
        feedbackResponse.month = month.value 
        feedbackResponse.year = year.value
        feedbackResponse.agent_id = agentId //should replace with  who_receive_feedback_id

        console.log('the updated response is: ', feedbackResponse)

        try {
            await useFeedbackStore.addUpdateDeleteFeedback(agentId, feedbackResponse, feedbackType.value, query, httpMethod)
            if (feedbackType.value == 'agents') {
                router.push('/feedback/agents_feedback')
            }else if (feedbackType == 'lms'){
                router.push('/feedback/lm_feedback')
            }else if (feedbackType == 'managers') {
                router.push('/feedback/lm_feedback')
            }
           
        }catch(error){
            console.log(error)
        }
    }
    
    onMounted(async()=> {
       await useFeedbackStore.fetchFeedback(agentId, {month:month.value, year: year.value}, 'agents')

    })


    watch(route, async (newRoute) => {
    month.value = newRoute.query.month
    year.value = newRoute.query.year
     router.push(newRoute.fullPath);
     
     await useFeedbackStore.fetchFeedback(agentId, newRoute.query, 'agents')
});

   


        const managerQuestions = [
        {
            id: 1,
            text: "Does agent show improvement on his performance this month?",
            choices: [
            { label: "Yes, with significant improvement", score: 5 },
            { label: "With minimal improvement", score: 3 },
            { label: "No improvement", score: 1 }
            ]
        },
        {
            id: 2,
            text: "Rate the level of effort shown by agent this month",
            choices: [
            { label: "Exeptional", score: 5 },
            { label: "Average", score: 3 },
            { label: "Poor", score: 1 }
            ]
        },
        {
            id: 3,
            text: "Did the agent show full knowledge and familiarity of the market policies and rules. Do research to keep updated of the market trends.",
            choices: [
            { label: "Yes very resourceful and knowledgeable", score: 5 },
            { label: "Shown a moderate interest", score: 3 },
            { label: "Have not shown much interest", score: 1 }
            ]
        },
        {
            id: 4,
            text: "Able to close a sale to new customers",
            choices: [
            { label: "Yes, with significant number", score: 5 },
            { label: "Yes, but minimal", score: 3 },
            { label: "No new client", score: 1 }
            ]
        },
        {
            id: 5,
            text: "Rate agent's effort to continuously look for new customers not just relying on system tagging",
            choices: [
            { label: "Do everything to get leads", score: 5 },
            { label: "Show effort but needs improvement", score: 3 },
            { label: "not exerting effort to look", score: 1 }
            ]
        },
        {
            id: 6,
            text: "Have repeat customers order and able to retain customers and convince to reorder. Handles customer very well, develops customer loyalty",
            choices: [
            { label: "Yes, with significant number of loyal customers", score: 5 },
            { label: "Yes, but only few numbers", score: 3 },
            { label: "No, not able to retain customers", score: 1 }
            ]
        },
        {
            id: 7,
            text: "Follow company rules, sales policies and manager's instructions",
            choices: [
            { label: "Yes, no violations committed", score: 5 },
            { label: "Yes, but have minor violations", score: 3 },
            { label: "Not following policies and instructions", score: 1 }
            ]
        },
        {
            id: 8,
            text: "Rate Agent's ability to solve and identify problem and to work with minimum supervision",
            choices: [
            { label: "reliable and dependable", score: 5 },
            { label: "still need a minimal supervision", score: 3 },
            { label: "can't solve and identify problems alone", score: 1 }
            ]
        },
        {
            id: 9,
            text: "Understands and knowledgeable about job functions, processes and systems used at work",
            choices: [
            { label: "Yes, very knowledgeable", score: 5 },
            { label: "Limited knowledge needs to improve", score: 3 },
            { label: "Not displaying understanding", score: 1 }
            ]
        },
        {
            id: 10,
            text: "Rate the agent's negotiation skills this month:",
            choices: [
            { label: "has high convincing skills", score: 5 },
            { label: "can convince but needs improvements", score: 3 },
            { label: "not showing skills", score: 1 }
            ]
        },
        {
            id: 11,
            text: "Does agent display strong-will and not easily discourage if results seem not possible to achieve at the end of the month?",
            choices: [
            { label: "Yes, never gives up regardless of situation", score: 5 },
            { label: "Yes, but fall back at times", score: 3 },
            { label: "No, pessimistic and gives up easily", score: 1 }
            ]
        },
        {
            id: 12,
            text: "Prompt in submitting reports and meeting deadlines",
            choices: [
            { label: "Yes, always on time", score: 5 },
            { label: "Submitting reports but beyond deadline", score: 3 },
            { label: "No, not submitting reports at all", score: 1 }
            ]
        },
        {
            id: 13,
            text: "Show and treat managers and other people with respect",
            choices: [
            { label: "Yes, always", score: 5 },
            { label: "Sometimes", score: 3 },
            { label: "No, not showing respect", score: 1 }
            ]
        },
        {
            id: 14,
            text: "Agent is organise and systematic and very keen to details.  Make sure of the correctness of information and reports",
            choices: [
            { label: "Yes, always !", score: 5 },
            { label: "Yes, but with minimal errors", score: 3 },
            { label: "No, prone to error", score: 1 }
            ]
        },
        {
            id: 15,
            text: "Listen and accepts constructive criticism and feedback without unfavorable responses",
            choices: [
            { label: "Yes, make use of the feedback to improve", score: 5 },
            { label: "Yes, but sometimes show unfavorable remarks", score: 3 },
            { label: "No, doesn't accept criticism gracefully", score: 1 }
            ]
        },
        {
            id: 16,
            text: "Knows how to update managers of their absences, tardiness and any concern relating to work",
            choices: [
            { label: "Always updating", score: 5 },
            { label: "Not at all times updating or communicating", score: 3 },
            { label: "No, not sending updates nor communicate", score: 1 }
            ]
        },
        {
            id: 17,
            text: "Rate agent's response on client inquiries, immediate head messages and calls on different works platforms. ",
            choices: [
            { label: "Very fast in responding", score: 5 },
            { label: "Takes time to response", score: 3 },
            { label: "Not always available", score: 1 }
            ]
        },
   
 
    ];



  </script>
  