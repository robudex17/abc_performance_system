<template>
    <div>
        <feedback-form-component 
         v-if="lmsFeedback.length > 0"
        :questions=" smManagerQuestions" feedbackTitle="LOCAL MANAGER FEEDBACK EVALUATION" 
        feedbackSubtitle="Rate your local-Manager based on the following questions."
         :feedback="lmsFeedback" :feedbackType="feedbackType"
         @passFeedbackData="addUpdateDeleteFeedback">

        </feedback-form-component>
        <feedback-form-component v-else 
          :questions=" smManagerQuestions" feedbackTitle="LOCAL MANAGER FEEDBACK EVALUATION" 
         feedbackSubtitle="Rate your local-Manager based on the following questions."
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
    const  feedbackType = ref('lms')

     //get agent_id
     const lmId = route.params.lm_id

     //use feedback state management
     const useFeedbackStore  = feedbackStore()

    const lmsFeedback = computed(() => useFeedbackStore.state.lms)

   
    const addUpdateDeleteFeedback  = async(feedbackResponse, httpMethod)  => {
        feedbackResponse.date = date 
        feedbackResponse.month = month.value 
        feedbackResponse.year = year.value
        feedbackResponse.lm_id = lmId

        console.log('the updated response is: ', feedbackResponse)

        try {
            await useFeedbackStore.addUpdateDeleteFeedback(lmId, feedbackResponse, feedbackType.value, {month:month.value, year: year.value}, httpMethod)
            if (feedbackType.value == 'agents') {
                router.push('/feedback/agents_feedback')
            }else if (feedbackType.value == 'lms'){
                router.push('/feedback/lm_feedback')
            }else if (feedbackType.value == 'managers') {
                router.push('/feedback/lm_feedback')
            }
           
        }catch(error){
            console.log(error)
        }
    }
    
    onMounted(async()=> {
       await useFeedbackStore.fetchFeedback(lmId, {month:month.value, year: year.value}, 'lms')

    })


    watch(route, async (newRoute) => {
    month.value = newRoute.query.month
    year.value = newRoute.query.year
     router.push(newRoute.fullPath);
     
     await useFeedbackStore.fetchFeedback(lmId, newRoute.query, 'lms')
});
        const smManagerQuestions = [
        {
            id: 1,
            text: "Able to engage his/her team to hit target for the month.",
            choices: [
            { label: "Yes, able to hit target", score: 5 },
            { label: "Yes but not all agents hit their idnividual target", score: 3 },
            { label: "No agents hit target", score: 1 }
            ]
        },
        {
            id: 2,
            text: "Team performance has improved compared to last month results.",
            choices: [
            { label: "Yes has shown great improvements", score: 5 },
            { label: "Same as just last month", score: 3 },
            { label: "No, result is better last month", score: 1 }
            ]
        },
        {
            id: 3,
            text: "Not easily affected and disturb by stress and pressure. Always find ways and knows how to solve issues and problems with less supervision.",
            choices: [
            { label: "Yes, always!", score: 5 },
            { label: "Yes, sometimes.", score: 3 },
            { label: "No, not at all", score: 1 }
            ]
        },
        {
            id: 4,
            text: "Show eagerness and enthusiasm at work. Attract and motivates his team to work hard and aim higher.",
            choices: [
            { label: "Yes, always!", score: 5 },
            { label: "Yes, sometimes.", score: 3 },
            { label: "No, not at all.", score: 1 }
            ]
        },
        {
            id: 5,
            text: "Is he updated on new market rule and policies.  Can identify potential risks and opportunities of the market to achieve team's target.",
            choices: [
            { label: "Yes always!", score: 5 },
            { label: "Yes but not at all times", score: 3 },
            { label: "No, not aware of market situation", score: 1 }
            ]
        },
        {
            id: 6,
            text: "Is he/she fair in implementing policies and treat the team fairly, without biases?",
            choices: [
            { label: "Yes, always observe", score: 5 },
            { label: "Yes, but not at all times", score: 3 },
            { label: "No, has favoritism", score: 1 }
            ]
        },
        {
            id: 7,
            text: "Does he/she response immediately on all your queries, messages and emails?",
            choices: [
            { label: "Yes, always!", score: 5 },
            { label: "Yes, but not at all times", score: 3 },
            { label: "No, not responding and late in replies", score: 1 }
            ]
        },
        {
            id: 8,
            text: "Display very good time management. Very organize and systematic and has focus on work.",
            choices: [
            { label: "Yes, always!", score: 5 },
            { label: "Yes, sometimes.", score: 3 },
            { label: "No, not at all.", score: 1 }
            ]
        },
        {
            id: 9,
            text: "Does he/she listen to your suggestions, feedback and criticism without any unfavorable response?",
            choices: [
            { label: "Yes, always!", score: 5 },
            { label: "Yes, but not at all times.", score: 3 },
            { label: "No, cannot accept suggestions and feedbacks", score: 1 }
            ]
        },
        {
            id: 10,
            text: "Knows how to update managers of there absences, tardiness and any concern relating to work",
            choices: [
            { label: "Yes, always!", score: 5 },
            { label: "Yes, sometimes.", score: 3 },
            { label: "No, not at all.", score: 1 }
            ]
        },
        {
            id: 11,
            text: "Follow company rules, sales policies and manager's instructions",
            choices: [
            { label: "Yes, always!", score: 5 },
            { label: "Yes, sometimes.", score: 3 },
            { label: "No, not at all.", score: 1 }
            ]
        },
        {
            id: 12,
            text: "Show and treat managers and other people with respect.",
            choices: [
            { label: "Yes, always!", score: 5 },
            { label: "Yes, sometimes.", score: 3 },
            { label: "No, not at all.", score: 1 }
            ]
        },
        {
            id: 13,
            text: "Review team's performance and address and give feedback regularly to improve team's performance   Coach and train and offer support to people to improve their performance.",
            choices: [
            { label: "Yes, always!", score: 5 },
            { label: "Yes, sometimes.", score: 3 },
            { label: "No, not at all.", score: 1 }
            ]
        },
        {
            id: 14,
            text: "Honest and acts with integrity.",
            choices: [
            { label: "Yes, always!", score: 5 },
            { label: "Yes, sometimes.", score: 3 },
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
        
 
    ];
  </script>
  