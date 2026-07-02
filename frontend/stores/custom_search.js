import { defineStore } from 'pinia'
import { reactive } from 'vue'
import API from '~/utils/api'
import { useAuthStore } from '~/stores/auth' // make sure this is imported

export const useCustomSearchStore = defineStore('custom_search', () => {
  // Fetch token from auth store
  const authStore = useAuthStore()
  authStore.fetchTokenFromLocalStore()
  const token = authStore.state.token

  // Reactive state definition
  const state = reactive({
    customSearch: {},
    loading: false,
    error: null,
    filterValueList: [], // 👈 new
    itemsPerPage: 10,    // 👈 new (default)
  })

  // 👇 Action to fetch search results
  const fetchCustomSearch = async (searchType, queryString = null) => {
    state.loading = true
    state.error = null

    try {
      // Build the URL
      let url = new URL(`${API.custom_search}/${searchType}`)
      if (queryString) {
        Object.keys(queryString).forEach((key) =>
          url.searchParams.append(key, queryString[key])
        )
      }

      // Fetch data
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      // Handle invalid token
      if (!response.ok && response.status == 403) {
        const errors = await response.json()
        if (errors.message == 'Invalid Access Token') {
          localStorage.removeItem('jwt')
          alert('Your session has expired. Please log in again.')
          location.reload()
        }
      }

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      state.customSearch.splice(0, state.customSearch.length, ...data)

    } catch (error) {
      console.error('Failed to fetch custom search:', error)
      state.error = error.message
    } finally {
      state.loading = false
    }
  }

  // 👇 Action to set filter list and auto-adjust itemsPerPage
  const setFilterValueList = (list) => {
    state.filterValueList = list
   
    // if(list.length <= 1){
    //     state.itemsPerPage  =  8
    // }else{
    //      state.itemsPerPage  =  list.length
    // }   
   
    state.itemsPerPage  =  list.length
  
  }

  return {
    state,
    fetchCustomSearch,
    setFilterValueList,
  }
})
