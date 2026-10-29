<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100 p-4 mt-20">
    <div class="w-full max-w-5xl bg-white shadow-lg rounded-lg p-6">
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
        <!-- feedback given with the questions of an older form: its answers do not belong to these competencies -->
        <p v-if="oldFormNotice" class="mb-4 p-3 rounded bg-amber-100 text-amber-900 text-sm font-medium text-center">{{ oldFormNotice }}</p>

        <!-- the score table format (like the performance evaluation): COMPETENCY (title and description) and SCORE, no comment -->
        <div v-if="isScoreTable" class="overflow-x-auto">
          <p class="text-gray-600 text-sm mb-3 text-center">Rate each item from 1 to 5. 5 is the highest and 1 is the lowest.</p>
          <table class="w-full min-w-[520px] border-collapse border border-gray-400 text-sm">
            <thead>
              <tr class="bg-gray-100">
                <th class="w-12 border border-gray-400 py-2"></th>
                <th class="border border-gray-400 py-2 px-3 text-center font-bold tracking-wide">COMPETENCY</th>
                <th class="w-32 border border-gray-400 py-2 px-3 text-center font-bold tracking-wide">SCORE</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(question, index) in questions" :key="question.id">
                <td class="border border-gray-400 py-2 text-center text-lg font-medium text-gray-800 align-middle">{{ index + 1 }}</td>
                <td class="border border-gray-400 py-2 px-3 text-gray-900">
                  <p v-if="question.title" class="font-bold uppercase">{{ question.title }}</p>
                  <p>{{ question.description }}</p>
                </td>
                <td class="border border-gray-400 py-2 px-3 text-center align-middle">
                  <select
                    v-model.number="responses[question.id]"
                    :disabled="viewOnly"
                    :aria-label="`Score: ${question.title || question.description}`"
                    class="w-full border rounded px-2 py-2 text-center text-lg font-semibold bg-white disabled:bg-gray-100 disabled:text-gray-700"
                  >
                    <option :value="null" disabled>-</option>
                    <option v-for="choice in question.choices" :key="choice.score" :value="choice.score">{{ choice.score }}</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- one row per question, one radio button per answer under its label (the scores are not shown) -->
        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr>
                <th class="w-2/5"></th>
                <th v-for="choice in answerLabels" :key="choice.score" class="py-3 px-2 text-center font-normal text-gray-700">{{ choice.label }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(question, index) in questions" :key="question.id" class="odd:bg-gray-100">
                <td class="py-3 px-3 text-gray-800">{{ index + 1 }}. {{ question.text }}</td>
                <td v-for="choice in question.choices" :key="choice.score" class="text-center">
                  <label class="flex items-center justify-center py-3" :class="viewOnly ? 'cursor-default' : 'cursor-pointer'">
                    <input
                      type="radio"
                      :name="`question-${question.id}`"
                      :value="choice.score"
                      v-model="responses[question.id]"
                      :disabled="viewOnly"
                      :aria-label="`${choice.label}: ${question.text}`"
                      class="h-5 w-5 accent-blue-600"
                    />
                  </label>
                </td>
              </tr>
            </tbody>
          </table>
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

// the labels of the header row: the answers of the first question (every question has the same answers)
const answerLabels = computed(() => props.questions[0]?.choices ?? [])

// the score table format: the questions are made for it (layout 'table': the competencies, or statements shown as a table)
const isScoreTable = computed(() => props.questions.length > 0 && props.questions.every(question => question.layout === 'table'))

// a feedback that exists but has no answer for these questions was given with an older form (the saved score is still valid)
const oldFormNotice = computed(() => {
  if (props.feedback.length === 0) return ''
  const hasAnAnswer = props.questions.some(question => responses.value[question.id] != null)
  if (hasAnAnswer) return ''
  return `This feedback was given with the previous questionnaire, its answers are not shown here. Its saved score is ${Number(props.feedback[0].feedback_score).toFixed(4)}.`
})

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
