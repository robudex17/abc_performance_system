<template>
  <div class="p-4 mt-20">
    <!-- Loading Spinner -->
    <div v-if="qaStore.state.loading">
      <spinner></spinner>
    </div>

    <h1 class="text-3xl font-extrabold text-gray-800 mb-2 text-center">CSD Feedback By QA</h1>
    <p class="text-center text-gray-600 mb-6">
      Give a score (greater than 0, up to 5) to the CSD staff of position level 8 and below for
      <span class="font-bold text-red-600">{{ monthLabel }}</span>.
      It is the "Feedback From QA" of the employee.
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

    <div class="relative overflow-x-auto overflow-y-auto max-h-[75vh] shadow-xl rounded-lg">
      <table class="w-full table-auto border-collapse bg-white">
        <thead>
          <tr class="bg-gradient-to-r from-blue-200 to-blue-300 text-gray-800">
            <th class="py-1 px-4 text-center text-xs font-bold text-green-900 border">ID</th>
            <th class="py-1 px-4 text-center text-xs font-bold text-green-900 border">Name</th>
            <th class="py-1 px-4 text-center text-xs font-bold text-green-900 border">Department</th>
            <th class="py-1 px-4 text-center text-xs font-bold text-green-900 border">Employee Status</th>
            <th class="py-1 px-4 text-center text-xs font-bold text-green-900 border">Position</th>
            <th class="py-1 px-4 text-center text-xs font-bold text-green-900 border">Immediate Head</th>
            <th class="py-1 px-4 text-center text-xs font-bold text-green-900 border">Team</th>
            <th class="py-1 px-4 text-center text-xs font-bold text-green-900 border">Month</th>
            <th class="py-1 px-4 text-center text-xs font-bold text-green-900 border">Year</th>
            <th class="py-1 px-4 text-center text-xs font-bold text-green-900 border">Feedback (QA)</th>
            <th class="py-1 px-4 text-center text-xs font-bold text-green-900 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="employee in paginatedStaff"
            :key="employee.id"
            class="even:bg-blue-50 odd:bg-white hover:bg-blue-100 transition-colors"
          >
            <td class="py-1 px-4 text-center text-xs text-gray-700 border">{{ employee.id }}</td>

            <td class="py-1 pr-12 pl-2 text-left text-xs font-medium text-green-900 border">
              <div class="flex items-center space-x-2">
                <img
                  v-if="employee.image_link"
                  :src="updateImageLink(employee.image_link)"
                  alt="Employee Image"
                  class="w-9 h-9 rounded-full object-cover shadow"
                />
                <span>{{ employee.db_name }}</span>
              </div>
            </td>

            <!-- the Quality Analyst also scores the Collection staff (level 3, 2, 1) -->
            <td class="py-1 px-4 text-center text-xs font-bold border" :class="employee.department_code === 'collection' ? 'text-orange-600' : 'text-blue-700'">
              {{ (employee.department_code || 'csd').toUpperCase() }}
            </td>
            <td
              class="py-1 px-4 text-left text-xs border"
              :class="employee.employee_status === 'Resigned' ? 'text-red-600 font-bold' : 'text-green-600 font-bold'"
            >
              {{ employee.employee_status }}
            </td>
            <td class="py-1 px-4 text-left text-xs font-medium text-gray-700 border">{{ employee.position_name }}</td>
            <td class="py-1 px-4 text-left text-xs font-medium text-gray-700 border">{{ employee.manager_dbname }}</td>
            <td class="py-1 px-4 text-left text-xs font-medium text-gray-700 border">{{ employee.team_name }}</td>
            <td class="py-1 px-4 text-left text-xs font-medium text-gray-700 border">{{ employee.month }}</td>
            <td class="py-1 px-4 text-left text-xs font-medium text-gray-700 border">{{ employee.year }}</td>

            <td
              class="py-1 px-4 text-center text-xs font-bold border"
              :class="employee.qa_feedback ? 'text-purple-800' : 'text-red-600'"
            >
              {{ employee.qa_feedback ?? 'No Feedback' }}
            </td>

            <td class="py-1 px-4 text-center border">
              <div class="flex justify-center space-x-2">
                <button
                  v-if="!employee.qa_feedback"
                  @click="openModal(employee, 'add')"
                  class="py-0.5 px-3 rounded-lg text-sm bg-green-500 text-white hover:bg-green-600"
                >
                  Add
                </button>
                <template v-else>
                  <button
                    @click="openModal(employee, 'edit')"
                    class="py-0.5 px-3 rounded-lg text-sm bg-blue-500 text-white hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    @click="deleteFeedback(employee)"
                    class="py-0.5 px-3 rounded-lg text-sm bg-red-500 text-white hover:bg-red-600"
                  >
                    Delete
                  </button>
                </template>
              </div>
            </td>
          </tr>

          <tr v-if="!qaStore.state.loading && filteredStaff.length === 0">
            <td colspan="11" class="py-6 text-center text-gray-500">No employee found.</td>
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

    <!-- Add / Edit modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-6 w-1/3">
        <h2 class="text-xl font-bold mb-4">{{ modalType === 'add' ? 'Add' : 'Edit' }} QA Feedback</h2>
        <form @submit.prevent="submitFeedback">
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">Employee</label>
            <input :value="`${selected.db_name} (${selected.id})`" type="text" class="w-full border rounded-lg p-2" disabled />
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">Month</label>
            <input :value="monthLabel" type="text" class="w-full border rounded-lg p-2" disabled />
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">QA Feedback (greater than 0, up to 5)</label>
            <input v-model="score" type="text" inputmode="decimal" class="w-full border rounded-lg p-2" />
            <p v-if="scoreError" class="text-red-500 text-sm mt-2">{{ scoreError }}</p>
          </div>

          <div class="flex justify-end gap-2">
            <button type="button" @click="closeModal" class="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600">Cancel</button>
            <button type="submit" :disabled="saving" class="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 disabled:bg-gray-400">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
