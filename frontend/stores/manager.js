import { defineStore }  from 'pinia'

import { reactive } from 'vue'
import API from '~/utils/api'

export const useManagerStore = defineStore('managers', () => {
   //call auth store fetch the token on the localstorage 
    //save it to state.token
    const authStore = useAuthStore()
    authStore.fetchTokenFromLocalStore()

    const  token = authStore.state.token 

    const state = reactive({
        managers: [],
        loading : false,
        error: null
    })

    const fetchManagers = async () => {
        state.loading = true 
        state.error = null

        try {
            const response = await fetch(API.fetchManagers,{
                method: 'GET',
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
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json()
            state.managers = data
          
        }catch(error) {
            state.error = error.message

        }finally {
            state.loading = false
        }
    }

    return {
        state, fetchManagers,
    }
})



