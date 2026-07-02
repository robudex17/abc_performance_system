import { defineStore } from 'pinia'
import { reactive } from 'vue'

import API from '~/utils/api'



export const useManageSalesAgentStore2 = defineStore('salesAgents2', () => {
    //call auth store fetch the token on the localstorage 
    //save it to state.token
    const authStore = useAuthStore()
    authStore.fetchTokenFromLocalStore()

    const  token = authStore.state.token 

    
    const state = reactive({
        salesAgents: [],
        salesAgentBio: [],
        salesAgentTargetShipok: [],
        salesAgentNewDeposit: [],
        salesAgentAbsences: [],
        salesAgentMemo: [],
        salesAgentTardiness: [],
        salesAgentFeedback: [],
        salesAgentEvaluation: [],
        salesAgentDeduction: [],
        loading:false,
        error: null
    })

    const fetchSalesAgents = async (queryString) => {
        state.loading = true;
        state.error = null;

        let url = API.salesAgents2
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

            console.log(data)
            state.salesAgents = data;
            state.loading = false
        } catch (error) {
            const customError = new Error(`Failed to fetch sales agents info: ${error.message}`);
            customError.originalError = error;  // Attach the original error
            throw customError;
        }
    };

    const fetchSalesAgent = async (agentId) => {
        state.loading = true;
        state.error = null;
        let url = API.salesAgents2
        try {
            // Fetch sales agent info
            const response = await fetch(`${url}/${agentId}`, {
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
            state.salesAgentBio = data;
             state.loading = false
        } catch (error) {
            const customError = new Error(`Failed to fetch sales agents info: ${error.message}`);
            customError.originalError = error;  // Attach the original error
            throw customError;
        }
    };


    const fetchSalesAgentDetails = async (agentId, queryString, detailsType) => {
        let errorMessage ;
        let url;
      
        switch(detailsType){
            // case "salesAgentBio":
            //     errorMessage = `Failed to fetch sales agent bio with the id of ${agentId}`
            //     url = API.fetchSalesAgentBio
            //     break
            case "salesAgentTargetShipok":
                errorMessage = `Failed to fetch sales agent target/shipok with the id of ${agentId}`
                url = API.fetchSaleAgentTargetShipok
                break 
            case "salesAgentNewDeposit":
                errorMessage = `Failed to fetch sales agent new deposit with the id of ${agentId}`
                url = API.fetchSaleAgentNewDeposit
                break
            case "salesAgentAbsences":
                errorMessage = `Failed to fetch sales agent absences with the id of ${agentId}`
                url = API.fetchSalesAgentAbsences
                break                
           case "salesAgentMemo":
                errorMessage = `Failed to fetch sales agent memo's with the id of ${agentId}`
                 url = API.fetchSalesAgentMemo
                break
           case "salesAgentTardiness":
                errorMessage = `Failed to fetch sales agent tardiness with the id of ${agentId}`
                url = API.fetchSalesAgentTardiness
                break
            case "salesAgentFeedback":
                errorMessage = `Failed to fetch sales agent feedback with the id of ${agentId}`
                url = API.fetchSalesAgentFeedbackByAdmin
                break     
            
                
            default:
                console.log('Invalid Agent Details Type')
                throw new Error(`Invalid Agent Details Type: ${detailsType}`)
        }
        
         url = new URL(`${url}/${agentId}`)
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
            state[detailsType] = data;
             state.loading = false

        } catch (error) {
            const customError = new Error(`${errorMessage}: ${error.message}`);
            customError.originalError = error;  // Attach the original error
            throw customError;
        }
    }

    // POST/ADD Sales Agent
    const addSalesAgent = async (newAgent, queryString) => {
        state.loading = true;
        state.error = null;
       
        try {
            // Create a FormData object
            const formData = new FormData();

            // Append each field from newAgent to the FormData object
            for (const key in newAgent) {
                // Check if the value is an image file (assuming it's a file field in newAgent)
                if (key === 'image' && newAgent[key] instanceof File) {
                    formData.append('image', newAgent[key]); // Append the image file
                } else {
                    formData.append(key, newAgent[key]); // Append other fields
                }
            }
           
        
            const response = await fetch(API.salesAgents2, {
                method: 'POST',
                body: formData, // No need for 'Content-Type' header; it's automatically set
                headers: {
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
                     const errorData = await response.json();
                    throw new Error(errorData.error || `Error: ${response.status} ${response.statusText}`);
            }



            if(response.ok && response.statusText =='Created' && response.status == 201){
                const data = await response.json()
                alert(data.message)
               await fetchSalesAgents(queryString)
            }


        } catch (error) {
            state.error = `Failed to add sales agent: ${error.message}`;
            alert(state.error);  // ✅ shows clean error (e.g., "Agent ID already exists..."
        } finally {
            state.loading = false;
        }
    };


    // UPDATE/EDIT Sales Agent
    const updateSalesAgent = async (updatedData, queryString) => {
        state.loading = true;
        state.error = null;
        const agent_id = updatedData.id
        try {

            // Create a FormData object
            const formData = new FormData();

            // Append each field from newAgent to the FormData object
            for (const key in updatedData) {
                // Check if the value is an image file (assuming it's a file field in newAgent)
                if (key === 'image' &&  updatedData[key] instanceof File) {
                    formData.append('image', updatedData[key]); // Append the image file
                } else {
                    formData.append(key,  updatedData[key]); // Append other fields
                }
            }     
            

            const response = await fetch(`${API.salesAgents2}`, {
                method: 'PUT', // Use PATCH if you're partially updating
                body: formData,
                headers: {
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
                     const errorData = await response.json();
                    throw new Error(errorData.error || `Error: ${response.status} ${response.statusText}`);
            }


            if(response.ok &&  (response.status == 201 || response.status == 200) ){
                let data = await response.json()
                if(data.length == 0){
                    data = "No update for this agent has been made.."
                }
               
                alert(JSON.stringify(data))

                await fetchSalesAgents(queryString)
            }
        } catch (error) {
            state.error = `Failed to update sales agent: ${error.message}`;
        } finally {
            state.loading = false;
        }
    };

    // DELETE Sales Agent
    const deleteSalesAgent = async (agent_id) => {
        const confirmation = window.confirm("Are you sure you want to delete this agent?");
        if (!confirmation) {
            return; // Exit if the user cancels the deletion
        }
    
        state.loading = true;
        state.error = null;
        try {
            const response = await fetch(`${API.salesAgents}/${agent_id}`, {
                method: 'DELETE',
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
                 alert(`Failed to delete agent: ${agent_id} - ${response.status} ${response.statusText}`);
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }
            if(response.ok && response.status == 204){
            alert(`Agent is successfully deleted...`)
             state.salesAgents = state.salesAgents.filter((agent) => agent.id !== agent_id);
            }
            
        } catch (error) {
            state.error = `Failed to delete sales agent: ${error.message}`;
        } finally {
            state.loading = false;
        }
    }


    const addAgentTarget = async (agent_id, query, target) => {
        state.loading = true
        state.error = null
        console.log(`the endpoint is: ${API.agentTargetShipok}/${agent_id}`)
        try {
            const response = await fetch(`${API.agentTargetShipok}/${agent_id}`, {
                method: 'POST',
                body: JSON.stringify(target),
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
  
           
           await fetchSalesAgentDetails(agent_id, query, 'salesAgentTargetShipok')
           alert(`Adding New Target if agentid: ${agent_id} is successful` )
        } catch (error) {
            console.log(error.message)
            state.error = error.message
        } finally {
            state.loading = false
        }
    }
  
    const updateAgentTarget = async (agent_id, query, target) => {
        state.loading = true
        state.error = null
        console.log(`the endpoint is: ${API.agentTargetShipok}/${agent_id}`)
        try {
            const response = await fetch(`${API.agentTargetShipok}/${agent_id}`, {
                method: 'PUT',
                body: JSON.stringify(target),
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
  
           alert(`Target for agentid: ${agent_id} is updated` )
           await fetchSalesAgentDetails(agent_id, query, 'salesAgentTargetShipok')
           
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


    const addAgentDeposit = async (agent_id, query, deposit) => {
        state.loading = true
        state.error = null
       
        try {
            const response = await fetch(`${API.agentDeposit}/${agent_id}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(deposit)
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
  
           
           await fetchSalesAgentDetails(agent_id, query, 'salesAgentNewDeposit')
           alert(`Adding New Deposit for agentid: ${agent_id} is successful` )
        } catch (error) {
            console.log(error.message)
            state.error = error.message
        } finally {
            state.loading = false
        }
    }


    const updateAgentDeposit = async (agent_id, query, updateNewposit) => {
        state.loading = true
        state.error = null
        
        try {
            const response = await fetch(`${API.agentDeposit}/${agent_id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(updateNewposit)

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
  
           alert(`New Deposit for agentid: ${agent_id} is updated` )
           await fetchSalesAgentDetails(agent_id, query, 'salesAgentNewDeposit')
           
        } catch (error) {
            console.log(error)
            state.error = error.message
        } finally {
            state.loading = false
        }
    }


    const deleteAgentNewDeposit = async (agent_id, query, newDeposit) => {
        state.loading = true
        state.error = null
        console.log(`the endpoint is: ${API.agentDeposit}/${agent_id}`)
        try {
            const response = await fetch(`${API.agentDeposit}/${agent_id}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(newDeposit)
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
  
           
           await fetchSalesAgentDetails(agent_id, query, 'salesAgentNewDeposit')
           alert(`New Deposit for agentid: ${agent_id} is delete` )
        } catch (error) {
            console.log(error)
            state.error = error.message
        } finally {
            state.loading = false
        }
    }


   
    const addAgentAttendanceType = async (agent_id, query, attendanceType, attendance) => {
        state.loading = true
        state.error = null
        console.log(`the endpoint is: ${API.agentAttendance[attendanceType]}/${agent_id}`)
        try {
            const response = await fetch(`${API.agentAttendance[attendanceType]}/${agent_id}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(attendance)
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
                alert(errors.message)
                throw new Error(errors || "An unknown error occurred");
            }


        
          let agentAttendanceDetails 
          if (attendanceType == 'memo'){
            agentAttendanceDetails = "salesAgentMemo"
          }else if (attendanceType == 'tardiness'){
            agentAttendanceDetails = "salesAgentTardiness"
          }else if(attendanceType == 'absence'){
             agentAttendanceDetails = "salesAgentAbsences"
          }
           
           await fetchSalesAgentDetails(agent_id, query,  agentAttendanceDetails)
           alert(`Adding ${attendanceType} for agentid: ${agent_id} is successful` )
        } catch (error) {
            console.log(error.message)
            state.error = error.message
        } finally {
            state.loading = false
        }
    }

 
    const updateAgentAttendanceType = async (agent_id, query, attendanceType, attendance) => {
        state.loading = true
        state.error = null
        console.log(`the ${attendanceType} form is ${attendance}`)
        try {
            const response = await fetch(`${API.agentAttendance[attendanceType]}/${agent_id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(attendance)
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

                    
          let agentAttendanceDetails 
          if (attendanceType == 'memo'){
            agentAttendanceDetails = "salesAgentMemo"
          }else if (attendanceType == 'tardiness'){
            agentAttendanceDetails = "salesAgentTardiness"
          }else if(attendanceType == 'absence'){
             agentAttendanceDetails = "salesAgentAbsences"
          }
  
           alert(` ${attendanceType} for agentid: ${agent_id} is updated` )
           await fetchSalesAgentDetails(agent_id, query,  agentAttendanceDetails)
           
        } catch (error) {
            console.log(error)
            state.error = error.message
        } finally {
            state.loading = false
        }
    }


    const deleteAgentAttendanceType = async (agent_id, query, attendanceType, attendance) => {
        state.loading = true
        state.error = null
        try {
            const response = await fetch(`${API.agentAttendance[attendanceType]}/${agent_id}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(attendance)
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
  
           
            let agentAttendanceDetails 
            if (attendanceType == 'memo'){
              agentAttendanceDetails = "salesAgentMemo"
            }else if (attendanceType == 'tardiness'){
              agentAttendanceDetails = "salesAgentTardiness"
            }else if(attendanceType == 'absence'){
               agentAttendanceDetails = "salesAgentAbsences"
            }
    
             alert(` ${attendanceType} for agentid: ${agent_id} is deleted` )
             await fetchSalesAgentDetails(agent_id, query,  agentAttendanceDetails)
             
        } catch (error) {
            console.log(error)
            state.error = error.message
        } finally {
            state.loading = false
        }
    }

    
    const addAgentFeedback = async (agent_id, query, feedback) => {
        state.loading = true
        state.error = null
        console.log(`the endpoint is: ${API.agentFeedback}/${agent_id}`)
        try {
            const response = await fetch(`${API.agentFeedback}/${agent_id}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(feedback)
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
  
           
           await fetchSalesAgentDetails(agent_id, query, 'salesAgentFeedback')
           alert(`Adding New  Feedback  with agentid: ${agent_id} is successful` )
        } catch (error) {
            console.log(error.message)
            state.error = error.message
        } finally {
            state.loading = false
        }
    }

    const updateAgentFeedback = async (agent_id, query, feedback) => {
        state.loading = true
        state.error = null
        console.log(`the endpoint is: ${API.agentFeedback}/${agent_id}`)
        try {
            const response = await fetch(`${API.agentFeedback}/${agent_id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(feedback)
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
  
           alert(`Feeback for agentid: ${agent_id} is updated` )
           await fetchSalesAgentDetails(agent_id, query, 'salesAgentFeedback')
           
        } catch (error) {
            console.log(error)
            state.error = error.message
        } finally {
            state.loading = false
        }
    }

    const deleteAgentFeedback = async (agent_id, query, feedback_date) => {
        state.loading = true
        state.error = null
        console.log(`the endpoint is: ${API.agentFeedback}/${agent_id}`)
        try {
            const response = await fetch(`${API.agentFeedback}/${agent_id}?date=${feedback_date}`, {
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
  
           
           await fetchSalesAgentDetails(agent_id, query, 'salesAgentFeedback')
           alert(`Feedback for agentid: ${agent_id} is delete` )
        } catch (error) {
            console.log(error)
            state.error = error.message
        } finally {
            state.loading = false
        }
    }

    
    const fetchSalesEvaluation = async (queryString) =>{
        state.loading = true;
        state.error = null;

        let url = API.salesAgentsEvaluation
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

           
            state.salesAgentEvaluation = data;
        } catch (error) {
            const customError = new Error(`Failed to fetch sales agents evaluation: ${error.message}`);
            customError.originalError = error;  // Attach the original error
            throw customError;
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
        fetchSalesAgents,
        fetchSalesAgent,
        fetchSalesAgentDetails,
        addSalesAgent,
        updateSalesAgent,
        deleteSalesAgent,
        addAgentTarget,
        updateAgentTarget,
        deleteAgentTarget,
        addAgentDeposit,
        updateAgentDeposit,
        deleteAgentNewDeposit,
        addAgentAttendanceType,
        updateAgentAttendanceType,
        deleteAgentAttendanceType,
        addAgentFeedback,
        updateAgentFeedback,
        deleteAgentFeedback,
        fetchSalesEvaluation, 
        submitSalesEvaluation,
        reviewSalesEvaluation,
        addUpdateDeleteDeduction,
    }
})

