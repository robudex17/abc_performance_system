<template>
  <div v-for="item in data" :key="item.market_id" class="mb-6">
    <v-card>
      <v-card-title>
        {{ item.market }} - {{ item.sales_target }}
        <v-btn
          size="small"
          class="ml-2"
          @click="toggleTable(item.market_id)"
        >
          {{ showTable[item.market_id] ? 'Hide Breakdown' : 'Show Breakdown' }}
        </v-btn>
      </v-card-title>

      <v-card-text v-if="showTable[item.market_id]">
        <table class="table table-bordered">
          <thead>
            <tr>
              <th>Team</th>
              <th>Team Target</th>
              <th>Sales</th>
              <th>Remaining</th>
              <th>%</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="team in transformTeamMembers(item.team_members)"
              :key="team.team"
            >
              <td>{{ team.team }}</td>
              <td>{{ team.team_target }}</td>
              <td>{{ team.sales }}</td>
              <td>{{ team.remaining }}</td>
              <td>{{ team.percentage }}%</td>
            </tr>
          </tbody>
        </table>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const data = ref([])
const showTable = ref({})

onMounted(async () => {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/users')
    const users = await response.json()

    // Mock data format
    data.value = users.map((user, index) => ({
      market_id: index + 1,
      market: user.address.city,
      sales_target: 1000 + index * 100,
      team_members: [
        {
          team: `${user.company.name} Team A`,
          team_target: 500,
          sales: Math.floor(Math.random() * 500)
        },
        {
          team: `${user.company.name} Team B`,
          team_target: 500,
          sales: Math.floor(Math.random() * 500)
        }
      ]
    }))
  } catch (error) {
    console.error('Fetch error:', error)
  }
})

// Toggle specific market_id visibility
function toggleTable(marketId) {
  showTable.value[marketId] = !showTable.value[marketId]
}

// Add remaining and percentage
function transformTeamMembers(members) {
  return members.map(member => {
    const remaining = member.team_target - member.sales
    const percentage = ((member.sales / member.team_target) * 100).toFixed(2)
    return { ...member, remaining, percentage }
  })
}
</script>

<style scoped>
.table {
  width: 100%;
  border-collapse: collapse;
}
.table th,
.table td {
  padding: 8px;
  text-align: center;
}
</style>
