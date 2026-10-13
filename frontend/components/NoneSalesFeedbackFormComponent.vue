<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100 p-4 mt-20">
    <div class="w-full max-w-3xl bg-white shadow-lg rounded-lg p-6">
      <h2 class="text-2xl font-semibold text-gray-800 text-center">
        {{ feedbackTitle }} FOR
        <span class="uppercase text-blue-700 font-bold">
          ({{ whoReceiveName }}) by <span class="text-purple-700">{{ whoGiveName }}</span>
        </span>
      </h2>
      <p class="text-gray-600 text-center">{{ feedbackSubtitle }}</p>
      <p class="text-red-600 text-center mb-6 font-bold text-2xl">For {{ monthLabel.toUpperCase() }}</p>
      <h2 v-if="viewOnly" class="text-center text-red-600 font-bold text-2xl mb-4">(VIEW ONLY)</h2>

      <form @submit.prevent="submitFeedback">
        <div v-for="(question, index) in questions" :key="question.id" class="mb-4 p-4 border rounded-lg bg-gray-50">
          <p class="text-gray-700 font-medium">{{ index + 1 }}. {{ question.text }}</p>

          <div class="mt-2 flex justify-between space-x-4">
            <label
              v-for="choice in question.choices"
              :key="choice.score"
              class="w-full flex flex-col items-center border rounded-lg py-2 px-4 transition"
              :class="[
                viewOnly ? 'cursor-default' : 'cursor-pointer hover:bg-gray-200',
                responses[question.id] === choice.score ? 'bg-blue-300 border-blue-700' : 'border-gray-300'
              ]"
            >
              <input
                type="radio"
                :name="`question-${question.id}`"
                :value="choice.score"
                v-model="responses[question.id]"
                :disabled="viewOnly"
                class="hidden"
              />
              <span class="text-lg font-medium" :class="responses[question.id] === choice.score ? 'text-red-500' : 'text-gray-700'">{{ choice.label }}</span>
              <span class="text-xs text-gray-500" :class="responses[question.id] === choice.score ? 'text-green-300 font-bold' : 'text-gray-700'">({{ choice.score }} pts)</span>
            </label>
          </div>
        </div>

        <div class="mt-6">
          <p class="text-gray-700 font-medium">Feedback Score: <span class="text-purple-400 font-bold">{{ feedbackScore }}</span></p>
          <p class="text-gray-700 font-medium">Total Score: {{ totalScore }} / {{ maxPossibleScore }}</p>
          <p class="text-gray-700 font-medium">Feedback Percentage: {{ percentage }}%</p>

          <div class="w-full bg-gray-200 h-4 rounded-lg overflow-hidden mt-2">
            <div class="h-full bg-blue-500 transition-all" :style="{ width: percentage + '%' }"></div>
          </div>
        </div>

        <button
          v-if="!viewOnly"
          type="submit"
          class="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md transition"
        >
          {{ isUpdating ? 'Update Feedback' : 'Submit Feedback' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
// Feedback form for the none-sales departments. Same look as FeedbackFormComponent (sales), but:
//  - the month shown follows the yearMonth prop (YYYY-MM), not the month/year query of the sales pages
//  - "Submit" or "Update" follows the feedback prop, so it also works when the month is changed
//  - the names come as props, the page adds the ids to the emitted data
import { ref, computed, watch } from 'vue'

const props = defineProps({
  questions: { type: Array, required: true },
  feedbackTitle: { type: String, required: true },
  feedbackSubtitle: { type: String, required: true },
  // feedback already submitted for the month (empty array when there is none)
  feedback: { type: Array, required: true },
  feedbackType: { type: String, required: true },
  yearMonth: { type: String, required: true },
  whoReceiveName: { type: String, default: '' },
  whoGiveName: { type: String, default: '' },
  // admin / poweruser open the feedback of somebody else only to look at it
  viewOnly: { type: Boolean, default: false },
})

const emit = defineEmits(['passFeedbackData'])

const responses = ref({})
const isUpdating = computed(() => props.feedback.length > 0)

const monthLabel = computed(() => {
  const [year, month] = props.yearMonth.split('-').map(Number)
  return `${new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'long' })} ${year}`
})

// start from the submitted answers, or from empty answers when there is no feedback for the month
watch(
  () => [props.questions, props.feedback],
  () => {
    const submitted = props.feedback.length > 0 ? props.feedback[0].responses : null

    responses.value = props.questions.reduce((acc, question) => {
      acc[question.id] = submitted && submitted[question.id] != null ? submitted[question.id] : null
      return acc
    }, {})
  },
  { immediate: true, deep: true }
)

const totalScore = computed(() =>
  Object.values(responses.value).reduce((acc, score) => acc + (score || 0), 0)
)

const maxPossibleScore = computed(() =>
  props.questions.reduce((total, question) => total + Math.max(...question.choices.map(choice => choice.score)), 0)
)

const percentage = computed(() =>
  maxPossibleScore.value ? ((totalScore.value / maxPossibleScore.value) * 100).toFixed(4) : '0.0000'
)

const feedbackScore = computed(() =>
  props.questions.length ? parseFloat((totalScore.value / props.questions.length).toFixed(4)) : 0
)

const submitFeedback = () => {
  if (props.viewOnly) {
    alert('View Only Mode. Cannot perform update')
    return
  }

  const allQuestionsAnswered = props.questions.every(question => responses.value[question.id] != null)

  if (!allQuestionsAnswered) {
    alert('Please answer all questions before submitting.')
    return
  }

  if (isUpdating.value && props.feedback[0].can_update == 0) {
    alert('You are not allowed to update or change your response, if you want to update it please contact your manager')
    return
  }

  emit(
    'passFeedbackData',
    {
      responses: responses.value,
      total_score: totalScore.value,
      percentage: percentage.value,
      feedback_score: feedbackScore.value,
      feedback_type: props.feedbackType,
    },
    isUpdating.value ? 'PUT' : 'POST'
  )
}
</script>
