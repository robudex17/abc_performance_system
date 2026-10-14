import { defineStore } from 'pinia'
import { reactive } from 'vue'

import API from '~/utils/api'

// Agent Monthly / Agent Yearly performance of the CSD staff (backend: csd_agent_performance_controller.js)
//   monthly      the employees of the month (a list, or one employee when employee_id is given)
//   yearly       the employees of the year (average of the submitted months)
//   yearDetail   one employee: { agentMetricsFullYear: [the submitted months], yearAverage }
export const useCsdAgentPerformanceStore = defineStore('csdAgentPerformanceStore', () => {
    const authStore = useAuthStore()
    authStore.fetchTokenFromLocalStore()
    const token = authStore.state.token

    const state = reactive({
        monthly: [],
        yearly: [],
        yearDetail: { agentMetricsFullYear: [], yearAverage: null },
        loading: false,
        error: null,
    })

    // period: 'monthly' | 'yearly'; queryString: { year_month } or { year }
    const fetchPerformance = async (period, employeeId, queryString) => {
        state.loading = true
        state.error = null

        try {
            const url = new URL(`${API.csd_agent_performance}/${period}${employeeId ? `/${employeeId}` : ''}`)
            if (period === 'monthly' && queryString?.year_month) url.searchParams.append('year_month', queryString.year_month)
            if (period === 'yearly' && queryString?.year) url.searchParams.append('year', queryString.year)

            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            })

            if (!response.ok && response.status == 403) {
                const errors = await response.json()
                if (errors.message == 'Invalid Access Token') {
                    localStorage.removeItem('jwt')
                    alert('Your Session has been expired, Please Login again.')
                    location.reload()
                }
            }
            if (!response.ok) throw new Error(`Error: ${response.status} ${response.statusText}`)

            const data = await response.json()

            if (period === 'monthly') state.monthly = data
            else if (employeeId) state.yearDetail = data
            else state.yearly = data

        } catch (error) {
            console.error('Failed to fetch the CSD agent performance:', error)
            state.error = error.message
            if (period === 'monthly') state.monthly = []
            else if (employeeId) state.yearDetail = { agentMetricsFullYear: [], yearAverage: null }
            else state.yearly = []
        } finally {
            state.loading = false
        }
    }

    return { state, fetchPerformance }
})
