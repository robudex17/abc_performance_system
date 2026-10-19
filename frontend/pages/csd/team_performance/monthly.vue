<template>
  <div class="mt-20 p-4">
    <div v-if="store.state.loading">
      <spinner></spinner>
    </div>

    <template v-else>
      <h1 class="text-2xl font-extrabold text-gray-800 mb-3 text-center">{{ departmentLabel }} Team Monthly Performance Information</h1>

      <div v-if="store.state.error" class="text-red-700 font-bold text-2xl">{{ store.state.error }}</div>
      <div v-else-if="teams.length === 0" class="text-red-700 font-bold text-2xl">
        No Available Data.
      </div>

      <!-- Teams Table -->
      <div v-else class="overflow-x-auto shadow-xl rounded-lg">
        <table class="w-full table-auto border-collapse bg-white">
          <thead>
            <tr class="bg-gradient-to-r from-blue-200 to-blue-300 text-gray-800">
              <th class="py-2 px-2 border text-center text-xs font-bold">Team Name</th>
              <th class="py-2 px-2 border text-center text-xs font-bold">Team Leader</th>
              <th class="py-2 px-2 border text-center text-xs font-bold">Members</th>
              <th class="py-2 px-2 border text-center text-xs font-bold">Month</th>
              <th class="py-2 px-2 border text-center text-xs font-bold">Year</th>
              <th class="py-2 px-2 border text-center text-xs font-bold">Rating</th>
              <th class="py-2 px-2 border text-center text-xs font-bold">Rating Name</th>
              <th class="py-2 px-2 border text-center text-xs font-bold">Image</th>
              <th class="py-2 px-2 border text-center text-xs font-bold">Details</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="team in paginatedTeams" :key="team.team_id" class="even:bg-blue-50 odd:bg-white">
              <td class="py-1 px-2 border text-center text-xs text-gray-700">
                {{ team.team_name }} <span v-if="team.tag">- (<span class="font-bold text-purple-500">{{ team.tag }}</span>)</span>
              </td>
              <td class="py-1 px-2 border text-center text-xs text-gray-700">{{ team.team_leader_name }}</td>
              <td class="py-1 px-2 border text-center text-xs text-gray-700">{{ team.members_count }}</td>
              <td class="py-1 px-2 border text-center text-xs text-gray-700">{{ team.month }}</td>
              <td class="py-1 px-2 border text-center text-xs text-gray-700">{{ team.year }}</td>
              <td class="py-1 px-2 border text-center text-xs font-bold" :class="setRatingColor(team)">{{ team.final_ratings }}</td>
              <td class="py-1 px-2 border text-center text-xs font-bold" :class="csdRatingClass(team.ratings_name) || setRatingNameColor(team)">{{ team.ratings_name }}</td>
              <td class="py-1 px-2 border text-center text-xs">
                <img
                  v-if="team.team_image"
                  :src="updateImageLink(team.team_image)"
                  alt="Team Image"
                  class="h-10 w-12 rounded-full mx-auto border border-blue-200"
                />
              </td>
              <td class="py-0.5 px-2 border text-center text-xs">
                <div class="flex justify-center space-x-2" v-if="team.isCompleted">
                  <NuxtLink
                    :to="{ path: base + '/team_performance/month', query: { team_id: team.team_id, year_month: team.year_month } }"
                    class="px-2 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600"
                  >
                    Team Monthly Performance Details
                  </NuxtLink>
                </div>
                <span v-else class="text-red-500 font-bold">NO Team Monthly Performance Details</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-4 flex justify-center space-x-4">
        <button
          v-for="page in totalPages"
          :key="page"
          class="px-4 py-2 border rounded"
          :class="{ 'bg-blue-500 text-white': currentPage === page, 'bg-white text-gray-700': currentPage !== page }"
          @click="currentPage = page"
        >
          {{ page }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
// CSD Team Monthly (list): the teams of the month the user may see (the backend decides, see csd_team_performance_controller.js).
// A team that is not complete (a member is not submitted) has no details. The details of one team: month.vue
import { ref, computed, onMounted, watch } from 'vue'
import { setRatingColor, setRatingNameColor } from '@/utils/constants'

definePageMeta({
  middleware: ['auth', 'department-layout'],
  layout: 'csd',
  // Collection uses this page too (the layout and the staff follow the url)
  alias: ['/collection/team_performance/monthly', '/purchasing/team_performance/monthly', '/hr/team_performance/monthly'],
})

const route = useRoute()
// csd or collection (from the url): the backend answers with the staff of that department
const { code: departmentCode, base, label: departmentLabel } = useDepartmentView()
const config = useRuntimeConfig()
const store = useCsdTeamPerformanceStore()

const today = new Date()
const currentYearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
const yearMonth = computed(() => route.query.year_month || currentYearMonth)

const teams = computed(() => store.state.monthly)

const itemsPerPage = 10
const currentPage = ref(1)
const totalPages = computed(() => Math.ceil(teams.value.length / itemsPerPage))
const paginatedTeams = computed(() => teams.value.slice((currentPage.value - 1) * itemsPerPage, currentPage.value * itemsPerPage))

const updateImageLink = (imageLink) => {
  if (!imageLink) return ''
  if (imageLink.startsWith('data:image') || /^https?:\/\//.test(imageLink)) return imageLink
  return `${config.public.imageBaseUrl}${imageLink.split('/').pop()}`
}

const load = () => {
  currentPage.value = 1
  store.fetchTeams('monthly', null, { year_month: yearMonth.value, department: departmentCode.value })
}

onMounted(load)
watch(() => route.query.year_month, load)
</script>
