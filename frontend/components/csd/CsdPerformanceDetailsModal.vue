<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div class="bg-gray-800 text-white p-6 rounded-lg w-full md:w-2/3 lg:w-1/2 h-auto overflow-auto">
      <div class="flex flex-col items-center">

        <img
          v-if="agent.image_link"
          :src="imageUrl(agent.image_link)"
          alt="Agent Image"
          class="w-40 h-40 rounded-full object-cover mb-4"
        />
        <div v-else class="w-40 h-40 bg-gray-300 rounded-full mb-4 flex items-center justify-center text-white">
          <span class="text-4xl">{{ agent.db_name }}</span>
        </div>

        <div class="text-center">
          <h3 class="text-3xl font-semibold">{{ agent.db_name }}</h3>
          <h3 class="text-xl font-semibold">EmployeeID: {{ agent.id }}</h3>
          <p class="text-lg font-bold" :class="csdRatingClass(agent.ratings_name) || setRatingNameColor(agent)">{{ agent.ratings_name }}</p>

          <div class="flex items-center justify-center mt-2">
            <template v-for="i in 5" :key="i">
              <svg xmlns="http://www.w3.org/2000/svg" :class="getStarClass(agent.final_ratings, i)" width="35" height="30" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
            </template>
          </div>

          <p class="text-3xl font-bold mt-2">{{ agent.final_ratings }}</p>
        </div>
        <p class="text-lg font-bold mt-2" v-if="agent.month">Month Of: {{ agent.month }}</p>
        <p class="text-lg font-bold mt-2">Year: {{ agent.year }}</p>

        <div class="mt-6 w-full overflow-x-auto">
          <table class="min-w-full table-auto">
            <thead>
              <tr>
                <th class="px-4 py-2 border bg-gray-800 text-white">Employee Status</th>
                <th class="px-4 py-2 border bg-gray-800 text-white">Position</th>
                <th class="px-4 py-2 border bg-gray-800 text-white">Team</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="px-4 py-2 font-semibold border text-center bg-gray-900">
                  <span :class="agent.employee_status === 'Resigned' ? 'text-red-500 font-bold' : 'text-green-500 font-bold'">{{ agent.employee_status }}</span>
                </td>
                <td class="px-4 py-2 font-semibold border bg-gray-900 text-gray-100 text-center">{{ agent.position_name }}</td>
                <td class="px-4 py-2 font-semibold border bg-gray-900 text-gray-100 text-center">{{ (agent.team_name || '').toUpperCase() }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- result -> score -> rating of each metric -->
        <div class="mt-6 w-full overflow-x-auto">
          <table class="min-w-full table-auto">
            <thead>
              <tr>
                <th class="px-4 py-2 border bg-gray-800 text-white">Metric</th>
                <th class="px-4 py-2 border bg-gray-800 text-white">Result</th>
                <th class="px-4 py-2 border bg-gray-800 text-white">Score</th>
                <th class="px-4 py-2 border bg-gray-800 text-white">Rating</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="metric in metrics" :key="metric.name">
                <td class="px-4 py-2 font-semibold border bg-gray-900 text-gray-100">{{ metric.name }}</td>
                <!-- the month is not submitted yet: the value is not counted, NO DATA in bold red -->
                <template v-if="metric.noData">
                  <td v-for="column in 3" :key="column" class="px-4 py-2 border bg-gray-900 text-center font-bold text-red-500">NO DATA</td>
                </template>
                <template v-else>
                  <td class="px-4 py-2 font-semibold border bg-gray-900 text-gray-100 text-center">
                    {{ metric.result }}
                    <span v-if="metric.description" class="block" :class="csdRatingClass(metric.description)">{{ metric.description }}</span>
                  </td>
                  <td class="px-4 py-2 font-semibold border bg-gray-900 text-gray-100 text-center">{{ metric.score }}</td>
                  <td class="px-4 py-2 font-semibold border bg-gray-900 text-gray-100 text-center">{{ metric.rating }}</td>
                </template>
              </tr>
              <tr>
                <td class="px-4 py-2 font-bold border bg-gray-700 text-white" colspan="3">Final Rating</td>
                <td class="px-4 py-2 font-bold border bg-gray-700 text-white text-center">{{ agent.final_ratings }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <button
          @click="$emit('close')"
          class="mt-6 text-blue-300 hover:text-blue-500 font-semibold hover:underline hover:scale-105 transition duration-300"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getStarClass } from '@/utils/constants'

// The details of an employee of the CSD Agent Monthly / Agent Yearly pages. For a year the agent is the year average
// (only the submitted months are in it), for a month that is not submitted the metrics are NO DATA.
const props = defineProps({
  show: { type: Boolean, default: false },
  agent: { type: Object, default: () => ({}) },
  fullyear: { type: Boolean, default: false },
})
defineEmits(['close'])

const config = useRuntimeConfig()
const { setRatingNameColor } = useRatingColor()

const imageUrl = (imageLink) => {
  if (!imageLink) return ''
  if (imageLink.startsWith('data:image') || /^https?:\/\//.test(imageLink)) return imageLink
  return `${config.public.imageBaseUrl}${imageLink.split('/').pop()}`
}

const metrics = computed(() => {
  const agent = props.agent
  const noData = !props.fullyear && agent.submitted != 1
  return [
    { name: 'PERFORMANCE (80%)', result: `${agent.performance}%`, description: agent.performance_description, score: agent.performance_score, rating: agent.performance_rating },
    // the leaders (position level 7 - 10): the Performance score is the average of the team score and the leadership score
    ...(agent.leadership_required && Number(agent.leadership_score) > 0
      ? [
          { name: '↳ Team Performance (score)', result: `${agent.performance}%`, score: agent.team_performance_score, rating: '' },
          { name: '↳ Leadership Performance (score)', result: '', score: Number(agent.leadership_score).toFixed(2), rating: '' },
        ]
      : []),
    { name: 'ABSENCES (5%)', noData, result: agent.absences, score: agent.absence_score, rating: agent.absence_rating },
    { name: 'TARDINESS (5%)', noData, result: agent.tardiness, score: agent.tardiness_score, rating: agent.tardiness_rating },
    { name: 'MEMO (5%)', noData, result: agent.memo, score: agent.memo_score, rating: agent.memo_rating },
    { name: 'FEEDBACK (5%)', noData, result: agent.feedback_score, score: agent.feedback_score, rating: agent.feedback_rating },
  ]
})
</script>

<style scoped>
.bg-gray-800 {
  max-height: 80vh;
  overflow-y: auto;
}
</style>
