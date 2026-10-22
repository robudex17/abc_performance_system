<template>
  <div>
    <div class="p-4 mt-20">
      <div v-if="store.state.loading">
        <spinner></spinner>
      </div>

      <div v-else>
        <div class="mb-4 flex justify-end">
          <export-to-excel-component
            v-if="isAllowed && agent"
            class="ml-2"
            :exportUrl="exportUrl"
            :exportFileName="exportFileName"
            :query="{ start_date: startDate, end_date: endDate, department: departmentCode }"
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
          <!-- the months of the range that are not in the average -->
          <p v-if="leftOut.length > 0" class="mb-4 text-yellow-600 font-semibold">
            Not counted (not submitted, or not in the evaluation): {{ leftOut.map(monthLabel).join(', ') }}.
          </p>

          <div class="overflow-x-auto shadow-xl rounded-lg">
            <h1 class="text-2xl font-bold mb-1 text-center">
              {{ monthLabel(agent.start_date) }} to {{ monthLabel(agent.end_date) }} Performance:
              <span :class="csdRatingClass(agent.ratings_name) || setRatingNameColor(agent)">{{ agent.final_ratings }}</span> /
              <span :class="csdRatingClass(agent.ratings_name) || setRatingNameColor(agent)">{{ agent.ratings_name }}</span>
            </h1>
            <p class="text-center text-sm text-gray-500 mb-4">{{ agent.months_submitted }} of {{ agent.months_in_range }} months counted</p>
            <leader-board-table :agents="months"></leader-board-table>
            <evaluation-metrics-summary :agents="[agent]" :fullyear="true"></evaluation-metrics-summary>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Custom Range (one employee): the SUBMITTED months of the range and their average. The employee comes from ?employee_id (the list links to it),
// the backend answers only if the user may see him/her. Admin, poweruser and the GOM.
import { computed, onMounted, watch } from 'vue'
import API from '~/utils/api'
import LeaderBoardTable from '~/components/evaluation/LeaderBoardTable.vue'
import { monthLabel } from '~/utils/month_range'

definePageMeta({
  middleware: ['auth', 'department-layout'],
  layout: 'csd',
  alias: ['/collection/agent_performance/custom_range_details', '/purchasing/agent_performance/custom_range_details', '/hr/agent_performance/custom_range_details'],
})

const authStore = useAuthStore()
authStore.fetchTokenFromLocalStore()
const currentUser = authStore.state.user
const token = authStore.state.token

const route = useRoute()
const { code: departmentCode } = useDepartmentView()
const store = useEvaluationCustomRangeStore()
const { setRatingNameColor } = useRatingColor()

const isAllowed = ['admin', 'poweruser'].includes(currentUser?.role) || Number(currentUser?.position_level) === 15

const startDate = computed(() => route.query.start_date || '')
const endDate = computed(() => route.query.end_date || '')
const employeeId = computed(() => route.query.employee_id)

const agent = computed(() => store.state.detail.rangeAverage)
const months = computed(() => store.state.detail.agentMetricsInRange)
const leftOut = computed(() => store.state.detail.months_left_out || [])

const exportUrl = computed(() => `${API.evaluation_custom_range_export}/${employeeId.value}`)
const exportFileName = computed(() => `${departmentCode.value}-${agent.value?.db_name}-custom-range-${startDate.value}-${endDate.value}.xlsx`)

const load = () => {
  if (!employeeId.value || !startDate.value || !endDate.value) return
  store.fetchRange(employeeId.value, { start_date: startDate.value, end_date: endDate.value, department: departmentCode.value })
}

onMounted(load)
watch(() => [route.query.start_date, route.query.end_date, route.query.employee_id], load)
</script>
