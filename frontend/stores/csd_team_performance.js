import { defineStore } from 'pinia'
import { reactive } from 'vue'

import API from '~/utils/api'

// Team Monthly / Team Yearly performance of the CSD teams (backend: csd_team_performance_controller.js)
//   monthly   the teams of the month (a list; with team_id: an array with the team and its members, or empty)
//   yearly    the teams of the year (a list)
//   yearTeam  one team of the year: its months and its members (null when there is none)
export const useCsdTeamPerformanceStore = defineStore('csdTeamPerformanceStore', () => {
    const authStore = useAuthStore()
    authStore.fetchTokenFromLocalStore()
    const token = authStore.state.token

    const state = reactive({
        monthly: [],
        yearly: [],
        yearTeam: null,
        loading: false,
        error: null,
    })

    // period: 'monthly' | 'yearly'; queryString: { year_month } or { year }
    const fetchTeams = async (period, teamId, queryString) => {
        state.loading = true
        state.error = null

        try {
            const url = new URL(`${API.csd_team_performance}/${period}${teamId ? `/${teamId}` : ''}`)
            if (period === 'monthly' && queryString?.year_month) url.searchParams.append('year_month', queryString.year_month)
            if (period === 'yearly' && queryString?.year) url.searchParams.append('year', queryString.year)
            // csd (default) or collection: the teams of that department
            if (queryString?.department) url.searchParams.append('department', queryString.department)

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
                throw new Error(errors.message || 'Access Denied')
            }
            if (!response.ok) throw new Error(`Error: ${response.status} ${response.statusText}`)

            const data = await response.json()

            if (period === 'monthly') state.monthly = data
            else if (teamId) state.yearTeam = data
            else state.yearly = data

        } catch (error) {
            console.error('Failed to fetch the CSD team performance:', error)
            state.error = error.message
            if (period === 'monthly') state.monthly = []
            else if (teamId) state.yearTeam = null
            else state.yearly = []
        } finally {
            state.loading = false
        }
    }

    return { state, fetchTeams }
})
