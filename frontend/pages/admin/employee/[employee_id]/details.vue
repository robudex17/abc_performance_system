<template>
  <div class="p-4 mt-20">
    <div v-if="!loaded || detailsStore.state.loading">
      <Spinner />
    </div>

    <div v-else-if="bio.length > 0">
      <div class="mb-4">
        <button @click="router.back()" class="px-3 py-2 bg-gray-300 rounded hover:bg-gray-400 font-bold">
          &larr; Back
        </button>
      </div>

      <div class="p-4">
        <EmployeeBioComponent :records="bio" />
      </div>

      <div class="p-4 mt-5 mb-5">
        <NoneSalesFeedbackSummaryComponent
          :summary="feedback"
          :employee="employee"
          @passEnableDisableFeedback="enableDisableFeedback"
          @passDeleteFeedback="deleteFeedback"
        />
      </div>

      <div class="p-4 mt-5 mb-5">
        <NoneSalesAttendanceComponent
          attendanceType="absences"
          attendanceTitle="Employee Absences"
          :attendanceDetails="absences"
          :employee="employee"
          :defaultYearMonth="yearMonth"
          @passAttendance="addAttendance"
          @passUpdateAttendance="updateAttendance"
          @passDeleteAttendance="deleteAttendance"
        />
      </div>

      <div class="p-4 mt-5 mb-5">
        <NoneSalesAttendanceComponent
          attendanceType="tardiness"
          attendanceTitle="Employee Tardiness"
          :attendanceDetails="tardiness"
          :employee="employee"
          :defaultYearMonth="yearMonth"
          @passAttendance="addAttendance"
          @passUpdateAttendance="updateAttendance"
          @passDeleteAttendance="deleteAttendance"
        />
      </div>

      <div class="p-4 mt-5 mb-5">
        <NoneSalesAttendanceComponent
          attendanceType="memo"
          attendanceTitle="Employee Memo"
          :attendanceDetails="memo"
          :employee="employee"
          :defaultYearMonth="yearMonth"
          @passAttendance="addAttendance"
          @passUpdateAttendance="updateAttendance"
          @passDeleteAttendance="deleteAttendance"
        />
      </div>
    </div>

    <p v-else class="text-center text-gray-500 mt-10">Employee not found.</p>
  </div>
</template>

<script setup>
// Details of a none-sales employee (absences, tardiness, memo and feedback). Admin only.
// 'department-layout' puts the page in the layout of ?department_code (csd, collection, ...)
definePageMeta({
  middleware: ['auth', 'admin-only', 'department-layout'],
})

import { computed, onMounted, ref, watch } from 'vue'

const router = useRouter()
const route = useRoute()

const employeeId = route.params.employee_id
// read once: the date picker of the navbar replaces the query of the page
const departmentCode = route.query.department_code || ''

const detailsStore = useEmployeeDetailsStore()
const loaded = ref(false)   // false until the first load is done, so "Employee not found." does not flash

const today = new Date()
const currentYearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`

// everything on the page follows the month of the date picker of the navbar (YYYY-MM).
// When no month is selected the current month is used.
const yearMonth = computed(() => route.query.year_month || currentYearMonth)

const bio = computed(() => detailsStore.state.bio)
const absences = computed(() => detailsStore.state.absences)
const tardiness = computed(() => detailsStore.state.tardiness)
const memo = computed(() => detailsStore.state.memo)
const feedback = computed(() => detailsStore.state.feedback)

// the latest record of the history is the current employment and assignment
const employee = computed(() => bio.value[0] || {})

const loadMonthData = async () => {
  try {
    await Promise.all([
      detailsStore.fetchAttendance('absences', employeeId, yearMonth.value),
      detailsStore.fetchAttendance('tardiness', employeeId, yearMonth.value),
      detailsStore.fetchAttendance('memo', employeeId, yearMonth.value),
      detailsStore.fetchFeedbackSummary(employeeId, yearMonth.value),
    ])
  } catch (error) {
    alert(error.message)
  }
}

// run a change, tell the admin what happened and show the new data
const runAction = async (action, reload) => {
  try {
    alert(await action())
    await reload()
  } catch (error) {
    alert(error.message)
  }
}

const addAttendance = (type, form) =>
  runAction(
    () => detailsStore.addAttendance(type, employeeId, form),
    () => detailsStore.fetchAttendance(type, employeeId, yearMonth.value)
  )

const updateAttendance = (type, form) =>
  runAction(
    () => detailsStore.updateAttendance(type, employeeId, form),
    () => detailsStore.fetchAttendance(type, employeeId, yearMonth.value)
  )

const deleteAttendance = (type, month) =>
  runAction(
    () => detailsStore.deleteAttendance(type, employeeId, month),
    () => detailsStore.fetchAttendance(type, employeeId, yearMonth.value)
  )

const enableDisableFeedback = (data) =>
  runAction(
    () => detailsStore.enableDisableFeedbackUpdate(data),
    () => detailsStore.fetchFeedbackSummary(employeeId, yearMonth.value)
  )

const deleteFeedback = (data) =>
  runAction(
    () => detailsStore.deleteFeedback(data),
    () => detailsStore.fetchFeedbackSummary(employeeId, yearMonth.value)
  )

onMounted(async () => {
  try {
    await detailsStore.fetchBio(employeeId, departmentCode || 'none')
    await loadMonthData()
  } catch (error) {
    alert(error.message)
  } finally {
    loaded.value = true
  }
})

// another month was picked in the date picker of the navbar
watch(yearMonth, loadMonthData)
</script>
