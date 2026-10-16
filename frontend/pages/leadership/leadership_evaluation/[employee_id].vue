<template>
  <div class="p-4 mt-20">
    <div class="flex items-center justify-between mb-4">
      <button class="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded font-semibold" @click="backToList">&larr; Back to the list</button>
      <h1 class="text-2xl font-extrabold text-gray-800 text-center">LEADERSHIP INDIVIDUAL PERFORMANCE</h1>
      <span class="w-32"></span>
    </div>

    <div v-if="store.state.loading && tasks.length === 0">
      <spinner></spinner>
    </div>

    <template v-else>
      <!-- who is evaluated -->
      <div v-if="employee" class="bg-white shadow rounded-lg p-4 mb-4 flex items-center gap-4">
        <img v-if="employee.image_link" :src="updateImageLink(employee.image_link)" alt="Employee Image" class="h-16 w-16 rounded-full border border-blue-200" />
        <div>
          <p class="text-xl font-bold text-gray-800">{{ employee.db_name }}</p>
          <p class="text-gray-600">{{ employee.position_name }} - {{ (employee.department_code || '').toUpperCase() }} - {{ employee.team_name }}</p>
          <p class="text-gray-600">Month: <span class="font-semibold">{{ monthLabel }}</span></p>
        </div>
        <div class="ml-auto text-right">
          <p class="text-sm text-gray-500">Result (average of the scores)</p>
          <p class="text-3xl font-extrabold text-blue-700">{{ average }}</p>
        </div>
      </div>
      <p v-else class="text-red-600 font-semibold mb-4">You are not allowed to evaluate this employee, or the employee is not found for {{ monthLabel }}.</p>

      <p v-if="isFutureMonth" class="text-red-600 font-semibold mb-4">The evaluation of a future month is not allowed.</p>
      <p v-if="employee && employee.locked" class="text-yellow-700 font-semibold mb-4">
        {{ employee.locked_reason === 'Resigned'
          ? 'This employee is resigned: the evaluation can only be viewed.'
          : 'The CSD Evaluation of this employee is submitted: the evaluation can only be viewed. The admin has to click Review first.' }}
      </p>
      <p v-if="store.state.error" class="text-red-600 font-semibold mb-4">{{ store.state.error }}</p>

      <!-- TASK | KEY PERFORMANCE INDICATORS | SCORE | COMMENTS -->
      <div v-if="employee" class="overflow-x-auto shadow-xl rounded-lg">
        <table class="w-full table-fixed border-collapse bg-white">
          <thead>
            <tr class="bg-gradient-to-r from-blue-200 to-blue-300 text-gray-800">
              <th class="py-2 px-3 border text-sm font-semibold uppercase w-1/5">Task</th>
              <th class="py-2 px-3 border text-sm font-semibold uppercase w-1/4">Key Performance Indicators</th>
              <th class="py-2 px-3 border text-sm font-semibold uppercase w-1/6">Score</th>
              <th class="py-2 px-3 border text-sm font-semibold uppercase">
                Comments
                <span class="block text-xs font-semibold normal-case">(explain the reason for giving the score)</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <template v-for="task in tasks" :key="task.task">
            <tr v-if="answers[task.task]" class="even:bg-blue-50 odd:bg-white align-top">
              <td class="py-2 px-3 border text-sm font-bold text-gray-800">{{ task.task }}</td>
              <td class="py-2 px-3 border text-sm text-gray-700">{{ task.indicators }}</td>
              <td class="py-2 px-3 border text-center">
                <select
                  v-model="answers[task.task].score"
                  :disabled="readOnly"
                  class="w-full border rounded px-2 py-1 bg-white"
                >
                  <option value="">Select</option>
                  <option v-for="item in scores" :key="item.score" :value="item.score">{{ item.label }}</option>
                </select>
              </td>
              <td class="py-2 px-3 border">
                <textarea
                  v-model="answers[task.task].comment"
                  :disabled="readOnly"
                  rows="3"
                  maxlength="1000"
                  placeholder="Explain the score"
                  class="w-full border rounded px-2 py-1 text-sm"
                ></textarea>
              </td>
            </tr>
            </template>
          </tbody>
        </table>
      </div>

      <div v-if="employee" class="flex justify-center gap-4 my-6">
        <button
          v-if="!readOnly"
          @click="save"
          :disabled="store.state.loading"
          class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg disabled:bg-gray-400"
        >
          {{ store.state.evaluation ? 'Update Evaluation' : 'Save Evaluation' }}
        </button>
        <button
          v-if="!readOnly && store.state.evaluation"
          @click="remove"
          :disabled="store.state.loading"
          class="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg disabled:bg-gray-400"
        >
          Delete Evaluation
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
// The leadership evaluation form of one leader: a SCORE (drop down) and a COMMENT for every task.
// The employee comes from the path, the month from the date picker of the navbar. The backend checks that the logged in user is
// the head of the employee and that the month is not submitted (the evaluation is locked after the CSD Evaluation is submitted).
import { computed, reactive, onMounted, watch } from 'vue'

