<template>
  <div>
    <h1 class="text-2xl font-bold mb-4 text-center">Employee Feedback Information ({{ summary.month }} {{ summary.year }})</h1>
    <p v-if="lock.locked" class="text-center text-sm font-bold text-red-600 mb-3">{{ lock.message }}</p>

    <div class="overflow-x-auto">
      <table class="w-full table-auto border-collapse bg-white">
        <thead class="bg-gradient-to-r from-blue-300 to-blue-300 text-gray-800">
          <tr>
            <th class="py-2 px-2 text-sm text-center font-bold border">Month</th>
            <th class="py-2 px-2 text-center text-sm font-bold border">Year</th>
            <th v-if="showFromMembers" class="py-2 px-2 text-center text-sm font-bold border">
              <button
                @click="openModal('by_member')"
                class="text-blue-600 underline hover:text-blue-800 font-bold cursor-pointer"
              >
                Feedback From Members
              </button>
            </th>
            <th v-if="showFromHead" class="py-2 px-2 text-center text-sm font-bold border">
              <button
                @click="openModal('by_head')"
                class="text-blue-600 underline hover:text-blue-800 font-bold cursor-pointer"
              >
                Feedback From Head
              </button>
            </th>
            <th class="py-2 px-2 text-center text-sm font-bold border">
              <button
                @click="openModal('qa')"
                class="text-blue-600 underline hover:text-blue-800 font-bold cursor-pointer"
              >
                Feedback From Qa
              </button>
            </th>
            <th class="py-2 px-2 text-center text-sm font-bold border">Overall Feedback</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="month in summary.months" :key="month.year_month" class="odd:bg-white even:bg-green-50">
            <td class="py-2 px-2 text-sm text-center border">{{ month.month }}</td>
            <td class="py-2 px-2 text-sm text-center border">{{ month.year }}</td>
            <td
              v-if="showFromMembers"
              class="py-2 px-2 text-sm text-center font-bold border"
              :class="month.average_from_members ? 'text-green-800' : 'text-red-600'"
            >
              {{ month.average_from_members ?? 'No Feedback' }}
            </td>
            <td
              v-if="showFromHead"
              class="py-2 px-2 text-sm text-center font-bold border"
              :class="month.average_from_head ? 'text-green-800' : 'text-red-600'"
            >
              {{ month.average_from_head ?? 'No Feedback' }}
            </td>
            <td
              class="py-2 px-2 text-sm text-center font-bold border"
              :class="month.average_by_qa ? 'text-green-800' : 'text-red-600'"
            >
              {{ month.average_by_qa ?? 'No Feedback' }}
            </td>
            <td
              class="py-2 px-2 text-sm text-center font-bold border"
              :class="month.overall_feedback ? 'text-purple-800' : 'text-red-600'"
            >
              {{ month.overall_feedback ?? 'No Feedback' }}
              <span v-if="month.admin_feedback !== null" class="block text-xs font-semibold text-gray-500">(set by Admin)</span>
            </td>
          </tr>
          <tr v-if="summary.months.length === 0">
            <td :colspan="4 + (showFromMembers ? 1 : 0) + (showFromHead ? 1 : 0)" class="py-4 text-center text-gray-500">
              Feedback of {{ summary.month }} {{ summary.year }} cannot be shown yet.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="modalType" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl shadow-2xl w-11/12 md:w-3/4 lg:w-2/3 xl:w-3/4 overflow-hidden">
        <!-- Header -->
        <div class="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
          <h2 class="text-lg font-bold">{{ modalTitle }}</h2>
          <button @click="closeModal" class="text-white hover:text-gray-200 transition">✕</button>
        </div>

        <!-- Body -->
        <div class="bg-gray-50 p-6 max-h-[70vh] overflow-y-auto overflow-x-hidden">
          <table class="min-w-full table-fixed border-collapse">
            <thead>
              <tr class="bg-gray-200 text-gray-700" v-if="modalRows.length > 0">
                <th class="w-1/4 px-2 py-1 text-center font-semibold border">Feedback By</th>
                <th class="w-1/6 px-2 py-1 text-center font-semibold border">Month</th>
                <th class="w-1/6 px-2 py-1 text-center font-semibold border">Year</th>
                <th class="w-1/6 px-2 py-1 text-center font-semibold border">Feedback Score</th>
                <th v-if="modalType !== 'qa'" class="w-1/4 px-2 py-1 text-center font-semibold border">Actions</th>
              </tr>
            </thead>
            <tbody v-if="modalRows.length > 0">
              <tr v-for="row in modalRows" :key="`${row.feedback_type}-${row.id}`" class="border-b hover:bg-gray-100 transition">
                <!-- Feedback By -->
                <td class="px-2 py-0.5 border">
                  <div class="flex items-center space-x-3">
                    <img
                      v-if="row.image_link"
                      :src="updateImageLink(row.image_link)"
                      alt="Employee Image"
                      class="w-10 h-10 rounded-full object-cover border"
                    />
                    <span class="font-medium text-gray-800">{{ row.who_give_feedback_name }}</span>
                  </div>
                </td>

                <td class="px-2 py-1 font-semibold border text-center">{{ monthName(row.year_month) }}</td>
                <td class="px-2 py-1 font-semibold border text-center">{{ row.year_month.slice(0, 4) }}</td>

                <td class="px-2 py-1 text-center border">
                  <span v-if="parseFloat(row.feedback_score) > 0" class="text-gray-800 font-medium">
                    {{ Number(row.feedback_score).toFixed(4) }}
                  </span>
                  <span v-else class="text-gray-400 italic font-semibold">No Feedback Yet</span>
                </td>

                <td v-if="modalType !== 'qa'" class="px-1 py-1 text-center text-xs border">
                  <div class="flex justify-center items-center space-x-2">
                    <!-- Toggle Enable/Disable Update -->
                    <button
                      @click="toggleUpdate(row)"
                      :disabled="lock.locked"
                      class="text-white font-bold px-2 py-2 rounded-2xl shadow-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      :class="row.can_update ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'"
                    >
                      {{ row.can_update ? 'Update Enabled' : 'Update is Disabled' }}
                    </button>

                    <!-- Delete Button -->
                    <button
                      @click="deleteFeedback(row)"
                      :disabled="lock.locked"
                      class="px-2 py-2 font-bold rounded-2xl shadow-md transition duration-300 text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Delete
                    </button>

                    <!-- View Feedback: opens the answers in a new tab, read only for the admin -->
                    <NuxtLink
                      :to="{
                        path: `/feedback/feedback_by_nonesales/${row.feedback_type}`,
                        query: {
                          who_receive_feedback_id: row.who_receive_feedback_id,
                          who_receive_feedback_db_name: row.who_receive_feedback_name,
                          who_give_feedback_id: row.who_give_feedback_id,
                          who_give_feedback_db_name: row.who_give_feedback_name,
                          feedback_type: row.feedback_type,
                          year_month: row.year_month,
                          department_code: employee.department_code,
                          admin_view_only: true,
                        },
                      }"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="rounded-2xl px-2 py-2 bg-blue-500 text-white font-bold hover:bg-blue-600"
                    >
                      View Feedback
                    </NuxtLink>
                  </div>
                </td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr>
                <td class="border px-4 py-2 text-red-500 font-bold">
                  No Feedback Yet for {{ employee.firstname }} {{ employee.lastname }} for {{ summary.month }} {{ summary.year }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-gray-100 text-right">
          <button
            @click="closeModal"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 hover:scale-105 transition duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Feedback Information of a none-sales employee for the admin (same idea as AgentFeedbackSummaryComponent of sales).
// summary = GET /feedback_by_nonesales_summary/:employee_id: one row per month plus the lists shown in the modals.
// Overall feedback: feedback by the admin if there is one, else the average of from members / from head / by QA.
import { ref, computed } from 'vue'

const props = defineProps({
  summary: { type: Object, required: true },
  employee: { type: Object, required: true },   // firstname, lastname, position_level, employee_status
  lock: { type: Object, default: () => ({ locked: false, reason: null, message: '' }) },   // resigned or submitted: no update / delete
})

const emit = defineEmits(['passEnableDisableFeedback', 'passDeleteFeedback'])

const config = useRuntimeConfig()

// Members rate their head (position level 8 and up), the head rates the member (everybody but the top level 10)
const level = computed(() => Number(props.employee.position_level))
const showFromMembers = computed(() => Number.isNaN(level.value) || level.value >= 8)
const showFromHead = computed(() => Number.isNaN(level.value) || level.value < 10)

// modal: 'by_member' (from members) | 'by_head' (from head) | 'qa' | null (closed)
const modalType = ref(null)

// live list, so the modal follows the data when an admin action reloads the summary
const modalRows = computed(() => {
  if (modalType.value === 'by_member') return props.summary.from_members
  if (modalType.value === 'by_head') return props.summary.from_head
  if (modalType.value === 'qa') return props.summary.qa
  return []
})

const modalTitle = computed(() => {
  if (modalType.value === 'qa') return 'QA Feedback Details'
  if (modalType.value === 'by_member') return 'Feedback From Members: Update/Delete Feedback'
  return 'Feedback From Head: Update/Delete Feedback'
})

const openModal = (type) => {
  modalType.value = type
}

const closeModal = () => {
  modalType.value = null
}

const monthName = (yearMonth) => {
  const [year, month] = yearMonth.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'long' })
}

