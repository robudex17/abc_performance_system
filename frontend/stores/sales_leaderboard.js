import { defineStore } from 'pinia'
import { reactive } from 'vue'
import { useAuthStore } from './auth'

import API from '~/utils/api'

export const useLeaderBoardStore = defineStore('leaderboard', () => {
    const  authStore = useAuthStore()
    authStore.fetchTokenFromLocalStore()
    const token = authStore.state.token
    const user = authStore.state.user
    const login_id = user?.login_id 

     /*
      The user?.login_id syntax works because of optional chaining (?.), 
      which is a feature in JavaScript that allows you to safely access properties on an object that might be null or undefined.
      
      n Vue 3, reactivity is often handled using Proxy objects. When you use reactive or ref, Vue wraps the objects in a Proxy. 
      This Proxy intercepts interactions with the object and ensures that reactivity is properly handled.

      In your case, the authStore.state.user is likely a Proxy object that Vue uses to manage reactivity.
     */

    // Reactive state definition
    const state = reactive({
        leaderboard: [],
        agentYearPerformance: {},
        agentPerformance: [],
        loading: false,
        error: null,
    })

    // Action to fetch sales leaderboard
    const fetchLeaderboard = async ( leaderboardOpton ,queryString, year_summary) => {
        state.loading = true
        state.error = null
        let url = API.fethSalesLearderboard
        
        if(leaderboardOpton){
                url = `${url}/${leaderboardOpton}`
            }



        if (year_summary){
            queryString.year_summary = true
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
                state.agentYearPerformance = []
                state.agentPerformance = []
                state.leaderboard = []
                throw new Error(`Error: ${response.status} ${response.statusText}`)
            }
            
        
            const data = await response.json()
            if (queryString.fullyear == true){
                state.agentYearPerformance = data
                console.log('it came here?',  state.agentYearPerformance)
            }else {
                state.leaderboard = data
                console.log('it came here?', state.leaderboard)
            }
           
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error)
            state.
            state.error = error.message
        } finally {
            state.loading = false
        }
    }

    const fetchAgentPerformance = async(agent_id, queryString) => {
        state.loading = true
        state.error = null 

        try {
            let url = new URL(`${API.fetchAgentPerformance}/${agent_id}`)
            if(queryString){
                Object.keys(queryString).forEach(key => {
                    url.searchParams.append(key, queryString[key])
                })
            }

            const response = await fetch(url,{
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
            })
            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`)
            }
            const data = await response.json()
            state.agentPerformance = data
          
        
        }

        catch (error){
            console.error('Failed to fetch Agent Performance Details', error)
            state.error = error.message
            // state.agentYearPerformance = []
            // state.agentPerformance = []
            // state.leaderboard = []
        }
        finally {
            state.loading = false
        }
    }

    // Expose individual state properties and actions
    return {
        state,  
        fetchLeaderboard,
    }
})
