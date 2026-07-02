import { defineStore } from 'pinia'
import { reactive } from 'vue'

import API from '~/utils/api'

export const feedbackStore = defineStore('feedback', () => {
      //call auth store fetch the token on the localstorage 
    //save it to state.token
    const authStore = useAuthStore()
    authStore.fetchTokenFromLocalStore()

    const  token = authStore.state.token 

    // Reactive state definition
    const state = reactive({
        // agents: [],
        // lms: [],
        // managers: [],
        admin: [],
        agent_by_lm: [],
        lm_by_agent: [],
        lm_by_um: [],
        um_by_lm: [],
        qa: [],
        
        loading:false,
        error: null
    })

    // Action to fetch sales leaderboard
    const fetchFeedback = async(id, queryString, feedbackType) => {
        let errorMessage ;
        let url;
        state.loading = true
         
        switch(feedbackType){
           
           case "agent_by_lm":
           case "lm_by_agent":
           case "lm_by_um":
           case "um_by_lm":
                errorMessage = `Failed to fetch  ${feedbackType} feedback`
                url = API.feedback.sales
                console.log('It came here...')
                break 

            case "qa":
                errorMessage = `Failed to fetch   ${feedbackType} feedback`
                url = API.feedback.qa
                break  
            
            case "admin":
                
                 errorMessage = `Failed to fetch  ${feedbackType} feedback`                       
                 url = API.agentFeedback
                break                                 
       
            
                
            default:
                console.log('Invalid Feedback  Type')
                throw new Error(`Invalid Feedback Type: ${feedbackType}`)
        }
        
         url = new URL(`${url}/${id}`)
    

       
        if (queryString) {
            Object.keys(queryString).forEach((key) =>
                url.searchParams.append(key, queryString[key])
            )
        }
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
            });

            //token is  invalid  remove to local storage 
            if(!response.ok && response.status == 403){
                const errors = await response.json()
                if (errors.message == 'Invalid Access Token'){
                    localStorage.removeItem('jwt')
                    alert('Your Session has been expired, Please Login again.')
                    location.reload()
                }
            }            

            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }
    
            const data = await response.json();
         
           
            if (feedbackType != "qa" &&  feedbackType != 'admin'){
           
                if (data && data.length > 0 ){
                    data[0].responses = JSON.parse(data[0].responses)
                }
            }
           
            
           
            state[feedbackType] = data
          
            state.loading = false
        } catch (error) {
            const customError = new Error(`${errorMessage}: ${error.message}`);
            customError.originalError = error;  // Attach the original error
            throw customError;
        }
        finally{
            state.loading = false
        }
    }

    const addUpdateDeleteFeedback = async(id, feedbackResponse, feedbackType, query, httpMethod) => {
        state.loading = true
        state.error = null
        let url;
        let errorMessage
        console.log('feedbackData',id, feedbackResponse, feedbackType, query, httpMethod )
  
        switch(feedbackType){

           case "agent_by_lm":
           case "lm_by_agent":
           case "lm_by_um":
           case "um_by_lm":
                errorMessage = `Failed to fetch  ${feedbackType} feedback`
                url = API.feedback.sales
              
                break 

            case "qa":
                    errorMessage = `Failed to fetch  ${feedbackType} feedback`
                    url = API.feedback.qa
                    break
            case "admin":
                 errorMessage = `Failed to fetch  ${feedbackType} feedback`                       
                url =`${API.agentFeedback}/${id}`
                break       
                          
            default:
                console.log('Invalid Feedback  Type')
                throw new Error(`Invalid Feedback Type: ${feedbackType}`)
        }
        
         url = new URL(`${url}`)      
        try {
            const response = await fetch(`${url}`, {
                method: httpMethod,
                body: JSON.stringify(feedbackResponse),
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
            }) 
         
            //token is  invalid  remove to local storage 
            if(!response.ok && response.status == 403){
                const errors = await response.json()
                if (errors.message == 'Invalid Access Token'){
                    localStorage.removeItem('jwt')
                    alert('Your Session has been expired, Please Login again.')
                    location.reload()
                }
            }           

            if (!response.ok) {
                
                const errors = await response.json()
                throw new Error(errors || "An unknown error occurred");
            }
       
          if (httpMethod == 'POST'){
               
                alert(`Adding New ${feedbackType} feedback with id of ${id} is successful` ) 
           }else if (httpMethod== 'PUT'){
                alert(`${feedbackType} feedback with id of ${id} is updated` ) 
           }else if (httpMethod== 'DELETE'){
                alert(`${feedbackType} feedback with id of ${id} is deleted` ) 
           }else{
            console.log('Un Identified method.')
           }


           await fetchFeedback(id, query, feedbackType)
    
          
        } catch (error) {
            console.log(error.message)
            state.error = error.message
        } finally {
            state.loading = false
        }
    }

    const  enableDisableSalesFeedback= async(data, httpMethod) => {
        state.loading = true
        state.error = null
        let url;
        let errorMessage
       
         url = API.enableDisableDeleteSalesFeedback
         url = new URL(`${url}`)      
        try {
            const response = await fetch(`${url}`, {
                method: httpMethod,
                body: JSON.stringify(data),
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
            }) 
         
            //token is  invalid  remove to local storage 
            if(!response.ok && response.status == 403){
                const errors = await response.json()
                if (errors.message == 'Invalid Access Token'){
                    localStorage.removeItem('jwt')
                    alert('Your Session has been expired, Please Login again.')
                    location.reload()
                }
            }           

            if (!response.ok) {
                
                const errors = await response.json()
                throw new Error(errors || "An unknown error occurred");
            }
  
           
           await fetchFeedback(data.who_receive_feedback_id, data, data.feedback_type)
            const feedbackUpdateStats = data.can_update == 1 ? 'enabled' : 'disabled'
            if (httpMethod== 'PUT'){
                alert(` Update for ${data.who_receive_feedback_id} is now ${feedbackUpdateStats}` ) 
           }else if (httpMethod== 'DELETE'){
                alert(`Feedback for ${data.who_receive_feedback_id} is now deleted` ) 
           }else{
            console.log('Un Identified method.')
           }
          
        } catch (error) {
            console.log(error.message)
            state.error = error.message
        } finally {
            state.loading = false
        }
    }


 

    // Expose individual state properties and actions
    return {
        state,  
        fetchFeedback ,
        addUpdateDeleteFeedback,
        enableDisableSalesFeedback,
    }
})