definePageMeta({
  middleware: ['auth', 'department-layout', 'leadership-access'],
})

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const store = useLeadershipStore()

const employeeId = route.params.employee_id

const today = new Date()
const currentYearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
const yearMonth = computed(() => route.query.year_month || currentYearMonth)
const isFutureMonth = computed(() => yearMonth.value > currentYearMonth)
const monthLabel = computed(() => {
  const [year, month] = yearMonth.value.split('-').map(Number)
  return `${new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'long' })} ${year}`
})

const tasks = computed(() => store.state.tasks)
const scores = computed(() => store.state.scores)

// the evaluated leader (from the list of the leaders of the head)
const employee = computed(() => store.state.employees.find(item => String(item.id) === String(employeeId)) ?? null)

// the answers: { 'Task name': { score, comment } }
const answers = reactive({})
const fillAnswers = () => {
  const saved = store.state.evaluation?.responses ?? []
  for (const task of store.state.tasks) {
    const found = saved.find(item => item.task === task.task)
    answers[task.task] = { score: found ? found.score : '', comment: found ? found.comment : '' }
  }
}

// a future month can not be evaluated
// a future month, a resigned employee and a submitted month can only be viewed (the backend refuses the changes too)
const readOnly = computed(() => isFutureMonth.value || Boolean(employee.value?.locked))

const average = computed(() => {
  const given = Object.values(answers).map(item => Number(item.score)).filter(score => score > 0)
  return given.length ? (given.reduce((sum, score) => sum + score, 0) / given.length).toFixed(2) : '0.00'
})

const updateImageLink = (imageLink) => {
  if (!imageLink) return ''
  if (imageLink.startsWith('data:image') || /^https?:\/\//.test(imageLink)) return imageLink
  return `${config.public.imageBaseUrl}${imageLink.split('/').pop()}`
}

const backToList = () => router.push({ path: '/leadership/leadership_evaluation', query: { year_month: yearMonth.value } })

const load = async () => {
  await store.fetchTasks(employeeId, yearMonth.value)
  await store.fetchEmployees(yearMonth.value)
  await store.fetchEvaluation(employeeId, yearMonth.value)
  fillAnswers()
}

const buildResponses = () => store.state.tasks.map(task => ({
  task: task.task,
  score: Number(answers[task.task].score),
  comment: String(answers[task.task].comment || '').trim(),
}))

const save = async () => {
  // every task needs a score and a comment (the backend checks it too)
  for (const task of store.state.tasks) {
    const answer = answers[task.task]
    if (!answer.score) return alert(`Please select the score of "${task.task}"`)
    if (!String(answer.comment || '').trim()) return alert(`Please write the comment of "${task.task}"`)
  }

  const method = store.state.evaluation ? 'PUT' : 'POST'
  const saved = await store.saveEvaluation(employeeId, yearMonth.value, buildResponses(), method)

  if (saved) {
    alert('Leadership evaluation is saved')
    await load()
  } else {
    alert(store.state.error)
  }
}

const remove = async () => {
  if (!window.confirm('Delete this leadership evaluation?')) return

  if (await store.deleteEvaluation(employeeId, yearMonth.value)) {
    alert('Leadership evaluation is deleted')
    backToList()
  } else {
    alert(store.state.error)
  }
}

onMounted(load)
// the month is changed in the navbar
watch(() => route.query.year_month, load)
</script>
