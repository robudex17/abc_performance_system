import { defineStore } from 'pinia'
import { reactive } from 'vue'

import API from '~/utils/api'



export const useManageEmployeesStore = defineStore('Employees', () => {
    //call auth store fetch the token on the localstorage 
    //save it to state.token
    const authStore = useAuthStore()
    authStore.fetchTokenFromLocalStore()

    const  token = authStore.state.token 

    
    const state = reactive({
        employees: [],
        employeeBio: [],
     
        employeeAbsences: [],
        employeeMemo: [],
        employeeTardiness: [],
        employeeFeedback: [],
        employeeEvaluation: [],
        loading:false,
        error: null
    })

    const fetchEmployees = async (queryString, department_code) => {
        state.loading = true;
        state.error = null;

        let url =`${API.employees}/${department_code}` 
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
            state.employees = data;
            state.loading = false
        } catch (error) {
            const customError = new Error(`Failed to fetch employees info: ${error.message}`);
            customError.originalError = error;  // Attach the original error
            throw customError;
        }
    };

    const fetchEmployee = async (employeeId, department_code) => {
        state.loading = true;
        state.error = null;
        url =`${API.employees}/${department_code}`  
        try {
            // Fetch sales agent info
            const response = await fetch(`${url}/${employeeId}`, {
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
            state.employeeBio = data;
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

    // POST/ADD Employee
    const addEmployee = async (newEmployee, department_code, queryString) => {
        state.loading = true;
        state.error = null;
       
        try {
            // Create a FormData object
            const formData = new FormData();

            // Append each field from newEmployee to the FormData object
            for (const key in newEmployee) {
                // Check if the value is an image file (assuming it's a file field in newEmployee)
                if (key === 'image' && newEmployee[key] instanceof File) {
                    formData.append('image', newEmployee[key]); // Append the image file
                } else {
                    formData.append(key, newEmployee[key]); // Append other fields
                }
            }
           
        
            const response = await fetch(`${API.employees}/${department_code}`, {
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
               await fetchEmployees(queryString, department_code)
            }


        } catch (error) {
            state.error = `Failed to add sales agent: ${error.message}`;
            alert(state.error);  // ✅ shows clean error (e.g., "Agent ID already exists..."
        } finally {
            state.loading = false;
        }
    };


    // UPDATE/EDIT Employee
    const updateEmployee = async (updatedData, department_code, queryString) => {
        state.loading = true;
        state.error = null;
        const employee_id = updatedData.id
        try {

            // Create a FormData object
            const formData = new FormData();

            // Append each field from newEmployee to the FormData object
            for (const key in updatedData) {
                // Check if the value is an image file (assuming it's a file field in newEmployee)
                if (key === 'image' &&  updatedData[key] instanceof File) {
                    formData.append('image', updatedData[key]); // Append the image file
                } else {
                    formData.append(key,  updatedData[key]); // Append other fields
                }
            }     
            

            const response = await fetch(`${API.employees}/${department_code}/${employee_id}`, {
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

                await fetchEmployees(queryString, department_code)
            }
        } catch (error) {
            state.error = `Failed to update sales agent: ${error.message}`;
        } finally {
            state.loading = false;
        }
    };

    // DELETE Employee
    const deleteEmployee = async (employee_id) => {
        const confirmation = window.confirm("Are you sure you want to delete this employee?");
        if (!confirmation) {
            return; // Exit if the user cancels the deletion
        }
    
        state.loading = true;
        state.error = null;
        try {
            const response = await fetch(`${API.employees}/${department_code}/${employee_id}`, {
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
            alert(`Employee is successfully deleted...`)
             state.employees = state.employees.filter((employee) => employee.id !== employee_id);
            }
            
        } catch (error) {
            state.error = `Failed to delete employee: ${error.message}`;
        } finally {
            state.loading = false;
        }
    }


   
    const addEmployeeAttendanceType = async (agent_id, query, attendanceType, attendance) => {
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

 
    const updateEmployeeAttendanceType = async (agent_id, query, attendanceType, attendance) => {
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


    const deleteEmployeeAttendanceType = async (agent_id, query, attendanceType, attendance) => {
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

    
    const addEmployeeFeedback = async (agent_id, query, feedback) => {
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

    const updateEmployeeFeedback = async (agent_id, query, feedback) => {
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

    const deleteEmployeeFeedback = async (agent_id, query, feedback_date) => {
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



    return {
        state,
        fetchEmployees,
        fetchEmployee,
        fetchSalesAgentDetails,
        addEmployee,
        updateEmployee,
        deleteEmployee, 
        addEmployeeAttendanceType,
        updateEmployeeAttendanceType,
        deleteEmployeeAttendanceType, 
    
     
    }
})

