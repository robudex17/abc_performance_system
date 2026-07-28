import { defineStore } from 'pinia'
import { reactive } from 'vue'


import API from '~/utils/api'


export const useManageStandardUsersStore = defineStore('standardUserss', () => {
    //call auth store fetch the token on the localstorage 
    //save it to state.token
    const authStore = useAuthStore()
    authStore.fetchTokenFromLocalStore()

    const  token = authStore.state.token 

    
    const state = reactive({
        standarUsers: [],
        standardUserBio: [],
        error: null
    })

    const fetchStandarUsers = async () => {
        state.loading = true;
        state.error = null;
        let url = API.standardUsers
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
            state.standarUsers= data;
        } catch (error) {
            const customError = new Error(`Failed to fetch standard users info: ${error.message}`);
            customError.originalError = error;  // Attach the original error
            throw customError;
        }
    };

    const fetchStandardUser = async (userId) => {
        state.loading = true;
        state.error = null;
        let url = API.standardUsers
        try {
            // Fetch sales agent info
            const response = await fetch(`${url}/${userId}`, {
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
            state.standardUserBio = data;
        } catch (error) {
            const customError = new Error(`Failed to fetch standard user info: ${error.message}`);
            customError.originalError = error;  // Attach the original error
            throw customError;
        }
    };


   
    // POST/ADD Sales Agent
    const addStandardUser = async (newStandardUser) => {
        state.loading = true;
        state.error = null;
       
        try {
            // Create a FormData object
            const formData = new FormData();

            // Append each field from newAgent to the FormData object
            for (const key in newStandardUser) {
                // Check if the value is an image file (assuming it's a file field in newAgent)
                if (key === 'image' && newStandardUser[key] instanceof File) {
                    formData.append('image', newStandardUser[key]); // Append the image file
                } else {
                    formData.append(key, newStandardUser[key]); // Append other fields
                }
            }
           
        
            const response = await fetch(API.standardUsers, {
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
                const errors = await response.json()
                alert(errors.message)
                throw new Error(errors.message || JSON.stringify(errors) || "An unknown error occurred");
            }



            if(response.ok && response.statusText =='Created' && response.status == 201){
                const data = await response.json()
                alert(data.message)
               await fetchStandarUsers()
            }


        } catch (error) {
            state.error = `Failed to add sales agent: ${error.message}`;
        } finally {
            state.loading = false;
        }
    };


    // UPDATE/EDIT Sales Agent
    const updateStandardUser = async (updatedData) => {
        state.loading = true;
        state.error = null;
        const user_id = updatedData.id
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
            

            const response = await fetch(`${API.standardUsers}/${user_id}`, {
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
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }
       
            if(response.ok && response.status == 201 ){
                const data = await response.json()
                alert(data.message)
               await fetchStandarUsers()
            }
        } catch (error) {
            state.error = `Failed to update standard user: ${error.message}`;
        } finally {
            state.loading = false;
        }
    };

    // DELETE Sales Agent
    const deleteStandardUser = async (user_id) => {
        const confirmation = window.confirm("Are you sure you want to delete this user?");
        if (!confirmation) {
            return; // Exit if the user cancels the deletion
        }
    
        state.loading = true;
        state.error = null;
        try {
            const response = await fetch(`${API.standardUsers}/${user_id}`, {
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
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }
            if(response.ok && response.status == 204){
            alert(`Standard User is successfully deleted...`)
             state.standarUsers = state.standarUsers.filter((user) => user.id !==  user_id);
            }
            
        } catch (error) {
            state.error = `Failed to delete  standard user: ${error.message}`;
        } finally {
            state.loading = false;
        }
    }



       return {
        state, 
        addStandardUser, 
        fetchStandarUsers,
        fetchStandardUser,
        updateStandardUser,
        deleteStandardUser,
    }
})

