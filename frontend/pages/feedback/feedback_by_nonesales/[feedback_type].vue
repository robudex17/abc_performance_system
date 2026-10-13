<template>
  <div>
    <div v-if="isFutureMonth" class="mt-24 text-center">
      <p class="text-2xl font-bold text-red-600">You cannot give feedback for a future month ({{ yearMonth }}).</p>
      <p class="text-gray-600 mt-2">Select the current month or an earlier month in the date picker.</p>
    </div>
    <!-- the questions come from useNoneSalesFeedbackQuestions -->
    <none-sales-feedback-form-component
      v-else-if="questions.length > 0"
      :questions="questions"
      :feedbackTitle="feedbackTitle"
      :feedbackSubtitle="feedbackSubtitle"
      :feedback="feedback"
      :feedbackType="feedbackType"
      :yearMonth="yearMonth"
      :whoReceiveName="who_receive_feedback_db_name"
      :whoGiveName="who_give_feedback_db_name"
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

import { onMounted, computed, watch } from 'vue'

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

// nobody can give feedback on behalf of another user
const isNotTheGiver = Number(currentUser.login_id) !== Number(who_give_feedback_id)
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
const { questions } = feedbackType === 'by_member'
  ? useNoneSalesFeedbackQuestions(0, 'lm_by_agent', currentUser.department_code)
  : useNoneSalesFeedbackQuestions(1, 'agent_by_lm', currentUser.department_code)

const feedbackStore = useFeedbackNoneSalesStore()

// the feedback already submitted for the selected month (empty list = not submitted yet)
const feedback = computed(() => feedbackStore.state[feedbackType] || [])

const feedbackQuery = () => ({
  feedback_type: feedbackType,
  who_give_feedback_id,
  year_month: yearMonth.value,
})

const fetchFeedback = async () => {
  feedbackStore.state[feedbackType] = []
  if (isFutureMonth.value || isNotTheGiver) return

  try {
    await feedbackStore.fetchNoneSalesFeedback(who_receive_feedback_id, feedbackQuery(), feedbackType)
  } catch (error) {
    alert(error.message)
  }
}

const addUpdateDeleteFeedback = async (feedbackResponse, httpMethod) => {
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

onMounted(fetchFeedback)

// a different month was picked in the navbar
watch(yearMonth, fetchFeedback)
</script>
