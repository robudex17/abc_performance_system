<template>
  <div class="mt-20 p-4">
    <div v-if="store.state.loading">
      <spinner></spinner>
    </div>

    <template v-else>
      <h1 class="text-2xl font-extrabold text-gray-800 mb-2 text-center">{{ departmentLabel }} Agents Custom Range Performance</h1>
      <p class="text-center text-sm text-gray-500 mb-3">
        Only the submitted months are counted.
        <span v-if="hasRange" class="font-semibold">Range: {{ monthLabel(startDate) }} to {{ monthLabel(endDate) }}</span>
      </p>

      <div v-if="!hasRange" class="text-center text-xl font-bold text-gray-600">
        Select the start month and the end month at the top, then press Submit.
      </div>
      <div v-else-if="store.state.error" class="text-center text-red-700 font-bold text-2xl">{{ store.state.error }}</div>
      <div v-else-if="agents.length === 0" class="text-red-700 font-bold text-5xl">
        No Available Data.
      </div>

      <!-- Agents Table -->
      <div v-else class="overflow-x-auto shadow-xl rounded-lg">
        <table class="w-full table-auto border-collapse bg-white">
          <thead>
            <tr class="bg-gradient-to-r from-blue-200 to-blue-300 text-gray-800">
              <th class="py-2 px-1 border text-center text-xs font-bold">ID</th>
              <th class="py-2 px-1 border text-center text-xs font-bold">Name</th>
              <th class="py-2 px-1 border text-center text-xs font-bold">Employee Status</th>
              <th class="py-2 px-1 border text-center text-xs font-bold">Position</th>
              <th class="py-2 px-1 border text-center text-xs font-bold">Team</th>
              <th class="py-2 px-1 border text-center text-xs font-bold">Months Counted</th>
              <th class="py-2 px-1 border text-center text-xs font-bold">Performance(%)</th>
              <th class="py-2 px-1 border text-center text-xs font-bold">Rating</th>
              <th class="py-2 px-1 border text-center text-xs font-bold">Rating Name</th>
              <th class="py-2 px-1 border text-center text-xs font-bold">Image</th>
              <th class="py-2 px-1 border text-center text-xs font-bold whitespace-nowrap min-w-[120px]">
                <div class="flex items-center justify-center gap-2">
                  <span>Details</span>
                  <div class="flex-shrink-0">
                    <export-to-excel-component
                      v-if="isAllowed"
                      :exportUrl="exportUrl"
                      :exportFileName="exportFileName"
                      :query="exportQuery"
                      :token="token"
                      :submitted="1"
                      :submittedArray="false"
                      :incomplete="false"
                      class="!text-white !text-[10px] !px-2 !py-1 !rounded !hover:bg-green-600 !transition-all !duration-200"
                    ></export-to-excel-component>
                  </div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="agent in paginatedAgents" :key="agent.id" class="even:bg-blue-50 odd:bg-white">
              <td class="py-1 px-2 border text-center text-xs text-gray-700">{{ agent.id }}</td>
              <td class="py-1 px-2 border text-center text-xs text-gray-700">{{ agent.db_name }}</td>
              <td class="py-1 px-2 border text-center text-xs"
                :class="agent.employee_status == 'Resigned' ? 'text-red-600 font-bold' : 'text-green-600 font-bold'"
              >{{ agent.employee_status }}</td>
              <td class="py-1 px-2 border text-center text-xs text-gray-700">{{ agent.position_name }}</td>
              <td class="py-1 px-2 border text-center text-xs text-gray-700">{{ agent.team_name }}</td>
              <!-- the months in the average of the months of the range: 4 / 6 means 2 months were not submitted -->
              <td class="py-1 px-2 border text-center text-xs font-bold"
                :class="agent.months_submitted < agent.months_in_range ? 'text-yellow-600' : 'text-gray-700'"
                :title="'Months in the average: ' + (agent.submitted_months || []).join(', ')"
              >{{ agent.months_submitted }} / {{ agent.months_in_range }}</td>
              <td class="py-1 px-2 border text-center text-xs text-gray-700 font-bold">{{ agent.performance }}</td>
              <td class="py-1 px-2 border text-center text-xs font-bold" :class="setRatingColor(agent)">{{ agent.final_ratings }}</td>
              <td class="py-1 px-2 border text-center text-xs font-bold" :class="csdRatingClass(agent.ratings_name) || setRatingNameColor(agent)">{{ agent.ratings_name }}</td>
              <td class="py-1 px-1 border text-center text-xs">
                <img
                  v-if="agent.image_link"
                  :src="updateImageLink(agent.image_link)"
                  alt="Agent Image"
                  class="h-10 w-10 rounded-full mx-auto border border-blue-200"
                />
              </td>
              <td class="py-1 px-1 border text-center text-xs">
                <div class="flex justify-center">
                  <NuxtLink
                    :to="{ path: base + '/agent_performance/custom_range_details', query: { employee_id: agent.id, start_date: startDate, end_date: endDate } }"
                    class="px-2 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600"
                  >
                    Range Performance Details
                  </NuxtLink>
                </div>
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
// Custom Range (list): the average of the SUBMITTED months between a start and an end month that the user chooses (the top bar sends
// ?start_date=YYYY-MM&end_date=YYYY-MM&employee_status=all|hired|resigned). Like the Agent Yearly page: the months that are not submitted are not
// counted. The pattern of the sales custom search: the bar changes the url, this page watches the url. Admin, poweruser and the GOM (the backend
// checks it too). The details of one employee: custom_range_details.vue
import { ref, computed, onMounted, watch } from 'vue'
import API from '~/utils/api'
import { setRatingColor, setRatingNameColor } from '@/utils/constants'
import { monthLabel } from '~/utils/month_range'

