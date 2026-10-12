<template>
  <div class="p-4 mt-20">
    <h1 class="text-3xl font-extrabold text-gray-800 mb-2 text-center">{{ pageTitle }}</h1>
    <p class="text-center text-gray-600 mb-6">{{ pageSubtitle }}</p>

    <div class="overflow-x-auto shadow-xl rounded-lg">
      <table class="w-full table-auto border-collapse bg-white">
        <thead>
          <tr class="bg-gradient-to-r from-blue-200 to-blue-300 text-gray-800">
            <th class="py-2 px-3 border text-sm font-semibold uppercase">ID</th>
            <th class="py-2 px-3 border text-sm font-semibold uppercase">Position</th>
            <th class="py-2 px-3 border text-sm font-semibold uppercase">First Name</th>
            <th class="py-2 px-3 border text-sm font-semibold uppercase">Last Name</th>
            <th class="py-2 px-3 border text-sm font-semibold uppercase">Database Name</th>
            <th class="py-2 px-3 border text-sm font-semibold uppercase">Team</th>
            <th class="py-2 px-3 border text-sm font-semibold uppercase">Image</th>
            <th class="py-2 px-3 border text-sm font-semibold uppercase">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="employees.length === 0">
            <td colspan="8" class="py-6 text-center text-gray-500">{{ emptyMessage }}</td>
          </tr>
          <tr
            v-for="employee in employees"
            :key="employee.id"
            class="even:bg-blue-50 odd:bg-white"
          >
            <td class="py-1 px-3 border text-center text-gray-700 text-sm">{{ employee.id }}</td>
            <td class="py-1 px-3 border text-center text-gray-700 text-sm">{{ employee.position_name }}</td>
            <td class="py-1 px-3 border text-center text-gray-700 text-sm">{{ employee.firstname }}</td>
            <td class="py-1 px-3 border text-center text-gray-700 text-sm">{{ employee.lastname }}</td>
            <td class="py-1 px-3 border text-center text-gray-700 text-sm">{{ employee.db_name }}</td>
            <td class="py-1 px-3 border text-center text-gray-700 text-sm">{{ employee.team_name }}</td>
            <td class="py-1 px-3 border text-center text-sm">
              <img
                v-if="employee.image_link"
                :src="updateImageLink(employee.image_link)"
                alt="Employee Image"
                class="h-12 w-12 rounded-full mx-auto border border-blue-200"
              />
            </td>
            <td class="py-1 px-3 border text-center text-sm">
              <NuxtLink
                :to="{
                  path: `/feedback/feedback_by_nonesales/${feedbackType}`,
                  query: {
                    who_receive_feedback_id: employee.id,
                    who_receive_feedback_db_name: employee.db_name,
                    who_give_feedback_id: currentUser.login_id,
                    who_give_feedback_db_name: currentUser.db_name || `${currentUser.firstname} ${currentUser.lastname}`,
                    feedback_type: feedbackType,
                  },
                }"
                class="px-2 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600"
              >
                Give Feedback
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
// 'department-layout' puts the page in the layout (sidebar/navbar) of the user's department
definePageMeta({
  middleware: ['auth', 'department-layout', 'feedback-by-nonesales'],
})

import { computed, watch, onMounted } from 'vue'

const authStore = useAuthStore()
authStore.fetchTokenFromLocalStore()
const currentUser = authStore.state.user

const route = useRoute()
const config = useRuntimeConfig()

const employeesStore = useManageEmployeesStore()
const employees = computed(() => employeesStore.state.employees)

// by_member -> member rates his/her immediate head
// by_head   -> head rates his/her members
const feedbackType = computed(() => route.query.feedback_type)

const pageTitle = computed(() =>
  feedbackType.value === 'by_member' ? 'FEEDBACK HEAD' : 'FEEDBACK MEMBERS'
)
const pageSubtitle = computed(() =>
  feedbackType.value === 'by_member'
    ? 'Rate your immediate head.'
    : 'Rate your members.'
)
const emptyMessage = computed(() =>
  feedbackType.value === 'by_member'
    ? 'No immediate head found.'
    : 'No members found.'
)

const fetchEmployees = () => {
  employeesStore.fetchEmployees(
    { feedback_type: feedbackType.value },
    currentUser.department_code
  )
}

const updateImageLink = (imageLink) => {
  if (!imageLink) return ''
  if (imageLink.startsWith('data:image') || /^https?:\/\//.test(imageLink)) return imageLink
  return `${config.public.imageBaseUrl}${imageLink}`
}

onMounted(fetchEmployees)

// FEEDBACK HEAD and FEEDBACK MEMBERS are the same page: refetch when the query changes
watch(() => route.query.feedback_type, fetchEmployees)
</script>
