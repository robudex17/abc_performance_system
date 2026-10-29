<template>
  <div>
    <div v-if="isFutureMonth" class="mt-24 text-center">
      <p class="text-2xl font-bold text-red-600">You cannot give feedback for a future month ({{ yearMonth }}).</p>
      <p class="text-gray-600 mt-2">Select the current month or an earlier month in the date picker.</p>
    </div>
    <!-- admin / poweruser can open a feedback only to view it: nothing to show when it was deleted -->
    <p v-else-if="isViewer && feedbackLoaded && feedback.length === 0" class="mt-24 text-center text-2xl font-bold text-red-600">
      No feedback was submitted for {{ yearMonth }}.
    </p>
    <!-- the questions come from useNoneSalesFeedbackQuestions -->
    <none-sales-feedback-form-component
      v-else-if="questions.length > 0 && (!isViewer || feedbackLoaded) && receiverLevelLoaded"
      :questions="questions"
      :feedbackTitle="feedbackTitle"
      :feedbackSubtitle="feedbackSubtitle"
      :feedback="feedback"
      :feedbackType="feedbackType"
      :yearMonth="yearMonth"
      :whoReceiveName="who_receive_feedback_db_name"
      :whoGiveName="who_give_feedback_db_name"
      :viewOnly="isViewer"
      @passFeedbackData="addUpdateDeleteFeedback"
    />
    <p v-else class="mt-24 text-center text-gray-500">No feedback questions found for this department.</p>
  </div>
</template>

<script setup>
// Give feedback (none-sales departments). NOT the sales page: it uses the none-sales store, questions and form.
//   by_member: the member rates his/her immediate head
//   by_head  : the immediate head rates his/her member
// 'department-layout' puts the page in the layout (sidebar/navbar) of the user's department
definePageMeta({
  middleware: ['auth', 'department-layout', 'feedback-by-nonesales'],
})

import { onMounted, computed, ref, watch } from 'vue'

const router = useRouter()
const route = useRoute()

const authStore = useAuthStore()
authStore.fetchTokenFromLocalStore()
const currentUser = authStore.state.user

const feedbackType = route.params.feedback_type

// read once: the navbar date picker replaces the query of the page, these must survive it
const { who_receive_feedback_id, who_receive_feedback_db_name, who_give_feedback_id, who_give_feedback_db_name } = route.query

// feedback is given once a month (YYYY-MM). The month follows the date picker of the navbar.
const today = new Date()
const currentYearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
const yearMonth = computed(() => route.query.year_month || currentYearMonth)

// no feedback for a month that has not started yet (YYYY-MM strings compare correctly as text)
const isFutureMonth = computed(() => yearMonth.value > currentYearMonth)

const backToList = () =>
  router.push({
    path: '/feedback/feedback_by_nonesales',
    query: { feedback_type: feedbackType },
  })

// A feedback is confidential: only the one who gives it can fill it in or change it.
// admin and poweruser can open it only to VIEW it (the middleware feedback-by-nonesales lets them in).
const isViewer = ['admin', 'poweruser'].includes(currentUser.role)
const feedbackLoaded = ref(false)    // the answers of the month were loaded (a viewer sees the form only with them)

const isNotTheGiver = !isViewer && Number(currentUser.login_id) !== Number(who_give_feedback_id)
if (isNotTheGiver) {
  alert(`You are not allowed to give or update feedback on ${who_give_feedback_db_name}'s behalf`)
  backToList()
}

const feedbackTitle = feedbackType === 'by_member' ? 'IMMEDIATE HEAD FEEDBACK EVALUATION' : 'MEMBER FEEDBACK EVALUATION'
const feedbackSubtitle = feedbackType === 'by_member'
  ? 'Rate your immediate head based on the following questions.'
  : 'Rate your member based on the following questions.'

// same questions the composable holds for every none-sales department
// by_member: member (agentType 0) rates the head -> 'lm_by_agent'
// by_head  : head   (agentType 1) rates the member -> 'agent_by_lm'
// The questions are the ones of the department of the feedback. The staff gives feedback in his/her own department
// (the token), but admin and poweruser are not in that department: for them the link carries it (?department_code=).
const questionsDepartment = isViewer
  ? (route.query.department_code || currentUser.department_code)
  : currentUser.department_code

// The leadership competency is asked only when the member who is rated is a leader (assistant team leader, team leader, assistant
// manager). The one who gives the feedback gets the position of the member from the server (the address can not hide the question),
// the admin (view only) gets it in the link of the details page.
const receiverLevel = ref(isViewer ? (Number(route.query.who_receive_position_level) || null) : null)
const receiverLevelLoaded = ref(isViewer || feedbackType !== 'by_head')

const { questions } = feedbackType === 'by_member'
  ? useNoneSalesFeedbackQuestions(0, 'lm_by_agent', questionsDepartment)
  : useNoneSalesFeedbackQuestions(1, 'agent_by_lm', questionsDepartment, receiverLevel)

const feedbackStore = useFeedbackNoneSalesStore()
const employeesStore = useManageEmployeesStore()

// the members of the head (the same list as the page before this one)
const loadReceiverLevel = async () => {
  if (receiverLevelLoaded.value || isNotTheGiver) return

  await employeesStore.fetchEmployees({ feedback_type: 'by_head' }, currentUser.department_code)
  const member = employeesStore.state.employees.find(employee => Number(employee.id) === Number(who_receive_feedback_id))

  if (!member) {
    alert('Cannot read the position of the member, please try again.')
    backToList()
    return
  }

  receiverLevel.value = Number(member.position_level)
  receiverLevelLoaded.value = true
}

// the feedback already submitted for the selected month (empty list = not submitted yet)
const feedback = computed(() => feedbackStore.state[feedbackType] || [])

const feedbackQuery = () => ({
  feedback_type: feedbackType,
  who_give_feedback_id,
  year_month: yearMonth.value,
})

const fetchFeedback = async () => {
  feedbackStore.state[feedbackType] = []
  feedbackLoaded.value = false
  if (isFutureMonth.value || isNotTheGiver) return

  try {
    await feedbackStore.fetchNoneSalesFeedback(who_receive_feedback_id, feedbackQuery(), feedbackType)
  } catch (error) {
    alert(error.message)
  } finally {
    feedbackLoaded.value = true
  }
}

const addUpdateDeleteFeedback = async (feedbackResponse, httpMethod) => {
  if (isViewer) {
    alert('View Only Mode. Cannot perform update')
    return
  }

  if (isFutureMonth.value) {
    alert('You cannot give feedback for a future month')
    return
  }

  feedbackResponse.who_give_feedback_id = who_give_feedback_id
  feedbackResponse.who_receive_feedback_id = who_receive_feedback_id
  feedbackResponse.date = `${yearMonth.value}-${String(today.getDate()).padStart(2, '0')}`
  feedbackResponse.year_month = yearMonth.value

  await feedbackStore.addUpdateDeleteFeedback(
    who_receive_feedback_id,
    feedbackResponse,
    feedbackType,
    feedbackQuery(),
    httpMethod
  )

  // the store keeps the error instead of throwing: stay on the form when saving failed
  if (feedbackStore.state.error) {
    alert(feedbackStore.state.error)
    return
  }

  backToList()
}

onMounted(async () => {
  await loadReceiverLevel()
  await fetchFeedback()
})

// a different month was picked in the navbar
watch(yearMonth, fetchFeedback)
</script>
