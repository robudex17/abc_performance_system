import { defineStore } from 'pinia'
import { reactive } from 'vue'

import API from '~/utils/api'

// Custom Range (backend: custom_range_controller.js): the average of the SUBMITTED months between a start and an end month
//   list     the employees of the range (the average of their submitted months)
//   detail   one employee: { agentMetricsInRange: [the submitted months], rangeAverage, months_left_out }
export const useEvaluationCustomRangeStore = defineStore('evaluationCustomRangeStore', () => {
    const authStore = useAuthStore()
    authStore.fetchTokenFromLocalStore()
    const token = authStore.state.token

    const emptyDetail = () => ({ agentMetricsInRange: [], rangeAverage: null, months_left_out: [] })

    const state = reactive({
        list: [],
        detail: emptyDetail(),
        loading: false,
        error: null,
    })

    // queryString: { start_date, end_date, employee_status, department }; employeeId: one employee
    const fetchRange = async (employeeId, queryString) => {
        state.loading = true
        state.error = null

        try {
            const url = new URL(`${API.evaluation_custom_range}${employeeId ? `/${employeeId}` : ''}`)
            for (const key of ['start_date', 'end_date', 'employee_status', 'department']) {
                if (queryString?.[key]) url.searchParams.append(key, queryString[key])
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            })

            const body = await response.json().catch(() => null)

            if (!response.ok && response.status == 403 && body?.message == 'Invalid Access Token') {
                localStorage.removeItem('jwt')
                alert('Your Session has been expired, Please Login again.')
                location.reload()
            }
            // the backend answers with a message (a wrong range, a department that the user may not use ...)
            if (!response.ok) throw new Error(body?.message || `Error: ${response.status} ${response.statusText}`)

            if (employeeId) state.detail = body ?? emptyDetail()
            else state.list = body

        } catch (error) {
            console.error('Failed to fetch the custom range:', error)
            state.error = error.message
            if (employeeId) state.detail = emptyDetail()
            else state.list = []
        } finally {
            state.loading = false
        }
    }

    return { state, fetchRange }
})
