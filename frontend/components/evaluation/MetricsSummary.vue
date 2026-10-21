<template>
  <div>
    <h1 class="text-xl ml-20 pl-10 font-bold mb-2 mt-8">Metrics Summary</h1>

    <div class="overflow-x-auto mb-4">
      <table class="border border-green-500 rounded-lg">
        <thead class="bg-green-300">
          <tr>
            <th class="py-2 px-4 text-left text-sm font-extrabold text-green-900 border">Metrics Type</th>
            <th class="py-2 px-4 text-left text-sm font-extrabold text-green-900 border">Count</th>
            <th class="py-2 px-4 text-left text-sm font-extrabold text-green-900 border" v-if="!fullyear">Month</th>
            <th class="py-2 px-4 text-left text-sm font-extrabold text-green-900 border">Year</th>
            <th class="py-2 px-4 text-left text-sm font-extrabold text-green-900 border">Score</th>
          </tr>
        </thead>
        <tbody v-for="agent in agents" :key="agent.id">
          <tr v-for="metric in metricsOf(agent)" :key="metric.name">
            <td class="py-2 px-4 text-sm text-green-800 font-semibold border">{{ metric.name }}</td>
            <td class="py-2 px-4 text-sm text-green-800 font-semibold border">{{ metric.count }}</td>
            <td class="py-2 px-4 text-sm text-green-800 font-semibold border" v-if="!fullyear">{{ agent.month }}</td>
            <td class="py-2 px-4 text-sm text-green-800 font-semibold border">{{ agent.year }}</td>
            <td class="py-2 px-4 text-sm text-green-800 font-semibold border">{{ metric.score }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
// The metrics of the CSD staff (same idea as the sales Metrics Summary): count / result and the score of each one.
// fullyear: the agent is the year average, there is no month.
defineProps({
  agents: { type: Array, default: () => [] },
  fullyear: { type: Boolean, default: false },
})

// up to 5 decimals (the averages have 5)
const five = (value) => Number(Number(value).toFixed(5))

// a leader (position level 7 - 10) whose leadership evaluation is answered: INDIV PERF, LEAD PERF and the AVESCORE (the average of the two scores)
const hasLeadership = (agent) => Boolean(agent.leadership_required) && Number(agent.leadership_score) > 0

const metricsOf = (agent) => [
  { name: 'Indiv Perf (%)', count: agent.performance, score: five(hasLeadership(agent) ? agent.team_performance_score : agent.performance_score) },
  ...(hasLeadership(agent)
    ? [
        { name: 'Lead Perf (Score)', count: '-', score: five(agent.leadership_score) },
        { name: 'AveScore (Performance 80%)', count: '-', score: five(agent.performance_score) },
      ]
    : []),
  { name: 'Absences', count: agent.absences, score: agent.absence_score },
  { name: 'Tardiness', count: agent.tardiness, score: agent.tardiness_score },
  { name: 'Memo', count: agent.memo, score: agent.memo_score },
  { name: 'Feedback', count: agent.feedback_score, score: agent.feedback_score },
]
</script>