// FEEDBACK > FEEDBACK MEMBERS of the CSD & Collections Quality Analyst / Trainer (position level 9).
// Instead of the questionnaire, the QA gives ONE SCORE per employee and month (like the feedback by admin) to the
// CSD staff of position level 8 and below. It is saved in feedback_by_qa and shown as "Feedback From QA".
definePageMeta({
  layout: 'csd',
  middleware: ['auth', 'qa-only'],
})

import { ref, computed, watch, onMounted } from 'vue'
import { isFutureMonth } from '@/utils/constants'

const route = useRoute()
const qaStore = useCsdQaFeedbackStore()
const config = useRuntimeConfig()

const search = ref('')
const itemsPerPage = 10
const currentPage = ref(1)

const showModal = ref(false)
const modalType = ref('add')
const selected = ref({})
const score = ref('')
const scoreError = ref('')
const saving = ref(false)

// the month of the date picker of the navbar, the current month when there is none
const today = new Date()
const yearMonth = computed(() => route.query.year_month || `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`)
const monthLabel = computed(() => {
  const [year, month] = yearMonth.value.split('-').map(Number)
  return `${new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'long' })} ${year}`
})

const filteredStaff = computed(() => {
  const text = search.value.trim().toLowerCase()
  if (!text) return qaStore.state.staff
  return qaStore.state.staff.filter(employee =>
    [employee.db_name, employee.position_name, employee.team_name, employee.manager_dbname, employee.department_code]
      .some(value => String(value ?? '').toLowerCase().includes(text))
  )
})

const totalPages = computed(() => Math.ceil(filteredStaff.value.length / itemsPerPage))

const paginatedStaff = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredStaff.value.slice(start, start + itemsPerPage)
})

// the images are served by the backend by filename; older rows still have a '/images/' path in front of it
const updateImageLink = (imageLink) => {
  if (!imageLink) return ''
  if (imageLink.startsWith('data:image') || /^https?:\/\//.test(imageLink)) return imageLink
  return `${config.public.imageBaseUrl}${imageLink.split('/').pop()}`
}

const fetchStaff = async () => {
  currentPage.value = 1
  try {
    await qaStore.fetchStaff(yearMonth.value)
  } catch (error) {
    alert(error.message)
  }
}

// same rules as the CSD Evaluation page
const canChange = (employee) => {
  if (employee.eval_submitted == 1) {
    alert('Adding, Updating, or Deleting the QA feedback that is already submitted is prohibited.')
    return false
  }
  if (employee.employee_status == 'Resigned') {
    alert('Adding, Updating, or Deleting the QA feedback of a resigned employee is prohibited.')
    return false
  }
  if (isFutureMonth(employee.year_month)) {
    alert('Adding, Updating, or Deleting the QA feedback for a future month is prohibited.')
    return false
  }
  return true
}

const openModal = (employee, type) => {
  if (!canChange(employee)) return

  modalType.value = type
  selected.value = employee
  score.value = type === 'edit' ? String(parseFloat(employee.qa_feedback)) : ''
  scoreError.value = ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const submitFeedback = async () => {
  const text = String(score.value).trim()

  // 4, 4.5, 4.75, .5
  if (!/^(\d+(\.\d+)?|\.\d+)$/.test(text) || Number(text) <= 0 || Number(text) > 5) {
    scoreError.value = 'Please enter a number greater than 0 and not greater than 5.'
    return
  }

  saving.value = true
  try {
    const message = await qaStore.saveFeedback(modalType.value === 'add' ? 'POST' : 'PUT', selected.value.id, yearMonth.value, text)
    closeModal()
    alert(message)
    await fetchStaff()
  } catch (error) {
    scoreError.value = error.message
  } finally {
    saving.value = false
  }
}

const deleteFeedback = async (employee) => {
  if (!canChange(employee)) return
  if (!confirm(`Delete the QA feedback of ${employee.db_name} for ${monthLabel.value}?`)) return

  try {
    alert(await qaStore.deleteFeedback(employee.id, yearMonth.value))
    await fetchStaff()
  } catch (error) {
    alert(error.message)
  }
}

onMounted(fetchStaff)

// another month was picked in the navbar
watch(yearMonth, fetchStaff)
</script>
