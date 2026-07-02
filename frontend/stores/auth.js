import { defineStore } from 'pinia'
import { reactive } from 'vue'

import API from '~/utils/api'
import { jwtDecode } from 'jwt-decode'

export const useAuthStore = defineStore('auth', () => {
    const state = reactive({
        token:  null,
        user: null,
        error: null,
        loading: false
    })

    const register = async (userdata, type) => {

         //call auth store fetch the token on the localstorage 
        //save it to state.token
       
       
        fetchTokenFromLocalStore()

        const  token = state.token 
        state.loading = true
        state.error = null 
        let registerType 
        if (type == 'salesagent'){
            registerType = 'sales_register'
        }else if (type == 'standardusers'){
            registerType = "standardusers_register"
        }

        try {
            const response = await fetch(`${API[registerType]}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                  },
                body: JSON.stringify(userdata)
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
                throw new Error(errors.message || JSON.stringify(errors) || "An unknown error occurred");
                
          }

          const data = await response.json()

          alert(data.message)
         
        } catch (error) {
            
             state.error = error.message
        } finally {
            state.loading = false
        }
    }

    const updateLogin = async (userdata, type) => {

        //call auth store fetch the token on the localstorage 
       //save it to state.token
      
      
       fetchTokenFromLocalStore()

       const  token = state.token 
       state.loading = true
       state.error = null 
       let updateLoginType
       if (type == 'salesagent'){
         updateLoginType= 'sales_update_login'
       }else if (type == 'standardusers'){
         updateLoginType = "standardusers_update_login"
       }

       try {
           const response = await fetch(`${API[updateLoginType]}`, {
               method: 'PUT',
               headers: {
                   'Content-Type': 'application/json',
                   'Authorization': `Bearer ${token}`,
                 },
               body: JSON.stringify(userdata)
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
               
               throw new Error(errors.message || JSON.stringify(errors) || "An unknown error occurred");
               
         }

         const data = await response.json()

         alert(data.message)
        
       } catch (error) {
           
            state.error = error.message
       } finally {
           state.loading = false
       }
   }
     
    const login = async (username, password,loginas) => {
        state.loading = true
        state.error = null
        let loginType ;


        if (loginas == 'unitmanager' || loginas == 'lm' || loginas == 'salesagent'){
            loginType = "sales_login"
        // for now all standarduser is consider admin
        }else if (loginas == 'standarduser'){
            loginType = 'standardusers_login'
        }else if (loginas == 'employee'){
            loginType = 'employees_login'
        }
       
        try {
            const response = await fetch(`${API[loginType]}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({username,password, loginas})
            }) 
         
        
            if (!response.ok) {
                
                const errors = await response.json()
                
                 throw new Error(errors.message || JSON.stringify(errors) || "An unknown error occurred");
                
            }

            const data = await response.json()
            
            const decodedToken = jwtDecode(data.accessToken)

           

            state.token = data.accessToken 
            state.user = decodedToken
            console.log( `the token from ths store is  ${state.token}`)

            //Persist token in localStorage 
            localStorage.setItem('jwt', data.accessToken)

          
           
        } catch (error) {
            
             state.error = error.message
        } finally {
            state.loading = false
        }
    }



    const refreshToken  = async(login_id) => {
        state.error = null
        state.loading = false 
        
        try {
            const response = await $fetch(`${API.refreshToken}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: "include",  
                body: JSON.stringify({login_id})
            })

            if (!response.ok) {
                
                const errors = await response.json()
                
                 throw new Error(errors.message || JSON.stringify(errors) || "An unknown error occurred");
                
            }

            const data = await response.json()
            
            if(data && data.accessToken) {
                const decodedToken = jwtDecode(data.accessToken)
                state.token = data.accessToken 
                state.user = decodedToken

                 console.log(localStorage.getItem('jwt')); // Check the current token
                localStorage.setItem('jwt', data.accessToken);
                console.log(localStorage.getItem('jwt')); // Verify the updated token
                return true
            
            }
           

        }catch(error){
            state.error = error.message
          

        }
        finally{
            state.loading = false
        }

    }

    const fetchTokenFromLocalStore = () => {

        if (!import.meta.env.SSR) {  // Runs only on the client
           
            const token = localStorage.getItem('jwt')
            if(token != null){
                const decodedToken = jwtDecode(token)
                state.user = decodedToken
                state.token = token
            }
          
          } 
       
    }

    const logout = async (login_id) => {
        state.loading = true
        state.error = null
       
        try {
            const response = await fetch(`${API.login}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({login_id})
            }) 
         
        
            if (!response.ok) {
                
                const errors = await response.json()
                
                 throw new Error(errors.message || JSON.stringify(errors) || "An unknown error occurred");
                
            }

            localStorage.removeItem('jwt')

            state.token = ""
            state.user =""

                
        } catch (error) {
            
             state.error = error.message
        } finally {
            state.loading = false
        }
    }
    

    return {
        state,
        login,
        logout,
        refreshToken,
        fetchTokenFromLocalStore,
        register,
        updateLogin,
    }

})

