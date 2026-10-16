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
        <div v-else-if="!team || team.months_counted === 0" class="text-red-700 font-bold text-5xl">
          No Available Data.
        </div>
        <div v-else>
          <!-- CARD VIEW -->
          <div v-if="isCardView" class="grid grid-cols-1 gap-6">
            <CsdTeamCard :team="team" @details="showDetails"></CsdTeamCard>
          </div>

          <!-- TABLE VIEW: the team by month and its members -->
          <div v-else class="overflow-x-auto shadow-xl rounded-lg">
            <h1 class="text-2xl font-extrabold text-gray-800 mb-1 text-center">
              {{ team.team_name }} - {{ team.year }} Team Yearly Performance:
              <span :class="csdRatingClass(team.ratings_name) || setRatingNameColor(team)">{{ team.final_ratings }}</span> /
              <span :class="csdRatingClass(team.ratings_name) || setRatingNameColor(team)">{{ team.ratings_name }}</span>
            </h1>
            <p class="text-center text-sm text-gray-500 mb-3">Only the submitted months are counted.</p>

            <table class="min-w-full border-collapse border border-gray-300 mb-16">
              <thead>
                <tr class="bg-green-500 text-white">
                  <th class="border border-gray-300 px-1 py-1 text-center text-lg font-bold">Year</th>
                  <th class="border border-gray-300 px-1 py-1 text-center text-lg font-bold">Month</th>
                  <th class="border border-gray-300 px-1 py-1 text-center text-lg font-bold">Members Submitted</th>
                  <th class="border border-gray-300 px-1 py-1 text-center text-lg font-bold">Team Ratings</th>
                  <th class="border border-gray-300 px-1 py-1 text-center text-lg font-bold">Rating Equivalent</th>
                </tr>
              </thead>
              <tbody>
                <tr class="odd:bg-green-50 even:bg-white" v-for="month in team.months" :key="month.year_month">
                  <td class="border border-gray-300 px-2 py-1 text-lg text-center">{{ month.year }}</td>
                  <td class="border border-gray-300 px-2 py-1 text-lg text-center">{{ month.month }}</td>
                  <td class="border border-gray-300 px-2 py-1 text-lg text-center">{{ month.members_submitted }} / {{ month.members_total }}</td>
                  <td class="border border-gray-300 px-2 py-1 text-lg text-center font-bold">{{ month.final_ratings }}</td>
                  <td class="border border-gray-300 px-2 py-1 text-lg text-center font-bold" :class="csdRatingClass(month.ratings_name) || setRatingNameColor(month)">{{ month.ratings_name }}</td>
                </tr>
              </tbody>
            </table>

            <h1 class="text-2xl font-extrabold text-gray-800 mb-3 text-center">Team Members Yearly Performance (average of the submitted months)</h1>
            <leader-board-table-view-csd :agents="team.teams"></leader-board-table-view-csd>
          </div>
        </div>
      </div>
    </div>

    <CsdTeamDetailsModal :show="showModal" :team="selectedTeam" @close="showModal = false"></CsdTeamDetailsModal>
  </div>
</template>

<script setup>
// CSD Team Yearly (one team, one year): the average of the SUBMITTED months, like the sales team yearly page.
// The team comes from ?team_id (the list links to it); a team leader (level 8 / 7) has only his/her own team.
import { ref, reactive, computed, onMounted, watch } from 'vue'
import LeaderBoardTableViewCsd from '~/components/csd/LeaderBoardTableViewCsd.vue'

definePageMeta({
  middleware: ['auth', 'department-layout'],
  layout: 'csd',
  // Collection uses this page too (the layout and the staff follow the url)
  alias: ['/collection/team_performance/year'],
})

const authStore = useAuthStore()
authStore.fetchTokenFromLocalStore()
const currentUser = authStore.state.user

const isAdminUser = ['admin', 'poweruser'].includes(currentUser?.role)
const route = useRoute()
// csd or collection (from the url): the backend answers with the staff of that department
const { code: departmentCode, base } = useDepartmentView()
const store = useCsdTeamPerformanceStore()
const { setRatingNameColor } = useRatingColor()

const isCardView = ref(true)

const year = computed(() => route.query.year || String(new Date().getFullYear()))
// no team chosen (a team leader): the backend answers with his/her own team ('me'), the team of the login token is not reliable
const teamId = computed(() => route.query.team_id || (isAdminUser ? '' : 'me'))

const team = computed(() => store.state.yearTeam)

const selectedTeam = reactive({})
const showModal = ref(false)
const showDetails = (row) => {
  Object.assign(selectedTeam, row)
  showModal.value = true
}

const load = () => {
  // no team chosen (admin without ?team_id): nothing to show
  if (!teamId.value) { store.state.yearTeam = null; return }
  store.fetchTeams('yearly', teamId.value, { year: year.value, department: departmentCode.value })
}

onMounted(load)
watch(() => [route.query.year, route.query.team_id], load)
</script>
