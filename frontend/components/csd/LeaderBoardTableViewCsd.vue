<template>
  <div>
    <div class="overflow-x-auto" id="print-table">

      <!-- Table view of the CSD leaderboard (agent and team leader), same columns as the Excel export -->
      <table class="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr class="bg-green-600 text-white">
            <th colspan="7" class="border border-gray-300 px-1 py-0.5">Employee Employments And Assignments</th>
            <th colspan="3" class="border border-gray-300 px-2 py-0.5 text-xs text-center">Performance (80%)</th>
            <th colspan="3" class="border border-gray-300 px-2 py-0.5">Attendance (10%)</th>
            <th colspan="3" class="border border-gray-300 px-2 py-0.5">Memo and Feedback (10%)</th>
            <th colspan="2" class="px-1 py-0.5"></th>
          </tr>
          <tr class="bg-green-600 text-white">
            <th class="border border-gray-300 px-1 py-0.5 text-center text-xs font-bold">Year</th>
            <th class="border border-gray-300 px-1 py-0.5 text-center text-xs font-bold">Month</th>
            <th class="border border-gray-300 px-1 py-0.5 text-center text-xs font-bold">Employee Name</th>
            <th class="border border-gray-300 px-1 py-0.5 text-center text-xs font-bold">Employee Status</th>
            <th class="border border-gray-300 px-1 py-0.5 text-center text-xs font-bold">Position</th>
            <th class="border border-gray-300 px-1 py-0.5 text-center text-xs font-bold">Immediate Head</th>
            <th class="border border-gray-300 px-1 py-0.5 text-center text-xs font-bold">Team</th>
            <th class="border border-gray-300 px-1 py-0.5 text-center text-xs font-bold">Result (%)</th>
            <th class="border border-gray-300 px-1 py-0.5 text-center text-xs font-bold">Score</th>
            <th class="border border-gray-300 px-1 py-0.5 text-center text-xs font-bold">Total</th>
            <th class="border border-gray-300 px-1 py-0.5 text-center text-xs font-bold">Absences-score</th>
            <th class="border border-gray-300 px-1 py-0.5 text-center text-xs font-bold">Tardiness-score</th>
            <th class="border border-gray-300 px-1 py-0.5 text-center text-xs font-bold">Total</th>
            <th class="border border-gray-300 px-1 py-0.5 text-center text-xs font-bold">Memo-score</th>
            <th class="border border-gray-300 px-1 py-0.5 text-center text-xs font-bold">Feedback-score</th>
            <th class="border border-gray-300 px-1 py-0.5 text-center text-xs font-bold">Total</th>
            <th class="border border-gray-300 px-1 py-0.5 text-center text-xs font-bold">Grand Total</th>
            <th class="border border-gray-300 px-1 py-0.5 text-center text-xs font-bold">Rating</th>
          </tr>
        </thead>
        <tbody>
          <tr class="odd:bg-green-50 even:bg-white" v-for="agent in agents" :key="agent.id">
            <td class="border border-gray-300 px-2 py-0.5 text-xs text-center">{{ agent.year }}</td>
            <td class="border border-gray-300 px-2 py-0.5 text-xs text-center">{{ agent.month }}</td>
            <td class="border border-gray-300 px-2 py-0.5 capitalize text-xs text-center">
              {{ agent.db_name }} <span v-if="agent.tag">- (<span class="font-bold text-purple-500">{{ agent.tag }}</span>)</span>
            </td>
            <td class="border border-gray-300 px-2 py-0.5 text-xs text-center"
              :class="agent.employee_status == 'Resigned' ? 'text-red-500 font-bold' : 'font-bold text-green-500'"
            >{{ agent.employee_status }}</td>
            <td class="border border-gray-300 px-2 py-0.5 text-xs text-center">{{ agent.position_name }}</td>
            <td class="border border-gray-300 px-2 py-0.5 capitalize text-xs text-center">{{ agent.manager_dbname }}</td>
            <td class="border border-gray-300 px-2 py-0.5 capitalize text-xs text-center">{{ agent.team_name }}</td>
            <td class="border border-gray-300 px-2 py-0.5 text-xs text-center">{{ agent.performance }}</td>
            <td class="border border-gray-300 px-2 py-0.5 text-xs text-center">{{ agent.performance_score }}</td>
            <td class="border border-gray-300 px-2 py-0.5 text-xs text-center">{{ agent.performance_rating }}</td>
            <td class="border border-gray-300 px-2 py-0.5 text-xs text-center">{{ agent.absence_score }}</td>
            <td class="border border-gray-300 px-2 py-0.5 text-xs text-center">{{ agent.tardiness_score }}</td>
            <td class="border border-gray-300 px-2 py-0.5 text-xs text-center">{{ totalTheRating(agent.absence_rating, agent.tardiness_rating) }}</td>
            <td class="border border-gray-300 px-2 py-0.5 text-xs text-center">{{ agent.memo_score }}</td>
            <td class="border border-gray-300 px-2 py-0.5 text-xs text-center">{{ agent.feedback_score }}</td>
            <td class="border border-gray-300 px-2 py-0.5 text-xs text-center">{{ totalTheRating(agent.memo_rating, agent.feedback_rating) }}</td>
            <td class="border border-gray-300 px-2 py-0.5 text-xs text-center font-bold">{{ agent.final_ratings }}</td>
            <td class="border border-gray-300 px-2 py-0.5 font-bold text-xs text-center" :class="setRatingNameColor(agent)">{{ agent.ratings_name }}</td>
          </tr>
        </tbody>
      </table>

    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  agents: {
    type: Array,
    default: () => [],
  },
})

const totalTheRating = (rating1, rating2) => {
  const total = Number(rating1) + Number(rating2)
  return total.toFixed(4)
}

const setRatingNameColor = (agent) => {
  switch (agent.ratings_name) {
    case 'EXCEPTIONAL': return 'text-purple-700'
    case 'VERY SATISFACTORY': return 'text-blue-700'
    case 'SATISFACTORY': return 'text-green-700'
    case 'NEEDS IMPROVEMENT': return 'text-yellow-700'
    case 'POOR': return 'text-red-700'
    case 'INCOMPLETE RATING': return 'text-orange-600'
  }
}
</script>

<style scoped>
/* Ensure text resizes to fit within the cells */
table {
  table-layout: auto;
}
th, td {
  font-size: 0.875rem; /* Tailwind's text-sm */
}
</style>
