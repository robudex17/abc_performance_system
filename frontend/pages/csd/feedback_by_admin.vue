<template>
  <div class="p-4 mt-20">
    <!-- Loading Spinner -->
    <div v-if="csdStoreInstance.state.loading">
      <spinner></spinner>
    </div>

    <h1 class="text-3xl font-extrabold text-gray-800 mb-2 text-center">CSD Feedback By Admin</h1>
    <p class="text-center text-gray-600 mb-6">
      The feedback of the admin for <span class="font-bold text-red-600">{{ monthLabel }}</span>.
      When there is one, it is the overall feedback of the employee (it overrules all the other feedback).
    </p>

    <!-- Search -->
    <div class="mb-4 flex justify-end">
      <input
        v-model="search"
        type="text"
        placeholder="Search employee..."
        class="border border-gray-300 rounded px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
    </div>

    <!-- All the CSD staff, the manager with the highest position level included -->
    <div class="relative overflow-x-auto overflow-y-auto max-h-[75vh] shadow-xl rounded-lg">
      <table class="w-full table-auto border-collapse bg-white">
        <thead>
          <tr class="bg-gradient-to-r from-blue-200 to-blue-300 text-gray-800">
            <th class="py-1 px-4 text-center text-xs font-bold text-green-900 border">ID</th>
            <th class="py-1 px-4 text-center text-xs font-bold text-green-900 border">Name</th>
            <th class="py-1 px-4 text-center text-xs font-bold text-green-900 border">Employee Status</th>
            <th class="py-1 px-4 text-center text-xs font-bold text-green-900 border">Position</th>
            <th class="py-1 px-4 text-center text-xs font-bold text-green-900 border">Immediate Head</th>
            <th class="py-1 px-4 text-center text-xs font-bold text-green-900 border">Team</th>
            <th class="py-1 px-4 text-center text-xs font-bold text-green-900 border">Month</th>
            <th class="py-1 px-4 text-center text-xs font-bold text-green-900 border">Year</th>
            <th class="py-1 px-4 text-center text-xs font-bold text-green-900 border">Feedback (Admin)</th>
            <th class="py-1 px-4 text-center text-xs font-bold text-green-900 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="agent in paginatedAgents"
            :key="agent.id"
            class="even:bg-blue-50 odd:bg-white hover:bg-blue-100 transition-colors"
          >
            <td class="py-1 px-4 text-center text-xs text-gray-700 border">{{ agent.id }}</td>

            <td class="py-1 pr-12 pl-2 text-left text-xs font-medium text-green-900 border">
              <div class="flex items-center space-x-2">
                <img
                  v-if="agent.image_link"
                  :src="updateImageLink(agent.image_link)"
                  alt="Employee Image"
                  class="w-9 h-9 rounded-full object-cover shadow"
                />
                <span>{{ agent.db_name }}</span>
              </div>
            </td>

            <td
              class="py-1 px-4 text-left text-xs border"
              :class="agent.employee_status === 'Resigned' ? 'text-red-600 font-bold' : 'text-green-600 font-bold'"
            >
              {{ agent.employee_status }}
            </td>
            <td class="py-1 px-4 text-left text-xs font-medium text-gray-700 border">{{ agent.position_name }}</td>
            <td class="py-1 px-4 text-left text-xs font-medium text-gray-700 border">{{ agent.manager_dbname }}</td>
            <td class="py-1 px-4 text-left text-xs font-medium text-gray-700 border">{{ agent.team_name }}</td>
            <td class="py-1 px-4 text-left text-xs font-medium text-gray-700 border">{{ agent.month }}</td>
            <td class="py-1 px-4 text-left text-xs font-medium text-gray-700 border">{{ agent.year }}</td>

            <td
              class="py-1 px-4 text-center text-xs font-bold border"
              :class="hasFeedback(agent) ? 'text-purple-800' : 'text-red-600'"
            >
              {{ hasFeedback(agent) ? Number(agent.feedback_by_admin).toFixed(4) : 'No Feedback' }}
            </td>

            <td class="py-1 px-4 text-center border">
              <div class="flex justify-center space-x-2">
                <button
                  v-if="!hasFeedback(agent)"
                  @click="openFeedbackModal(agent, 'add')"
                  class="py-0.5 px-3 rounded-lg text-sm bg-green-500 text-white hover:bg-green-600"
                >
                  Add
                </button>
                <template v-else>
                  <button
                    @click="openFeedbackModal(agent, 'edit')"
                    class="py-0.5 px-3 rounded-lg text-sm bg-blue-500 text-white hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    @click="deleteFeedback(agent)"
                    class="py-0.5 px-3 rounded-lg text-sm bg-red-500 text-white hover:bg-red-600"
                  >
                    Delete
                  </button>
                </template>
              </div>
            </td>
          </tr>

          <tr v-if="!csdStoreInstance.state.loading && filteredAgents.length === 0">
            <td colspan="10" class="py-6 text-center text-gray-500">No employee found.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="mt-4 flex justify-center space-x-2">
      <button
        v-for="page in totalPages"
        :key="page"
        class="px-3 py-1 border rounded"
        :class="currentPage === page ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'"
        @click="currentPage = page"
      >
        {{ page }}
      </button>
    </div>

    <!-- The same modal / handlers as the CSD Evaluation page (feedback_by_admin) -->
    <CsdEvaluation
      :showModal="showModalEvalType"
      :evalType="eval_type"
      :modalType="modalEvalType"
      :agentData="selectedData"
      :modalEvalTypeMessage="modalEvalTypeMessage"
      @passClose="resetValues"
      @passAddDataAgent="addDataAgent"
      @passEditDataAgent="editDataAgent"
    />
  </div>
