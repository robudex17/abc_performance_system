import { defineStore }  from 'pinia'

import { reactive } from 'vue'


export const useDataStore = defineStore('datastorag', () => {
 

    const state = reactive({
        team_members_monthly: [],
      
    })

    const setSelectedAgent = (team) => {
        state.team_members_monthly = []
        state.team_members_monthly.push(team)
    }

  
    return {
        state,
        setSelectedAgent,
    }
})



