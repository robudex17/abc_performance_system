import { defineStore } from 'pinia'
import { reactive } from 'vue'

import API from '~/utils/api'

// QA feedback of the CSD staff (/csd_qa_feedback): the Quality Analyst gives one score per employee and month.
// The actions throw an Error with the message of the server, the page shows it.
export const useEvaluationQaFeedbackStore = defineStore('evaluationQaFeedbackStore', () => {
    const authStore = useAuthStore()

    const state = reactive({
        staff: [],       // CSD staff of position level 8 and below, with the QA feedback of the month
        loading: false,
    })

    const request = async (url, method = 'GET', body) => {
        authStore.fetchTokenFromLocalStore()

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.state.token}`,
            },
            body: body ? JSON.stringify(body) : undefined,
        })

        const data = await response.json().catch(() => null)

        //token is invalid remove it from the local storage
        if (!response.ok && response.status == 403 && data?.message == 'Invalid Access Token') {
            localStorage.removeItem('jwt')
            alert('Your Session has been expired, Please Login again.')
            location.reload()
        }

        if (!response.ok) {
            throw new Error(data?.message || data?.error || `Error: ${response.status} ${response.statusText}`)
        }

        return data
    }

    const fetchStaff = async (yearMonth) => {
        state.loading = true
        try {
            state.staff = await request(`${API.csd_qa_feedback}?year_month=${yearMonth}`)
        } finally {
            state.loading = false
        }
    }

    // httpMethod: POST (add) or PUT (edit)
    const saveFeedback = async (httpMethod, employeeId, yearMonth, feedbackScore) => {
        const data = await request(`${API.csd_qa_feedback}/${employeeId}?year_month=${yearMonth}`, httpMethod, { feedback_score: feedbackScore })
        return data.message
    }

    const deleteFeedback = async (employeeId, yearMonth) => {
        const data = await request(`${API.csd_qa_feedback}/${employeeId}?year_month=${yearMonth}`, 'DELETE')
        return data.message
    }

    return { state, fetchStaff, saveFeedback, deleteFeedback }
})
