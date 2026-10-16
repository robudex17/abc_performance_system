import { defineStore } from 'pinia'
import { reactive } from 'vue'

import API from '~/utils/api'

// Leadership Individual Performance (backend: csd_leadership_controller.js)
//   tasks / scores   the form: TASK | KEY PERFORMANCE INDICATORS | SCORE (drop down) | COMMENTS
//   employees        the leaders the logged in user evaluates, with his/her result of the month
//   evaluation       the evaluation of one leader (null = not evaluated yet)
export const useLeadershipStore = defineStore('leadershipStore', () => {
    const authStore = useAuthStore()
    authStore.fetchTokenFromLocalStore()
    const token = authStore.state.token

    const state = reactive({
        tasks: [],
        scores: [],
        employees: [],
        evaluation: null,
        loading: false,
        error: null,
    })

    const request = async (path, { method = 'GET', body, query } = {}) => {
        const url = new URL(`${API.leadership_evaluations}${path}`)
        Object.entries(query || {}).forEach(([key, value]) => value && url.searchParams.append(key, value))

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: body ? JSON.stringify(body) : undefined,
        })

        const result = await response.json().catch(() => ({}))

        if (!response.ok && response.status == 403 && result.message == 'Invalid Access Token') {
            localStorage.removeItem('jwt')
            alert('Your Session has been expired, Please Login again.')
            location.reload()
        }
        if (!response.ok) throw new Error(result.message || result.error || `Error: ${response.status} ${response.statusText}`)

        return result
    }

    const run = async (work) => {
        state.loading = true
        state.error = null
        try {
            return await work()
        } catch (error) {
            console.error('Leadership evaluation:', error)
            state.error = error.message
            return undefined
        } finally {
            state.loading = false
        }
    }

    // the form of the position level of the employee
    const fetchTasks = (employeeId, yearMonth) => run(async () => {
        const result = await request(`/tasks?employee_id=${employeeId}&year_month=${yearMonth}`)
        state.tasks = result.tasks
        state.scores = result.scores
    })

    const fetchEmployees = (yearMonth) => run(async () => {
        state.employees = await request('', { query: { year_month: yearMonth } })
    })

    const fetchEvaluation = (employeeId, yearMonth) => run(async () => {
        state.evaluation = await request(`/${employeeId}`, { query: { year_month: yearMonth } })
    })

    // returns true when it worked, the message of the backend is in state.error when it did not
    const saveEvaluation = async (employeeId, yearMonth, responses, method) => {
        const result = await run(() => request(`/${employeeId}`, { method, body: { responses }, query: { year_month: yearMonth } }))
        return result !== undefined
    }

    const deleteEvaluation = async (employeeId, yearMonth) => {
        const result = await run(() => request(`/${employeeId}`, { method: 'DELETE', query: { year_month: yearMonth } }))
        return result !== undefined
    }

    return { state, fetchTasks, fetchEmployees, fetchEvaluation, saveEvaluation, deleteEvaluation }
})
