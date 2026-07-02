import { defineStore } from 'pinia'
import { reactive } from 'vue'

import API from '~/utils/api'

export const useAnalyticsStore = defineStore('analytics', () => {
      //call auth store fetch the token on the localstorage 
    //save it to state.token
    const authStore = useAuthStore()
    authStore.fetchTokenFromLocalStore()

    const  token = authStore.state.token 

    // Reactive state definition
    const state = reactive({
        analyticsData: [],
        loading: false,
        error: null,
    })

    // Action to fetch sales leaderboard
    const fetchAnalyticsData = async (queryString = null, scope) => {
        state.loading = true
        state.error = null

        console.log('the scope is ', scope)
        try {
            // Build the URL
            let url = new URL(`${API.fetchAnalytics}/${scope}`)
            if (queryString) {
                Object.keys(queryString).forEach((key) =>
                    url.searchParams.append(key, queryString[key])
                )
            }

            // Fetch leaderboard data
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
                throw new Error(`Error: ${response.status} ${response.statusText}`)
            }

            const data = await response.json()
            console.log('the data is ',data)
            state.analyticsData = data
           
        } catch (error) {
            console.error('Failed to fetch anlytics data:', error)
            state.error = error.message
        } finally {
            state.loading = false
        }
    }



    // Expose individual state properties and actions
    return {
        state,  
        fetchAnalyticsData ,
    }
})
