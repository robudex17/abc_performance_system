<template>
  <div>
    <div class="p-4 mt-20">
      <div v-if="store.state.loading">
        <spinner></spinner>
      </div>

      <div v-else>
        <!-- Toggle Button for Card/Table View. Admin and poweruser: the table and the Excel -->
        <div class="mb-4 flex justify-end">
          <button
            v-if="!isAdmin"
            @click="isCardView = !isCardView"
            class="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            <font-awesome-icon :icon="['fas', isCardView ? 'toggle-off' : 'toggle-on']" />
            Toggle to {{ isCardView ? 'Table' : 'Card' }} View
          </button>
          <export-to-excel-component
            v-if="isAdmin && agent"
            class="ml-2"
            :exportUrl="exportUrl"
            :exportFileName="exportFileName"
            :query="{ year, department: departmentCode }"
            :token="token"
            :submitted="1"
            :submittedArray="false"
            :incomplete="false"
          ></export-to-excel-component>
        </div>

        <div class="text-red-700 font-bold text-5xl" v-if="store.state.error">{{ store.state.error }}</div>
        <div v-else-if="!agent || months.length === 0" class="text-red-700 font-bold text-5xl">
          No Available Data.
        </div>
        <div v-else>
          <p v-if="agent.hasIncomplete" class="mb-4 text-yellow-600 font-semibold">
            Some months between the submitted months are not submitted yet, they are not counted.
          </p>

          <!-- CARD VIEW -->
          <div v-if="isCardView" class="grid grid-cols-1 gap-6">
            <CsdPerformanceCard :agent="agent" @details="showDetails"></CsdPerformanceCard>
          </div>

          <!-- TABLE VIEW: the submitted months and their summary -->
          <div v-else class="overflow-x-auto shadow-xl rounded-lg">
            <h1 class="text-2xl font-bold mb-4 text-center">
              {{ agent.year }} Year Performance:
              <span :class="csdRatingClass(agent.ratings_name) || setRatingNameColor(agent)">{{ agent.final_ratings }}</span> /
              <span :class="csdRatingClass(agent.ratings_name) || setRatingNameColor(agent)">{{ agent.ratings_name }}</span>
            </h1>
            <leader-board-table-view-csd :agents="months"></leader-board-table-view-csd>
            <csd-metrics-summary :agents="[agent]" :fullyear="true"></csd-metrics-summary>
          </div>
        </div>
      </div>
    </div>

    <CsdPerformanceDetailsModal :show="showModal" :agent="selectedAgent" :fullyear="true" @close="showModal = false"></CsdPerformanceDetailsModal>
  </div>
</template>

<script setup>
// CSD Agent Yearly (one employee, one year): the average of the SUBMITTED months, like the sales yearly page.
// The employee comes from ?employee_id (the list page links to it), the backend answers only if the user may see him/her.
import { ref, reactive, computed, onMounted, watch } from 'vue'
import API from '~/utils/api'
import LeaderBoardTableViewCsd from '~/components/csd/LeaderBoardTableViewCsd.vue'

definePageMeta({
  middleware: ['auth', 'department-layout'],
  layout: 'csd',
  // Collection uses this page too (the layout and the staff follow the url)
  alias: ['/collection/agent_performance/year'],
})

const authStore = useAuthStore()
authStore.fetchTokenFromLocalStore()
const currentUser = authStore.state.user
const token = authStore.state.token

const route = useRoute()
// csd or collection (from the url): the backend answers with the staff of that department
const { code: departmentCode, base } = useDepartmentView()
const store = useCsdAgentPerformanceStore()
const { setRatingNameColor } = useRatingColor()

const isAdmin = ['admin', 'poweruser'].includes(currentUser?.role)
const isCardView = ref(!isAdmin)

const year = computed(() => route.query.year || String(new Date().getFullYear()))
const employeeId = computed(() => route.query.employee_id || currentUser?.login_id)

const agent = computed(() => store.state.yearDetail.yearAverage)
const months = computed(() => store.state.yearDetail.agentMetricsFullYear)

const exportUrl = computed(() => `${API.csd_agent_performance_export}/yearly/${employeeId.value}`)
const exportFileName = computed(() => `${departmentCode.value}-${agent.value?.db_name}-yearly-performance-${year.value}.xlsx`)

const selectedAgent = reactive({})
const showModal = ref(false)
const showDetails = (row) => {
  Object.assign(selectedAgent, row)
  showModal.value = true
}

const load = () => store.fetchPerformance('yearly', employeeId.value, { year: year.value, department: departmentCode.value })

onMounted(load)
watch(() => [route.query.year, route.query.employee_id], load)
</script>
