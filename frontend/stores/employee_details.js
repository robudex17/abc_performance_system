import { defineStore } from 'pinia'
import { reactive } from 'vue'

import API from '~/utils/api'

// State of the details page of a none-sales employee (/admin/employee/:employee_id/details):
// bio (employment + assignment history), absences, tardiness, memo and the feedback summary.
// The actions throw an Error with the message of the server, the page shows it.
export const useEmployeeDetailsStore = defineStore('employee_details', () => {
    const authStore = useAuthStore()

    const state = reactive({
        bio: [],
        absences: [],
        tardiness: [],
        memo: [],
        // GET /feedback_by_nonesales_summary: one row per month + the lists of the modals
        feedback: { year_month: '', month: '', year: new Date().getFullYear(), months: [], from_members: [], from_head: [], qa: [], admin: [] },
        loading: false,
    })

    // one place for the headers, the expired token handling and the server error message
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
            throw new Error(data?.error || data?.message || `Error: ${response.status} ${response.statusText}`)
        }

        return data
    }

    const fetchBio = async (employeeId, departmentCode) => {
        state.loading = true
        try {
            state.bio = await request(`${API.employees}/${departmentCode}/${employeeId}`)
        } finally {
            state.loading = false
        }
    }

    // type: absences | tardiness | memo
    const fetchAttendance = async (type, employeeId, yearMonth) => {
        state[type] = await request(`${API.employeeAttendance}/${type}/${employeeId}?year_month=${yearMonth}`)
    }

    // form: { year_month, count, description }
    const addAttendance = async (type, employeeId, form) => {
        const data = await request(`${API.employeeAttendance}/${type}/${employeeId}`, 'POST', form)
        return data.message
    }

    const updateAttendance = async (type, employeeId, form) => {
        const data = await request(`${API.employeeAttendance}/${type}/${employeeId}`, 'PUT', form)
        return data.message
    }

    const deleteAttendance = async (type, employeeId, yearMonth) => {
        const data = await request(`${API.employeeAttendance}/${type}/${employeeId}?year_month=${yearMonth}`, 'DELETE')
        return data.message
    }

    const fetchFeedbackSummary = async (employeeId, yearMonth) => {
        state.feedback = await request(`${API.noneSalesFeedbackSummary}/${employeeId}?year_month=${yearMonth}`)
    }

    // data: { who_give_feedback_id, who_receive_feedback_id, year_month, feedback_type, can_update }
    const enableDisableFeedbackUpdate = async (data) => {
        const result = await request(API.enableDisableUpdateAndDeleteNoneSalesFeedback, 'PUT', data)
        return result.message
    }

    const deleteFeedback = async (data) => {
        const result = await request(API.enableDisableUpdateAndDeleteNoneSalesFeedback, 'DELETE', data)
        return result.message
    }

    return {
        state,
        fetchBio,
        fetchAttendance,
        addAttendance,
        updateAttendance,
        deleteAttendance,
        fetchFeedbackSummary,
        enableDisableFeedbackUpdate,
        deleteFeedback,
    }
})
