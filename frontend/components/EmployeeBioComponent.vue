<template>
  <div>
    <h1 class="text-2xl font-bold mb-4 text-center">
      <img
        v-if="employee.image_link"
        :src="imageUrl(employee.image_link)"
        alt="Employee Photo"
        class="inline-block rounded-full w-12 h-12 object-cover border border-blue-200 mr-2 align-middle"
      />
      {{ employee.firstname }} {{ employee.lastname }}
      (<span class="text-green-600">{{ employee.id }}</span>) Employments and Assignments Information
    </h1>

    <div class="overflow-x-auto">
      <table class="w-full table-auto border-collapse bg-white">
        <thead class="bg-gradient-to-r from-blue-300 to-blue-300 text-gray-800">
          <tr>
            <th class="py-2 px-4 text-center text-sm font-bold border">Employee Status</th>
            <th class="py-2 px-4 text-center text-sm font-bold border">Date Hired</th>
            <th class="py-2 px-4 text-center text-sm font-bold border">Date Resigned</th>
            <th class="py-2 px-4 text-center text-sm font-bold border">Position</th>
            <th class="py-2 px-4 text-center text-sm font-bold border">Manager</th>
            <th class="py-2 px-4 text-center text-sm font-bold border">Department</th>
            <th class="py-2 px-4 text-center text-sm font-bold border">Team Assignment</th>
            <th class="py-2 px-4 text-center text-sm font-bold border">Assignment Date Start</th>
            <th class="py-2 px-4 text-center text-sm font-bold border">Assignment Date End</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(record, index) in records" :key="record.assignment_id" class="odd:bg-white even:bg-green-50">
            <td class="py-2 px-4 text-sm border text-center" :class="getStatusClass(employeeStatus(index))">
              {{ employeeStatus(index) }}
            </td>
            <td class="py-2 px-4 text-sm border text-center">{{ record.start_date }}</td>
            <td
              class="py-2 px-4 text-sm text-center border"
              :class="record.end_date ? 'text-red-600 font-bold' : 'text-green-600 font-bold'"
            >
              {{ record.end_date ? record.end_date : 'Currently Employee' }}
            </td>
            <td class="py-2 px-4 text-sm text-center border">{{ record.position_name }}</td>
            <td class="py-2 px-4 text-sm text-center border">{{ record.manager_dbname }}</td>
            <td class="py-2 px-4 text-sm text-center border font-bold">{{ (record.department_code || '').toUpperCase() }}</td>
            <td class="py-2 px-4 text-sm text-center border font-bold">{{ (record.team_name || '').toUpperCase() }}</td>
            <td class="py-2 px-4 text-sm text-center border">{{ record.effective_from }}</td>
            <td
              class="py-2 px-4 text-sm text-center border"
              :class="record.effective_to ? 'text-red-600 font-bold' : 'text-green-600 font-bold'"
            >
              {{ record.effective_to ? record.effective_to : 'Currently Assigned' }}
            </td>
          </tr>
          <tr v-if="records.length === 0">
            <td colspan="9" class="py-4 text-center text-gray-500">No employment record found.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
// Bio card of a none-sales employee (same idea as AgentBioComponent of the sales details page).
// records: employment + assignment history, newest first (GET /employees/:department_code/:employee_id)
import { computed } from 'vue'

const props = defineProps({
  records: {
    type: Array,
    required: true,
  },
})

const config = useRuntimeConfig()

const employee = computed(() => props.records[0] || {})

// shown status of a row: the employment status, or what happened between this row and the older one
const employeeStatus = (index) => {
  const records = props.records
  const record = records[index]
  const older = records[index + 1]

  if (!older) return record.employee_status

  if (record.employee_status === 'Rehired' && older.employee_status === 'Resigned') return 'Rehired'

  if (older.effective_to !== null && record.position_level > older.position_level) return 'Promoted'
  if (older.effective_to !== null && record.position_level < older.position_level) return 'Demoted'
  if (older.effective_to !== null) return 'Transferred'

  return record.employee_status
}

const getStatusClass = (status) => {
  switch (status?.trim()) {
    case 'Hired':
    case 'Rehired':
      return 'text-green-600 font-bold'
    case 'Promoted':
      return 'text-blue-600 font-bold'
    case 'Demoted':
      return 'text-orange-500 font-bold'
    case 'Transferred':
      return 'text-purple-500 font-bold'
    case 'Resigned':
      return 'text-red-600 font-bold'
    default:
      return ''
  }
}

// the images are served by the backend by filename; older rows still have a '/images/' path in front of it
const imageUrl = (imageLink) => {
  if (!imageLink) return ''
  if (imageLink.startsWith('data:image') || /^https?:\/\//.test(imageLink)) return imageLink
  return `${config.public.imageBaseUrl}${imageLink.split('/').pop()}`
}
</script>