// the images are served by the backend by filename; older rows still have a '/images/' path in front of it
const updateImageLink = (imageLink) => {
  if (!imageLink) return ''
  if (imageLink.startsWith('data:image') || /^https?:\/\//.test(imageLink)) return imageLink
  return `${config.public.imageBaseUrl}${imageLink.split('/').pop()}`
}

const keyOf = (row) => ({
  who_give_feedback_id: row.who_give_feedback_id,
  who_receive_feedback_id: row.who_receive_feedback_id,
  year_month: row.year_month,
  feedback_type: row.feedback_type,
})

const toggleUpdate = (row) => {
  if (props.employee.employee_status === 'Resigned') {
    alert('User is not allowed to enable or disable update feedback which already resigned.')
    return
  }
  if (props.lock.locked) {
    alert(props.lock.message)
    return
  }
  emit('passEnableDisableFeedback', { ...keyOf(row), can_update: row.can_update ? 0 : 1 })
}

const deleteFeedback = (row) => {
  if (props.employee.employee_status === 'Resigned') {
    alert('User is not allowed to delete feedback which already resigned.')
    return
  }
  if (props.lock.locked) {
    alert(props.lock.message)
    return
  }
  if (confirm(`Delete the feedback of ${row.who_give_feedback_name} for ${monthName(row.year_month)} ${row.year_month.slice(0, 4)}?`)) {
    emit('passDeleteFeedback', keyOf(row))
  }
}
</script>
