<template>
  <div class="p-4 mt-20">

    <table class="table-auto border w-full">
      <thead>
        <tr class="bg-gray-200">
          <th class="p-2 border">Team</th>
          <th class="p-2 border">Target</th>
          <th class="p-2 border">Ship OK</th>
          <th class="p-2 border">Details</th>
        </tr>
      </thead>

      <tbody>
        <template v-for="team in teams" :key="team.teamId">
          <!-- Main Row -->
          <tr>
            <td class="p-2 border">{{ team.teamName }}</td>
            <td class="p-2 border">{{ team.teamTarget }}</td>
            <td class="p-2 border">{{ team.teamShipOK }}</td>

            <td class="p-2 border">
                <button 
                class="px-3 py-1 text-white rounded"
                :class="openTeamId === team.teamId ? 'bg-orange-500' : 'bg-blue-500'"
                @click="toggle(team.teamId)"
                >
                {{ openTeamId === team.teamId ? 'Hide Breakdown' : 'Show Breakdown' }}
                </button>
            </td>
          </tr>

          <!-- Breakdown Table with Transition -->
          <tr>
            <td colspan="4" class="border p-0">
              
              <Transition name="slide">
                <div v-if="openTeamId === team.teamId" class="breakdown-wrapper">

                  <table class="table-auto border w-full bg-gray-50">
                    <thead>
                      <tr class="bg-gray-300">
                        <th class="border p-2">Agent ID</th>
                        <th class="border p-2">Target</th>
                        <th class="border p-2">Ship OK</th>
                      </tr>
                    </thead>

                    <tbody>
                      <tr v-for="member in team.teamMember" :key="member.agentId">
                        <td class="border p-2">{{ member.agentId }}</td>
                        <td class="border p-2">{{ member.target }}</td>
                        <td class="border p-2">{{ member.shipok }}</td>
                      </tr>
                    </tbody>
                  </table>

                </div>
              </Transition>

            </td>
          </tr>

        </template>
      </tbody>
    </table>

  </div>
</template>

<script setup>
import { ref } from 'vue'

const teams = ref([
  {
    teamId: 1,
    teamName: 'Japan',
    teamTarget: 100,
    teamShipOK: 100,
    teamMember: [
      { agentId: 1, target: 25, shipok: 25 },
      { agentId: 2, target: 25, shipok: 25 },
      { agentId: 3, target: 25, shipok: 25 },
      { agentId: 4, target: 25, shipok: 25 }
    ]
  },
  {
    teamId: 2,
    teamName: 'Philippines',
    teamTarget: 80,
    teamShipOK: 60,
    teamMember: [
      { agentId: 7, target: 20, shipok: 15 },
      { agentId: 8, target: 20, shipok: 20 }
    ]
  }
])

const openTeamId = ref(null)

const toggle = (teamId) => {
  openTeamId.value = openTeamId.value === teamId ? null : teamId
}
</script>

<style scoped>
/* ⭐ Slide Down Animation */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  max-height: 500px; /* big enough to fit the table */
  transform: translateY(0);
}

/* Wrapper to ensure height animation works */
.breakdown-wrapper {
  padding: 0.5rem;
}
</style>