</template>

<script setup>
// FEEDBACK > FEEDBACK ADMIN of the CSD department. Admin only.
// Lists ALL the CSD staff (every position level) of the selected month (year_month of the navbar, else the current
// month) and lets the admin add / edit / delete the feedback_by_admin. It reuses what the CSD Evaluation page uses:
// the csd store, the /csd_evaluation endpoints and the CsdEvaluation modal.
definePageMeta({
  layout: 'csd',
  middleware: ['auth', 'admin-only'],
})

import { ref, computed, watch, onMounted } from 'vue'
import CsdEvaluation from '~/components/csd/CsdEvaluation.vue'
import { isFutureMonth } from '@/utils/constants'

const route = useRoute()
const csdStoreInstance = useCsdStore()
const config = useRuntimeConfig()

const eval_type = 'feedback_by_admin'

const showModalEvalType = ref(false)
const modalEvalType = ref('add')
const modalEvalTypeMessage = ref([])
const selectedData = ref({})

const search = ref('')
const itemsPerPage = 10
const currentPage = ref(1)

const agents = computed(() => csdStoreInstance.state.csdEvaluation)

const filteredAgents = computed(() => {
  const text = search.value.trim().toLowerCase()
  if (!text) return agents.value
  return agents.value.filter(agent =>
    [agent.db_name, agent.firstname, agent.lastname, agent.position_name, agent.team_name, agent.manager_dbname]
      .some(value => String(value ?? '').toLowerCase().includes(text))
  )
})

const totalPages = computed(() => Math.ceil(filteredAgents.value.length / itemsPerPage))

const paginatedAgents = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredAgents.value.slice(start, start + itemsPerPage)
})

// the month of the date picker of the navbar, the current month when there is none
const today = new Date()
const yearMonth = computed(() => route.query.year_month || `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`)
const monthLabel = computed(() => {
  const [year, month] = yearMonth.value.split('-').map(Number)
  return `${new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'long' })} ${year}`
})

const hasFeedback = (agent) => Number(agent.feedback_by_admin) > 0

// the images are served by the backend by filename; older rows still have a '/images/' path in front of it
const updateImageLink = (imageLink) => {
  if (!imageLink) return ''
  if (imageLink.startsWith('data:image') || /^https?:\/\//.test(imageLink)) return imageLink
  return `${config.public.imageBaseUrl}${imageLink.split('/').pop()}`
}

const fetchEmployees = () => {
  currentPage.value = 1
  csdStoreInstance.fetchCsdOrEvaluationPerformanceMetrics(null, 'all', 'evaluation', route.query)
}

// same rules as openMetricsTypeModal of the CSD Evaluation page
const canChange = (agent) => {
  if (agent.eval_submitted == 1) {
    alert(`Adding, Updating, or Deleting ${eval_type} that is already submitted is prohibited.`)
    return false
  }
  if (agent.employee_status == 'Resigned') {
    alert('Adding, Updating, or Deleting Agent that is already resigned is prohibitted.')
    return false
  }
  if (isFutureMonth(agent.year_month)) {
    alert(`Adding, Updating, or Deleting ${eval_type} for future month is prohibitted.`)
    return false
  }
  return true
}

const openFeedbackModal = (agent, type) => {
  if (!canChange(agent)) return

  modalEvalTypeMessage.value = [`Add ${eval_type}`, `Edit ${eval_type}`]
  modalEvalType.value = type
  selectedData.value = {
    year_month: agent.year_month,
    employee_status: agent.employee_status,
    eval_submitted: agent.eval_submitted,
    employee_id: agent.id,
    db_name: agent.db_name,
    month: agent.month,
    year: agent.year,
    position_id: agent.position_id,
    position_name: agent.position_name,
    team_id: agent.team_id,
    feedback_by_admin: parseFloat(agent.feedback_by_admin),
    image_link: agent.image_link,
    eval_type,
  }
  showModalEvalType.value = true
}

const resetValues = () => {
  showModalEvalType.value = false
  modalEvalType.value = 'add'
  modalEvalTypeMessage.value = []
}

const addDataAgent = async (agent) => {
  if (agent.feedback_by_admin == '' || agent.feedback_by_admin == 0) {
    alert(`${eval_type} cannot be 0 or empty`)
    return
  }
  await csdStoreInstance.addCsdPerformanceMetricsOrEvaluation(agent.employee_id, eval_type, 'evaluation', route.query, agent)
  fetchEmployees()
}

const editDataAgent = async (agent) => {
  await csdStoreInstance.updateCsdPerformanceMetricsOrEvaluation(agent.employee_id, eval_type, 'evaluation', route.query, agent)
  fetchEmployees()
}

const deleteFeedback = async (agent) => {
  if (!canChange(agent)) return
  if (!confirm(`Delete the admin feedback of ${agent.db_name} for ${monthLabel.value}?`)) return

  await csdStoreInstance.deleteCsdPerformanceMetricsOrEvaluation(agent.id, eval_type, 'evaluation', route.query, { employee_id: agent.id })
  fetchEmployees()
}

onMounted(fetchEmployees)

// another month was picked in the navbar
watch(() => route.query.year_month, fetchEmployees)
</script>
