<template>
  <div>
    <div class="p-4 mt-20">
      <div v-if="store.state.loading">
        <spinner></spinner>
      </div>

      <div v-else>
        <!-- Toggle Button for Card/Table View -->
        <div class="mb-4 flex justify-end">
          <button
            @click="isCardView = !isCardView"
            class="bg-blue-600 text-white py-1 px-2 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            <font-awesome-icon :icon="['fas', isCardView ? 'toggle-off' : 'toggle-on']" />
            Toggle to {{ isCardView ? 'Table' : 'Card' }} View
          </button>
        </div>

        <div class="text-red-700 font-bold text-5xl" v-if="store.state.error">{{ store.state.error }}</div>
        <div v-else-if="!team" class="text-red-700 font-bold text-5xl">
          No Available Data.
        </div>
        <div v-else>
          <!-- CARD VIEW -->
          <div v-if="isCardView" class="grid grid-cols-1 gap-6">
            <EvaluationTeamCard :team="team" @details="showDetails"></EvaluationTeamCard>
          </div>

          <!-- TABLE VIEW: the team and its members -->
          <div v-else class="overflow-x-auto shadow-xl rounded-lg">
            <h1 class="text-2xl font-extrabold text-gray-800 mb-3 text-center">{{ team.month }} {{ team.year }} Team Monthly Performance</h1>
            <table class="min-w-full border-collapse border border-gray-300 mb-16">
              <thead>
                <tr class="bg-green-500 text-white">
                  <th class="border border-gray-300 px-1 py-1 text-center text-lg font-bold">Year</th>
                  <th class="border border-gray-300 px-1 py-1 text-center text-lg font-bold">Month</th>
                  <th class="border border-gray-300 px-1 py-1 text-center text-lg font-bold">Team</th>
                  <th class="border border-gray-300 px-1 py-1 text-center text-lg font-bold">Team Leader</th>
                  <th class="border border-gray-300 px-1 py-1 text-center text-lg font-bold">Members</th>
                  <th class="border border-gray-300 px-1 py-1 text-center text-lg font-bold">Team Ratings</th>
                  <th class="border border-gray-300 px-1 py-1 text-center text-lg font-bold">Rating Equivalent</th>
                </tr>
              </thead>
              <tbody>
                <tr class="odd:bg-green-50 even:bg-white">
                  <td class="border border-gray-300 px-2 py-1 text-lg text-center">{{ team.year }}</td>
                  <td class="border border-gray-300 px-2 py-1 text-lg text-center">{{ team.month }}</td>
                  <td class="border border-gray-300 px-2 py-1 text-lg text-center">{{ team.team_name }} <span v-if="team.tag">- (<span class="font-bold text-purple-500">{{ team.tag }}</span>)</span></td>
                  <td class="border border-gray-300 px-2 py-1 text-lg text-center">{{ team.team_leader_name }}</td>
                  <td class="border border-gray-300 px-2 py-1 text-lg text-center">{{ team.members_count }}</td>
                  <td class="border border-gray-300 px-2 py-1 text-lg text-center font-bold">{{ team.final_ratings }}</td>
                  <td class="border border-gray-300 px-2 py-1 text-lg text-center font-bold" :class="csdRatingClass(team.ratings_name) || setRatingNameColor(team)">{{ team.ratings_name }}</td>
                </tr>
              </tbody>
            </table>

            <h1 class="text-2xl font-extrabold text-gray-800 mb-3 text-center">Team Members Monthly Performance</h1>
            <leader-board-table :agents="team.teams"></leader-board-table>
          </div>
        </div>
      </div>
    </div>

    <EvaluationTeamDetailsModal :show="showModal" :team="selectedTeam" @close="showModal = false"></EvaluationTeamDetailsModal>
  </div>
</template>

<script setup>
// CSD Team Monthly (one team, one month): the card / table view and the details of the team.
// The team comes from ?team_id (the list links to it); a team leader (level 8 / 7) has only his/her own team.
// The backend answers only with the team and the members the user may see.
import { ref, reactive, computed, onMounted, watch } from 'vue'
import LeaderBoardTable from '~/components/evaluation/LeaderBoardTable.vue'

definePageMeta({
  middleware: ['auth', 'department-layout'],
  layout: 'csd',
  // Collection uses this page too (the layout and the staff follow the url)
  alias: ['/collection/team_performance/month', '/purchasing/team_performance/month', '/hr/team_performance/month'],
})

const authStore = useAuthStore()
authStore.fetchTokenFromLocalStore()
const currentUser = authStore.state.user

const isAdminUser = ['admin', 'poweruser'].includes(currentUser?.role)
const route = useRoute()
// csd or collection (from the url): the backend answers with the staff of that department
const { code: departmentCode, base } = useDepartmentView()
const store = useEvaluationTeamPerformanceStore()
const { setRatingNameColor } = useRatingColor()

const isCardView = ref(true)

const today = new Date()
const currentYearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
const yearMonth = computed(() => route.query.year_month || currentYearMonth)

// no team chosen (a team leader): the backend answers with his/her own team ('me'), the team of the login token is not reliable
const teamId = computed(() => route.query.team_id || (isAdminUser ? '' : 'me'))

const team = computed(() => store.state.monthly[0] ?? null)

const selectedTeam = reactive({})
const showModal = ref(false)
const showDetails = (row) => {
  Object.assign(selectedTeam, row)
  showModal.value = true
}

const load = () => {
  // no team chosen (admin without ?team_id): nothing to show
  if (!teamId.value) { store.state.monthly = []; return }
  store.fetchTeams('monthly', teamId.value, { year_month: yearMonth.value, department: departmentCode.value })
}

onMounted(load)
watch(() => [route.query.year_month, route.query.team_id], load)
</script>