definePageMeta({
  middleware: ['auth', 'department-layout'],
  layout: 'csd',
  // the other departments use this page too (the layout and the staff follow the url)
  alias: ['/collection/agent_performance/custom_range', '/purchasing/agent_performance/custom_range', '/hr/agent_performance/custom_range'],
})

const authStore = useAuthStore()
authStore.fetchTokenFromLocalStore()
const currentUser = authStore.state.user
const token = authStore.state.token

const route = useRoute()
const { code: departmentCode, base, label: departmentLabel } = useDepartmentView()
const config = useRuntimeConfig()
const store = useEvaluationCustomRangeStore()

// admin and poweruser, and the GOM (position level 15)
const isAllowed = ['admin', 'poweruser'].includes(currentUser?.role) || Number(currentUser?.position_level) === 15

const startDate = computed(() => route.query.start_date || '')
const endDate = computed(() => route.query.end_date || '')
const employeeStatus = computed(() => route.query.employee_status || 'all')
const hasRange = computed(() => Boolean(startDate.value && endDate.value))

const agents = computed(() => store.state.list)

const exportUrl = API.evaluation_custom_range_export
const exportQuery = computed(() => ({ start_date: startDate.value, end_date: endDate.value, employee_status: employeeStatus.value, department: departmentCode.value }))
const exportFileName = computed(() => `${departmentCode.value}-agents-custom-range-${startDate.value}-${endDate.value}.xlsx`)

const itemsPerPage = 10
const currentPage = ref(1)
const totalPages = computed(() => Math.ceil(agents.value.length / itemsPerPage))
const paginatedAgents = computed(() => agents.value.slice((currentPage.value - 1) * itemsPerPage, currentPage.value * itemsPerPage))

const updateImageLink = (imageLink) => {
  if (!imageLink) return ''
  if (imageLink.startsWith('data:image') || /^https?:\/\//.test(imageLink)) return imageLink
  return `${config.public.imageBaseUrl}${imageLink.split('/').pop()}`
}

const load = () => {
  currentPage.value = 1
  // nothing is asked before the user chooses the range
  if (!hasRange.value) {
    store.state.list = []
    store.state.error = null
    return
  }
  store.fetchRange(null, { start_date: startDate.value, end_date: endDate.value, employee_status: employeeStatus.value, department: departmentCode.value })
}

onMounted(load)
watch(() => [route.query.start_date, route.query.end_date, route.query.employee_status], load)
</script>
