import { defineStore }  from 'pinia'

import { reactive } from 'vue'
import API from '~/utils/api'

export const usePositionsRolesStore = defineStore('positions_roles', () => {
   //call auth store fetch the token on the localstorage 
    //save it to state.token
    const authStore = useAuthStore()
    authStore.fetchTokenFromLocalStore()

    const  token = authStore.state.token    

    const state = reactive({
        positions: [],
        roles: [],
        loading : false,
        error: null
    })


    

    const fetchPositionsRoles = async (id,type, queryString) => {
      
        state.loading = true 
        state.error = null
        let url = API.positions_roles[type]
       
      
        if(id) {
            url = `${API.positions_roles[type]}/${id}`
        }

        url = new URL(`${url}`)
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
            console.log('the return data is', data)
            state[type] = data
            console.log('the data in the state is', state[type])

        }catch(error) {
            state.error = error.message

        }finally {
            state.loading = false
        }
    }

       const addUpdateDeletePositionsRoles = async (type,data, httpMethod, sucessMessage) => {
        state.loading = true
        state.error = null
       
        try {
            const response = await fetch(`${API.positions_roles[type]}`, {
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
  
           
           await fetchPositionsRoles(null, type)
           alert(sucessMessage)
        } catch (error) {
            console.log(error.message)
            state.error = error.message
        } finally {
            state.loading = false
        }
    } 





    return {
        state, fetchPositionsRoles, addUpdateDeletePositionsRoles
    }
})



