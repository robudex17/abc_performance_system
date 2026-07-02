import { defineStore }  from 'pinia'

import { reactive } from 'vue'


export const useUserStore = defineStore('user', () => {
    const state = reactive({
        users: [],
        loading : false,
        error: null
    })

    const fetchUsers = async () => {
        state.loading = true 
        state.error = null

        try {
            const response = await fetch(`https://jsonplaceholder.typicode.com/users`)
            const data = await response.json()
            state.users = data
            console.log(state.users)
        }catch(error) {
            state.error = error.message

        }finally {
            state.loading = false
        }
    }

    return {
        state, fetchUsers
    }
})



