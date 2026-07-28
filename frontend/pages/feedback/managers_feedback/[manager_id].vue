<template>
    <div>
        <feedback-form-component 
         v-if="managerFeedback.length > 0"
        :questions="agentQuestions" feedbackTitle="MANAGER FEEDBACK EVALUATION"
        :feedback="managerFeedback" :feedbackType="feedbackType"
         feedbackSubtitle="Rate your Manager based on the following questions."
         @passFeedbackData="addUpdateDeleteFeedback">

        </feedback-form-component>
        <feedback-form-component v-else 
         :questions="agentQuestions" feedbackTitle="MANAGER FEEDBACK EVALUATION"
         feedbackSubtitle="Rate your Manager based on the following questions."
         :feedback="[]" :feedbackType="feedbackType"
         @passFeedbackData="addUpdateDeleteFeedback">
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
   
  
    const today = new Date()
    const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;


      //get the current user
    const authStore = useAuthStore()
    authStore.fetchTokenFromLocalStore()

    const currentUser = authStore.state.user 
    const  feedbackType = ref('managers')

     //get manager_id
     const managerId = route.params.manager_id

     //get agent_id

     const agentId = route.query.agent_id

     //use feedback state management
     const useFeedbackStore  = feedbackStore()

    const managerFeedback = computed(() => useFeedbackStore.state.managers)

   

    const addUpdateDeleteFeedback  = async(feedbackResponse, httpMethod)  => {
        feedbackResponse.date = date 
        feedbackResponse.month = month.value 
        feedbackResponse.year = year.value
        feedbackResponse.manager_id = managerId


        try {
            await useFeedbackStore.addUpdateDeleteFeedback(managerId, feedbackResponse, feedbackType.value, {month:month.value, year: year.value, agent_id: agentId}, httpMethod)
            if (feedbackType.value == 'agents') {
                router.push('/feedback/agents_feedback')
            }else if (feedbackType.value == 'lms'){
                router.push('/feedback/lm_feedback')
            }else if (feedbackType.value == 'managers') {
                router.push('/feedback/managers_feedback')
            }
           
        }catch(error){
            console.log(error)
        }
    }
    
    onMounted(async()=> {
       await useFeedbackStore.fetchFeedback(managerId, {month:month.value, year: year.value, agent_id: agentId}, 'managers')

    })

    watch(route, async (newRoute) => {
    month.value = newRoute.query.month
    year.value = newRoute.query.year

    router.push(newRoute.fullPath);
     
     await useFeedbackStore.fetchFeedback(managerId, newRoute.query, 'managers')
});

   


const agentQuestions = [
        {
            id: 1,
            text: "Are you happy with your immediate head way of managing the team?",
            choices: [
            { label: "Yes very much satisfied", score: 5 },
            { label: "Yes, but still needs improvement", score: 3 },
            { label: "No, lack of leadership skills", score: 1 }
            ]
        },
        {
            id: 2,
            text: "Is your manager fair in implementing policies and treat the team fairly, without biases?",
            choices: [
            { label: "Yes always observe!", score: 5 },
            { label: "Yes, but not at all times", score: 3 },
            { label: "No, has favoritism", score: 1 }
            ]
        },
        {
            id: 3,
            text: "Does he regularly conduct trainings, coaching and meeting to team?",
            choices: [
            { label: "Yes, always!", score: 5 },
            { label: "Yes, but not all times", score: 3 },
            { label: "No, hardly any", score: 1 }
            ]
        },
        {
            id: 4,
            text: "Does he/she response immediately on all your queries, messages and emails?",
            choices: [
            { label: "Yes, always!", score: 5 },
            { label: "Yes, but not at all times", score: 3 },
            { label: "No, not response at all", score: 1 }
            ]
        },
        {
            id: 5,
            text: "Does he/she listen to your suggestions, feedback and criticism without any unfavorable response?",
            choices: [
            { label: "Yes always!", score: 5 },
            { label: "Yes but not at all times", score: 3 },
            { label: "No, cannot accept suggestions and feedbacks", score: 1 }
            ]
        },
        {
            id: 6,
            text: "Rate you manager decision-making skills and analyzing situations.",
            choices: [
            { label: "always finds best solutions to problems", score: 5 },
            { label: "can find solutions but needs improvement", score: 3 },
            { label: "cannot decide and no idea of the situation", score: 1 }
            ]
        },
        {
            id: 7,
            text: "Manager is a role model and can motivate you. ",
            choices: [
            { label: "Yes always motivates us", score: 5 },
            { label: "Yes but not at all times", score: 3 },
            { label: "No, not a good role model", score: 1 }
            ]
        },
        {
            id: 8,
            text: "Manager is honest and acts with integrity.",
            choices: [
            { label: "Yes, always!", score: 5 },
            { label: "Yes, but at all times", score: 3 },
            { label: "No, not at all.", score: 1 }
            ]
        },
        {
            id: 9,
            text: ".Is he updated on new market rule and policies.  Can identify potential risks and opportunities of the market to achieve team's target.",
            choices: [
            { label: "Yes, always!", score: 5 },
            { label: "Yes, but not at all times.", score: 3 },
            { label: "No, not aware of market situation", score: 1 }
            ]
        },
        {
            id: 10,
            text: "Understand his people needs and situation. Show compassions and empathy when necessary.",
            choices: [
            { label: "Yes, always!", score: 5 },
            { label: "Yes, but not at all times", score: 3 },
            { label: "No, he doesn't understand our needs", score: 1 }
            ]
        },
        {
            id: 11,
            text: "Review your performance and address and give feedback regularly to improve your performance",
            choices: [
            { label: "Yes, always!", score: 5 },
            { label: "Yes but not at all times", score: 3 },
            { label: "No, doesn't care at all", score: 1 }
            ]
        },
        {
            id: 12,
            text: "Communicates and gives instructions and ideas clearly. ",
            choices: [
            { label: "Yes, always!", score: 5 },
            { label: "Yes but not at all times", score: 3 },
            { label: "No, not clear in giving instructions", score: 1 }
            ]
        },
        {
            id: 13,
            text: "Knows how to appreciate and compliments your effort and contributions to their team success. ",
            choices: [
            { label: "Yes, always!", score: 5 },
            { label: "Yes but not at all times", score: 3 },
            { label: "No, doesn't know how to appreciate", score: 1 }
            ]
        },
        {
            id: 14,
            text: "Always give support and assistance ",
            choices: [
            { label: "Yes, always!", score: 5 },
            { label: "Yes but not at all times", score: 3 },
            { label: "No, not at all.", score: 1 }
            ]
        },
        {
            id: 15,
            text: "Does he/she submit reports on time and meeting deadlines, attend meetings as requested?",
            choices: [
            { label: "Yes, always!", score: 5 },
            { label: "Yes, sometimes.", score: 3 },
            { label: "No, not at all.", score: 1 }
            ]
        },
        {
            id: 16,
            text: "Participate and support department planning and projects. Provide suggestions and ideas that will help the department achieve goals.",
            choices: [
            { label: "Yes, always!", score: 5 },
            { label: "Yes, sometimes.", score: 3 },
            { label: "No, not at all.", score: 1 }
            ]
        },

    ]

  </script>
  