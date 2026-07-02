import { defineStore } from 'pinia'
import { reactive } from 'vue'

import API from '~/utils/api'

export const useCsdStore = defineStore('csdStore', () => {
    //call auth store fetch the token on the localstorage 
    //save it to state.token
    const authStore = useAuthStore()
    authStore.fetchTokenFromLocalStore()

    const  token = authStore.state.token 

    
    const state = reactive({
    
        csdPerformanceMertics: [],
        csdLeaderboard: [],
        csdEvaluation: [],
        loading: false,
        error: null
    })



      // Action to fetch sales leaderboard
    const fetchLeaderboard = async ( scope , employee_id,queryString) => {
        state.loading = true
        state.error = null

        
        let url = `${API.csd_leaderboard}`
        
        if(scope){
            url = `${API.csd_leaderboard}/${scope}`
        }

        if(employee_id){
            url = `${url}/${employee_id}`
        }
   
        try {
            // Build the URL
            url = new URL(`${url}`)
            

            if (queryString) {
                Object.keys(queryString).forEach((key) =>
                    url.searchParams.append(key, queryString[key])
                )
            }

        
      
            // Fetch leaderboard data
            const response = await fetch(url,{
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
            })

            if(!response.ok && response.status == 403){
                const errors = await response.json()
                if (errors.message == 'Invalid Access Token'){
                    localStorage.removeItem('jwt')
                    alert('Your Session has been expired, Please Login again.')
                    location.reload()
                }
            }
            if (!response.ok) {
               
                state.csdLeaderboardleaderboard = []
                throw new Error(`Error: ${response.status} ${response.statusText}`)
            }
            
        
            const data = await response.json()

            state.csdLeaderboard = data
     
           
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error)
            state.
            state.error = error.message
        } finally {
            state.loading = false
        }
    }
    //entity  value can be either 'metrics' or 'evaluation' to determine which state to update after submit or review action
    const fetchCsdOrEvaluationPerformanceMetrics = async (employee_id, entity_type, entity, queryString) =>{
        state.loading = true;
        state.error = null;
        let  url = `${API.csd_entities[entity]}/${entity_type}`
    
        
        if(employee_id){
            url = `${url}/${employee_id}`
        }

        url = new URL(`${url}`)

        if (queryString) {
            Object.keys(queryString).forEach((key) =>
                url.searchParams.append(key, queryString[key])
            )
        }
        try {
            // Fetch sales agent info
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

            if(entity == 'metrics'){
                state.csdPerformanceMertics = data;
            }else if (entity == 'evaluation'){
                state.csdEvaluation = data;
            }
            state.loading = false
        } catch (error) {
            const customError = new Error(`Failed to fetch ${entity} ${entity_type}: ${error.message}`);
            customError.originalError = error;  // Attach the original error
            throw customError;
        }
    }

    const addCsdPerformanceMetricsOrEvaluation = async (employee_id, entity_type, entity, queryString, body) => {
        state.loading = true
        state.error = null

        

        let  url = `${API.csd_entities[entity]}/${entity_type}`
    
        
        if(employee_id){
            url = `${url}/${employee_id}`
        }


      

        url = new URL(`${url}`)
        if (queryString) {
         Object.keys(queryString).forEach((key) =>
                    url.searchParams.append(key, queryString[key])
            )
         }


       
        try {
            const response = await fetch(`${url}`, {
                method: 'POST',
                body: JSON.stringify(body),
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

            
            const data = await response.json()
           
       
           alert(data.message )
        } catch (error) {
            console.log(error.message)
            
            state.error = error.message
        } finally {
            state.loading = false
        }
    }
  
    const updateCsdPerformanceMetricsOrEvaluation = async (employee_id, entity_type, entity, queryString, body) => {
        state.loading = true
        state.error = null


        let  url = `${API.csd_entities[entity]}/${entity_type}`
    
        
        if(employee_id){
            url = `${url}/${employee_id}`
        }



        url = new URL(`${url}`)
        if (queryString) {
         Object.keys(queryString).forEach((key) =>
                    url.searchParams.append(key, queryString[key])
            )
         }


     
       
        try {
            const response = await fetch(`${url}`, {
                method: 'PUT',
                body: JSON.stringify(body),
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
  
           const data = await response.json()
           
           alert(data.message )
        } catch (error) {
            console.log(error)
            state.error = error.message
        } finally {
            state.loading = false
        }
    }

    const deleteCsdPerformanceMetricsOrEvaluation= async (employee_id, entity_type, entity, queryString, body) => {
        state.loading = true
        state.error = null
        
        let  url = `${API.csd_entities[entity]}/${entity_type}`
    
        
        if(employee_id){
            url = `${url}/${employee_id}`
        }
        url = new URL(`${url}`)
        if (queryString) {
         Object.keys(queryString).forEach((key) =>
                    url.searchParams.append(key, queryString[key])
            )
         }


        try {
            const response = await fetch(url, {
                method: 'DELETE',
                body: JSON.stringify(body),
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                // body: JSON.stringify(target)
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
  
           
            const data = await response.json()
            
            alert(data.message )
            } catch (error) {
                console.log(error)
                state.error = error.message
            } finally {
                state.loading = false
            }
    }

    const submitPerformanceMetricsOrEvaluation = async (employee_id, data, submit_type, query_string) => {
        
        state.loading = true
        state.error = null
        try {
            const response = await fetch(`${API.csd_performance_metrics_submit}/${submit_type}/${employee_id}`, {
                method: 'POST',
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
  

           await fetchCsdPerformanceMetrics(null, 'all', query_string )

          
           alert(`Submitting evaluation for : ${employee_id} is successful` )
        } catch (error) {
            console.log(error.message)
            state.error = error.message
        } finally {
            state.loading = false
        }
    }
    
    const reviewPerformanceMetricsOrEvaluation = async (employee_id, data, review_type, query_string) => {
        state.loading = true
        state.error = null
   
        try {
            const response = await fetch(`${API.csd_performance_metrics_review}/${review_type}/${employee_id}`, {
                method: 'DELETE',
                body: JSON.stringify(data),
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                // body: JSON.stringify(target)
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
  
           
          
           let message 
           if (employee_id == 'all') {
               message = `Peformance Metrics Data For ${employee_id} are marked for review`
           }else {
                message = `Performance Metrics Data for : ${employee_id} is marked for review`
           }

           await fetchCsdOrEvaluationPerformanceMetrics(null, 'all', 'metrics', query_string )

           alert(message)
        } catch (error) {
            console.log(error)
            state.error = error.message
        } finally {
            state.loading = false
        }
    } 
    
    const addUpdateDeleteDeduction = async(id, data , query, httpMethod) => {
        state.loading = true
        state.error = null
        let url = `${API.agent_deduction}/${id}`
        let errorMessage
        
  
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
       
          if (httpMethod == 'POST'){
               
                alert(`Adding New Deduction with id of ${id} is successful` ) 
           }else if (httpMethod== 'PUT'){
                alert(`Updating Deduction with id of ${id} is successful` )
           }else if (httpMethod== 'DELETE'){
                alert(`Deleting Deduction with id of ${id} is successful` )
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
    

    return {
        state, 
        
        submitPerformanceMetricsOrEvaluation,
        reviewPerformanceMetricsOrEvaluation,
        addUpdateDeleteDeduction,
        fetchCsdOrEvaluationPerformanceMetrics,
        addCsdPerformanceMetricsOrEvaluation,
        updateCsdPerformanceMetricsOrEvaluation,
        deleteCsdPerformanceMetricsOrEvaluation,
        fetchLeaderboard,
        
    }
})

