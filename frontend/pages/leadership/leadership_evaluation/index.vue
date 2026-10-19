<template>
  <div class="p-4 mt-20">
    <h1 class="text-3xl font-extrabold text-gray-800 mb-2 text-center">{{ pageTitle }}</h1>
    <p class="text-center text-gray-600 mb-6">Leadership Individual Performance of {{ monthLabel }}. Score the key performance indicators of each leader.</p>

    <p v-if="isFutureMonth" class="text-center text-red-600 font-semibold mb-4">
      The evaluation of a future month is not allowed.
    </p>

    <div v-if="store.state.loading">
      <spinner></spinner>
    </div>

    <div v-else class="overflow-x-auto shadow-xl rounded-lg">
      <table class="w-full table-auto border-collapse bg-white">
        <thead>
          <tr class="bg-gradient-to-r from-blue-200 to-blue-300 text-gray-800">
            <th class="py-2 px-3 border text-sm font-semibold uppercase">ID</th>
            <th class="py-2 px-3 border text-sm font-semibold uppercase">Name</th>
            <th class="py-2 px-3 border text-sm font-semibold uppercase">Position</th>
            <th class="py-2 px-3 border text-sm font-semibold uppercase">Department</th>
            <th class="py-2 px-3 border text-sm font-semibold uppercase">Team</th>
            <th class="py-2 px-3 border text-sm font-semibold uppercase">Image</th>
            <th class="py-2 px-3 border text-sm font-semibold uppercase">Result (1 - 5)</th>
            <th class="py-2 px-3 border text-sm font-semibold uppercase">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="employees.length === 0">
            <td colspan="8" class="py-6 text-center text-gray-500">No leader to evaluate.</td>
          </tr>
          <tr v-for="employee in employees" :key="employee.id" class="even:bg-blue-50 odd:bg-white">
            <td class="py-1 px-3 border text-center text-gray-700 text-sm">{{ employee.id }}</td>
            <td class="py-1 px-3 border text-center text-gray-700 text-sm font-semibold">{{ employee.db_name }}</td>
            <td class="py-1 px-3 border text-center text-gray-700 text-sm">{{ employee.position_name }}</td>
            <td class="py-1 px-3 border text-center text-gray-700 text-sm uppercase">{{ employee.department_code }}</td>
            <td class="py-1 px-3 border text-center text-gray-700 text-sm">{{ employee.team_name }}</td>
            <td class="py-1 px-3 border text-center text-sm">
              <img
                v-if="employee.image_link"
                :src="updateImageLink(employee.image_link)"
                alt="Employee Image"
                class="h-12 w-12 rounded-full mx-auto border border-blue-200"
              />
            </td>
            <td class="py-1 px-3 border text-center text-sm font-bold" :class="employee.evaluated ? 'text-green-700' : 'text-red-500'">
              {{ employee.evaluated ? Number(employee.leadership_score).toFixed(2) : 'Not evaluated yet' }}
            </td>
            <td class="py-1 px-3 border text-center text-sm">
              <!-- a resigned employee or a submitted month can only be viewed -->
              <NuxtLink
                :to="{ path: `/leadership/leadership_evaluation/${employee.id}`, query: { year_month: yearMonth } }"
                class="px-2 py-2 text-white font-bold rounded"
                :class="employee.locked ? 'bg-gray-500 hover:bg-gray-600' : employee.evaluated ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-500 hover:bg-blue-600'"
              >
                {{ employee.locked ? 'View' : employee.evaluated ? 'Edit Evaluation' : 'Evaluate' }}
              </NuxtLink>
              <p v-if="employee.locked" class="text-xs text-gray-500 mt-1">Locked: {{ employee.locked_reason }}</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
// Leadership Performance menu: the leaders the logged in head evaluates (the GOM evaluates the CSD & Collection Manager,
// the manager the assistant managers and the Quality Analyst, an assistant manager his/her team leaders).
// 'department-layout' puts the page in the layout (sidebar/navbar) of the user's department.
import { computed, onMounted, watch } from 'vue'

definePageMeta({
  middleware: ['auth', 'department-layout', 'leadership-access'],
  // the home of the GOM (/gom) is the list of his managers
  alias: ['/gom'],
})

const authStore = useAuthStore()
authStore.fetchTokenFromLocalStore()
const currentUser = authStore.state.user

const route = useRoute()
const config = useRuntimeConfig()
const store = useLeadershipStore()

const today = new Date()
const currentYearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
const yearMonth = computed(() => route.query.year_month || currentYearMonth)
const isFutureMonth = computed(() => yearMonth.value > currentYearMonth)

const monthLabel = computed(() => {
  const [year, month] = yearMonth.value.split('-').map(Number)
  return `${new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'long' })} ${year}`
})

const pageTitle = computed(() => {
  const level = Number(currentUser.position_level)
  if (level === 15) return 'EVALUATE MANAGER'
  if (level === 10) return 'EVALUATE ASSISTANT MANAGERS'
  return 'EVALUATE TEAM LEADERS'
})

const employees = computed(() => store.state.employees)

const updateImageLink = (imageLink) => {
  if (!imageLink) return ''
  if (imageLink.startsWith('data:image') || /^https?:\/\//.test(imageLink)) return imageLink
  return `${config.public.imageBaseUrl}${imageLink.split('/').pop()}`
}

const load = () => store.fetchEmployees(yearMonth.value)

onMounted(load)
watch(() => route.query.year_month, load)
</script>
