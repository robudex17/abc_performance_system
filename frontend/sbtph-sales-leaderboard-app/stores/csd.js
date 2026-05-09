import { defineStore } from 'pinia'
import { reactive } from 'vue'

import API from '~/utils/api'



export const csdStore = defineStore('csdStore', () => {
    //call auth store fetch the token on the localstorage 
    //save it to state.token
    const authStore = useAuthStore()
    authStore.fetchTokenFromLocalStore()

    const  token = authStore.state.token 

    
    const state = reactive({
    
        csdPerformanceMertics: [],
        loading:false,
        error: null
    })

  
    const fetchCsdPerformanceMetrics = async (employee_id, metrics_type, queryString) =>{
        state.loading = true;
        state.error = null;

        let url = `${API.csd_performance_metrics}/${metrics_type}`

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

           
            state.csdPerformanceMertics = data;
        } catch (error) {
            const customError = new Error(`Failed to fetch sales agents evaluation: ${error.message}`);
            customError.originalError = error;  // Attach the original error
            throw customError;
        }
    }

    const addCsdPerformanceMetrics = async (employee_id, metrics_type, query, body) => {
        state.loading = true
        state.error = null

        let url = `${API.csd_performance_metrics}/${metrics_type}`

        if(employee_id){
            url = `${url}/${employee_id}`
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
  
    const updateCsdPerformanceMetrics = async (employee_id, metrics_type, query, body) => {
        state.loading = true
        state.error = null

        let url = `${API.csd_performance_metrics}/${metrics_type}`


        if(employee_id){
            url = `${url}/${employee_id}`
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

    const deleteAgentTarget = async (agent_id, query, target_date) => {
        state.loading = true
        state.error = null
        console.log(`the endpoint is: ${API.agentTargetShipok}/${agent_id}`)
        try {
            const response = await fetch(`${API.agentTargetShipok}/${agent_id}?month=${query.month}&year=${query.year}`, {
                method: 'DELETE',
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
  
           
           await fetchSalesAgentDetails(agent_id, query, 'salesAgentTargetShipok')
           alert(`Target for agentid: ${agent_id} is delete` )
        } catch (error) {
            console.log(error)
            state.error = error.message
        } finally {
            state.loading = false
        }
    }



    const submitSalesEvaluation = async (agent_id, data) => {
        state.loading = true
        state.error = null
        try {
            const response = await fetch(`${API.salesAgentsEvaluation}/${agent_id}`, {
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
  
           let month 
           let year 

           if(agent_id == 'all' ){
            month = data[0].month
            year = data[0].year
           }else{
            month = data.month
            year = data.year
           }
           await fetchSalesEvaluation({month: month, year: year})
           alert(`Submitting evaluation for : ${agent_id} is successful` )
        } catch (error) {
            console.log(error.message)
            state.error = error.message
        } finally {
            state.loading = false
        }
    }
    
    const reviewSalesEvaluation = async (agent_id, data) => {
        state.loading = true
        state.error = null
   
        try {
            const response = await fetch(`${API.salesAgentsEvaluation}/${agent_id}`, {
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
  
           
           await fetchSalesEvaluation({month: data.month, year: data.year})
           let message 
           if (agent_id == 'all') {
               message = `Sales Evaluation Data For ${agent_id} are marked for review`
           }else {
                message = `Sales Evaluation Data for : ${agent_id} is marked for review`
           }

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
        
        submitSalesEvaluation,
        reviewSalesEvaluation,
        addUpdateDeleteDeduction,
        fetchCsdPerformanceMetrics,
        addCsdPerformanceMetrics,
        updateCsdPerformanceMetrics,
    }
})

