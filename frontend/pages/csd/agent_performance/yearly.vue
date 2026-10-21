<template>
  <div class="mt-20 p-4">
    <div v-if="store.state.loading">
      <spinner></spinner>
    </div>

    <template v-else>
      <h1 class="text-2xl font-extrabold text-gray-800 mb-2 text-center">{{ departmentLabel }} Agents Yearly Performance Information</h1>
      <p class="text-center text-sm text-gray-500 mb-3">Only the submitted months are counted.</p>

      <div v-if="agents.length === 0" class="text-red-700 font-bold text-5xl">
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
              <th class="py-2 px-1 border text-center text-xs font-bold">Year</th>
              <th class="py-2 px-1 border text-center text-xs font-bold">Months Submitted</th>
              <th class="py-2 px-1 border text-center text-xs font-bold">Performance(%)</th>
              <th class="py-2 px-1 border text-center text-xs font-bold">Rating</th>
              <th class="py-2 px-1 border text-center text-xs font-bold">Rating Name</th>
              <th class="py-2 px-1 border text-center text-xs font-bold">Image</th>
              <th class="py-2 px-1 border text-center text-xs font-bold whitespace-nowrap min-w-[120px]">
                <div class="flex items-center justify-center gap-2">
                  <span>Details</span>
                  <div class="flex-shrink-0">
                    <export-to-excel-component
                      v-if="isAdmin"
                      :exportUrl="exportUrl"
                      :exportFileName="exportFileName"
                      :query="{ year, department: departmentCode }"
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
              <td class="py-1 px-2 border text-center text-xs text-gray-700">{{ agent.year }}</td>
              <td class="py-1 px-2 border text-center text-xs text-gray-700">{{ agent.months_submitted }}</td>
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
                <div v-if="agent.months_submitted === 0" class="flex justify-center space-x-2 text-red-500 font-bold">NO Yearly Performance Details</div>
                <div v-else class="flex justify-center">
                  <NuxtLink
                    :to="{ path: base + '/agent_performance/year', query: { employee_id: agent.id, year: agent.year } }"
                    class="px-2 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600"
                  >
                    Yearly Performance Details
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
// CSD Agent Yearly (list): the average of the submitted months of everybody the user may see (the backend decides who:
// agent_performance_controller.js). The details of one employee: year.vue
import { ref, computed, onMounted, watch } from 'vue'
import API from '~/utils/api'
import { setRatingColor, setRatingNameColor } from '@/utils/constants'

definePageMeta({
  middleware: ['auth', 'department-layout'],
  layout: 'csd',
  // Collection uses this page too (the layout and the staff follow the url)
  alias: ['/collection/agent_performance/yearly', '/purchasing/agent_performance/yearly', '/hr/agent_performance/yearly'],
})

const authStore = useAuthStore()
authStore.fetchTokenFromLocalStore()
const currentUser = authStore.state.user
const token = authStore.state.token

const route = useRoute()
// csd or collection (from the url): the backend answers with the staff of that department
const { code: departmentCode, base, label: departmentLabel } = useDepartmentView()
const config = useRuntimeConfig()
const store = useEvaluationAgentPerformanceStore()

const isAdmin = ['admin', 'poweruser'].includes(currentUser?.role)

const year = computed(() => route.query.year || String(new Date().getFullYear()))

const agents = computed(() => store.state.yearly)

const exportUrl = `${API.evaluation_agent_performance_export}/yearly`
const exportFileName = computed(() => `${departmentCode.value}-agents-yearly-performance-${year.value}.xlsx`)

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
  store.fetchPerformance('yearly', null, { year: year.value, department: departmentCode.value })
}

onMounted(load)
watch(() => route.query.year, load)
</script>
