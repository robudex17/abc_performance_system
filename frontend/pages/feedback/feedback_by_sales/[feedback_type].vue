<template>
    <div>
        <feedback-form-component 
         v-if="agentFeedback.length > 0"
        :questions="questions" :feedbackTitle="feedbackTitle" 
         :feedbackSubtitle="feedbackSubtitle"
         :feedback="agentFeedback" :feedbackType="feedbackType"
         :admin_view_only="admin_view_only"
         @passFeedbackData="addUpdateDeleteFeedback">

        </feedback-form-component>
        <feedback-form-component v-else 
         :questions="questions" :feedbackTitle="feedbackTitle"
         :feedbackSubtitle="feedbackSubtitle"
         :feedback="[]" :feedbackType="feedbackType"
         :admin_view_only="admin_view_only"
         @passFeedbackData="addUpdateDeleteFeedback">

        </feedback-form-component>

       
    </div>
  </template>
  
  <script setup>

      definePageMeta({
         middleware: ['auth', 'feedback-by-sales-details' ]
     })

     import { onMounted, watch, computed } from 'vue';
     import { feedbackStore } from '~/stores/feedback';
     import { months } from '@/utils/constants'

     const router = useRouter()
     const route = useRoute()
     const query = route.query
     const month = ref(null)
     const year = ref(null)

     const admin_view_only = route.query.admin_view_only=='true'

     const {who_receive_feedback_id } = query

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
    const  feedbackType = route.params.feedback_type


    //make sure that no one will give  feedback on for other user
     if(currentUser.login_type != 'standarduser'){
       
        if(Number(currentUser.login_id) !== Number(route.query.who_give_feedback_id)){
            alert(`Your are not ${route.query.who_give_feedback_db_name} your not allowed to give or update feedback on  ${route.query.who_give_feedback_db_name}'s behalf`)
           
        }
       
    }

  
    const who_give_feedback_agent_type = currentUser.login_type == 'standarduser' ? route.query.who_give_feedback_agent_type : currentUser.agent_type



    console.log('the feedback type is', feedbackType)
    const feedbackTitle = ref('')
    const feedbackSubtitle = ref('')

    if(feedbackType == 'lm_by_agent' || feedbackType == 'um_by_lm'){
       
        feedbackTitle.value = 'MANAGER FEEDBACK EVALUATION'
        feedbackSubtitle.value = 'Rate your Manager based on the following questions.'
    }else if(feedbackType == 'agent_by_lm'){
        
        feedbackTitle.value = 'SALES FEEDBACK EVALUATION'
        feedbackSubtitle.value = 'Rate your agent based on the following questions.'
    }else if(feedbackType == 'lm_by_um'){
        
        feedbackTitle.value = 'LOCAL MANAGER FEEDBACK EVALUATION'
        feedbackSubtitle.value = 'Rate your local-Manager based on the following questions.'
    }

    const { questions } =   useFeedbackQuestions(Number(who_give_feedback_agent_type), feedbackType)



     //get agent_id
    //  const agentId = route.params.id

     //use feedback state management
     const useFeedbackStore  = feedbackStore()

    const agentFeedback = computed(() => useFeedbackStore.state[feedbackType])

   

    const addUpdateDeleteFeedback  = async(feedbackResponse, httpMethod)  => {
        //make sure that no one will give  feedback on for other user
            if(currentUser.login_type != 'standarduser'){
            
            
                if(Number(currentUser.login_id) !== Number(route.query.who_give_feedback_id)){
                    alert(`Your are not ${route.query.who_give_feedback_db_name} your not allowed to give or update feedback on  ${route.query.who_give_feedback_db_name}'s behalf`)
                   return
                }
            
            }

        feedbackResponse.date = date 
        feedbackResponse.month = month.value 
        feedbackResponse.year = year.value
       

        try {
            await useFeedbackStore.addUpdateDeleteFeedback(feedbackResponse.who_receive_feedback_id, feedbackResponse, feedbackType, query, httpMethod)
         
           router.push({
            path: '/feedback/feedback_by_sales',
            query: {
                feedback_type: feedbackType
            }
           })
           
        }catch(error){
            console.log(error)
        }
    }
    
    onMounted(async()=> {
       await useFeedbackStore.fetchFeedback(who_receive_feedback_id, query, feedbackType)

    })


    watch(route, async (newRoute) => {
    alert(`chaange to ${newRoute.query.month} ${newRoute.query.year}`)
    month.value = newRoute.query.month
    year.value = newRoute.query.year
    router.push(newRoute.fullPath);

     await useFeedbackStore.fetchFeedback(who_receive_feedback_id, newRoute.query, feedbackType)
});

   
  



  </script>
  