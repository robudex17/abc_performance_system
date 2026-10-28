<template>
  <div>
    <h1 class="text-2xl font-bold mb-4 text-center">{{ attendanceTitle }}</h1>
    <p v-if="lock.locked" class="text-center text-sm font-bold text-red-600 mb-3">{{ lock.message }}</p>

    <div class="overflow-x-auto">
      <table class="w-full table-auto border-collapse bg-white">
        <thead class="bg-gradient-to-r from-blue-300 to-blue-300 text-gray-800">
          <tr>
            <th class="py-2 px-2 text-center text-sm font-bold border">Month</th>
            <th class="py-2 px-2 text-center text-sm font-bold border">Count</th>
            <th class="py-2 px-2 text-center text-sm font-bold border">Description</th>
            <th class="py-2 px-2 text-center text-sm font-bold border">
              <div class="flex justify-between items-center">
                Actions
                <button
                  @click="openModal('add')"
                  :disabled="lock.locked"
                  class="ml-2 bg-green-500 text-white py-1 px-3 rounded-lg flex items-center gap-2 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <font-awesome-icon icon="plus" />
                  Add
                </button>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="attendance in attendanceDetails" :key="attendance.id" class="odd:bg-white even:bg-green-50">
            <td class="py-2 px-2 text-sm text-center border">{{ monthLabel(attendance.year_month) }}</td>
            <td class="py-2 px-2 text-sm text-center border font-bold">{{ attendance.count }}</td>
            <td class="py-2 px-2 text-sm text-center border">{{ attendance.description }}</td>
            <td class="py-1 px-2 text-sm text-center border">
              <div class="flex justify-center gap-2">
                <button
                  @click="openModal('edit', attendance)"
                  :disabled="lock.locked"
                  class="bg-green-500 text-white py-1 px-3 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Edit
                </button>
                <button
                  @click="deleteAttendance(attendance.year_month)"
                  :disabled="lock.locked"
                  class="bg-red-500 text-white py-1 px-3 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="attendanceDetails.length === 0">
            <td colspan="4" class="py-4 text-center text-gray-500">No record found for this month.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add / Edit modal -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 class="text-xl font-bold text-gray-700 mb-4">
          {{ modalType === 'add' ? 'Add' : 'Edit' }} {{ attendanceTitle }}
        </h2>
        <form @submit.prevent="submitForm">
          <label class="font-semibold text-gray-600">Month</label>
          <input
            type="month"
            v-model="form.year_month"
            :max="currentYearMonth"
            disabled
            required
            class="w-full p-2 border rounded mb-3 disabled:bg-gray-100"
          />

          <label class="font-semibold text-gray-600">Count</label>
          <input
            type="number"
            v-model.number="form.count"
            min="0"
            max="999"
            step="1"
            required
            class="w-full p-2 border rounded mb-3"
          />

          <label class="font-semibold text-gray-600">Description</label>
          <textarea
            v-model="form.description"
            required
            rows="3"
            class="w-full p-2 border rounded mb-3"
            placeholder="Reason / details"
          ></textarea>

          <p v-if="errorMessage" class="text-red-600 text-sm mb-3">{{ errorMessage }}</p>

          <div class="flex justify-end space-x-4">
            <button type="button" @click="closeModal" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
              {{ modalType === 'add' ? 'Add' : 'Update' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
// Absences / tardiness / memo of a none-sales employee. Same idea as the sales AttendanceComponent,
// but these records are one count + description per month (absences2, tardiness2 and memo2 tables).
import { ref, computed } from 'vue'

const props = defineProps({
  attendanceType: { type: String, required: true },          // absences | tardiness | memo
  attendanceTitle: { type: String, required: true },
  attendanceDetails: { type: Array, required: true },        // records of the selected month
  employee: { type: Object, required: true },                // needs employee_status
  defaultYearMonth: { type: String, required: true },        // month that is filled in on "Add"
  lock: { type: Object, default: () => ({ locked: false, reason: null, message: "" }) },   // resigned or submitted: no add, edit or delete
})

const emit = defineEmits(['passAttendance', 'passUpdateAttendance', 'passDeleteAttendance'])

const today = new Date()
const currentYearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`

const showModal = ref(false)
const modalType = ref('add')
const errorMessage = ref('')
const form = ref({ year_month: '', count: 1, description: '' })

const monthLabel = (yearMonth) => {
  const [year, month] = yearMonth.split('-').map(Number)
  return `${new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'long' })} ${year}`
}

const isResigned = computed(() => props.employee.employee_status === 'Resigned')

const openModal = (type, attendance = null) => {
  if (isResigned.value) {
    alert(`Adding or Updating ${props.attendanceType} of a Resigned employee is prohibited.`)
    return
  }

  // submitted (the server checks it too)
  if (props.lock.locked) {
    alert(props.lock.message)
    return
  }

  // the records are always of the month selected in the date picker of the navbar
  if (type === 'add' && props.defaultYearMonth > currentYearMonth) {
    alert(`Cannot set ${props.attendanceType} for a future month`)
    return
  }

  modalType.value = type
  errorMessage.value = ''

  form.value = type === 'edit'
    ? { year_month: attendance.year_month, count: attendance.count, description: attendance.description }
    : { year_month: props.defaultYearMonth, count: 1, description: '' }

  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const submitForm = () => {
  if (form.value.year_month > currentYearMonth) {
    errorMessage.value = `Cannot set ${props.attendanceType} for a future month`
    return
  }
  if (!Number.isInteger(form.value.count) || form.value.count < 0) {
    errorMessage.value = 'Count must be a whole number, 0 or more'
    return
  }
  if (!form.value.description.trim()) {
    errorMessage.value = 'Description is required'
    return
  }

  const record = { ...form.value, description: form.value.description.trim() }

  if (modalType.value === 'add') {
    const duplicate = props.attendanceDetails.find(attendance => attendance.year_month === record.year_month)
    if (duplicate) {
      errorMessage.value = `${monthLabel(record.year_month)} already has a record, please edit it instead`
      return
    }
    emit('passAttendance', props.attendanceType, record)
  } else {
    emit('passUpdateAttendance', props.attendanceType, record)
  }

  closeModal()
}

const deleteAttendance = (yearMonth) => {
  if (isResigned.value) {
    alert(`Deleting ${props.attendanceType} of a Resigned employee is prohibited.`)
    return
  }

  if (props.lock.locked) {
    alert(props.lock.message)
    return
  }

  if (confirm(`Are you sure you want to delete the ${props.attendanceType} of ${monthLabel(yearMonth)}?`)) {
    emit('passDeleteAttendance', props.attendanceType, yearMonth)
  }
}
</script>
