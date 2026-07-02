<template>
    <div >
        <h1 class="text-xl ml-20 pl-10 font-bold mb-2 mt-8">Metrics Summary</h1>
 
        <div class="overflow-x-auto mb-4">
          <table class=" border border-green-500 rounded-lg">
            <thead class="bg-green-300">
              <tr>
                <th class="py-2 px-4 text-left text-sm font-extrabold text-green-900 border ">Metrics Type</th>
                <th class="py-2 px-4 text-left text-sm font-extrabold text-green-900  border ">Count</th>
                <th class="py-2 px-4 text-left text-sm font-extrabold text-green-900  border " v-if="!fullyear">Month</th>
                <th class="py-2 px-4 text-left text-sm font-extrabold text-green-900  border ">Year</th>
                <th class="py-2 px-4 text-left text-sm font-extrabold text-green-900  border ">Score</th>
              </tr>
            </thead>
            <tbody v-for="agent in agents" :key="agent.id">
              <tr>
                <td class="py-2 px-4 text-sm text-green-800 font-semibold  border ">ShipOk</td>
                 <td class="py-2 px-4 text-sm text-green-800  font-semibold  border ">{{ agent.shipok  }}</td>
                <td class="py-2 px-4 text-sm text-green-800  font-semibold  border " v-if="!fullyear">{{ agent.month }}</td>
                <td class="py-2 px-4 text-sm text-green-800  font-semibold  border ">{{ agent.year }}</td>
                <td class="py-2 px-4 text-sm text-green-800  font-semibold  border ">{{ agent.shipok_score }}</td>
              </tr>
              <tr>
                <td class="py-2 px-4 text-sm text-green-800 font-semibold  border ">New Deposit</td>
                <td class="py-2 px-4 text-sm text-green-800  font-semibold  border ">{{ agent.deposit_score  || 0}} </td>
                <td class="py-2 px-4 text-sm text-green-800  font-semibold  border " v-if="!fullyear">{{ agent.month }}</td>
                <td class="py-2 px-4 text-sm text-green-800  font-semibold  border ">{{ agent.year }}</td>
                <td class="py-2 px-4 text-sm text-green-800  font-semibold  border ">{{ agent.additional_points  || 0}} </td>
              </tr>
              <tr>
                <td class="py-2 px-4 text-sm text-green-800 font-semibold  border ">Absences</td>
                <td class="py-2 px-4 text-sm text-green-800  font-semibold  border ">{{ agent.absences}}</td>
                <td class="py-2 px-4 text-sm text-green-800  font-semibold  border " v-if="!fullyear">{{ agent.month }}</td>
                <td class="py-2 px-4 text-sm text-green-800  font-semibold  border ">{{ agent.year }}</td>
                <td class="py-2 px-4 text-sm text-green-800  font-semibold  border ">{{ agent.absence_score  }}</td>
              </tr>
              <tr>
                <td class="py-2 px-4 text-sm text-green-800 font-semibold  border ">Tardiness</td>
                <td class="py-2 px-4 text-sm text-green-800  font-semibold  border ">{{ agent.tardiness }}</td>
                <td class="py-2 px-4 text-sm text-green-800  font-semibold  border " v-if="!fullyear">{{ agent.month }}</td>
                <td class="py-2 px-4 text-sm text-green-800  font-semibold  border ">{{ agent.year }}</td>
                <td class="py-2 px-4 text-sm text-green-800  font-semibold  border ">{{ agent.tardiness_score }}</td>
              </tr>
              <tr>
                <td class="py-2 px-4 text-sm text-green-800 font-semibold  border ">Memo</td>
                <td class="py-2 px-4 text-sm text-green-800  font-semibold  border ">{{ agent.memo }}</td>
                <td class="py-2 px-4 text-sm text-green-800  font-semibold  border " v-if="!fullyear">{{ agent.month }}</td>
                <td class="py-2 px-4 text-sm text-green-800  font-semibold  border ">{{ agent.year }}</td>
                <td class="py-2 px-4 text-sm text-green-800  font-semibold  border ">{{ agent.memo_score }}</td>
              </tr>
              <tr>
                <td class="py-2 px-4 text-sm text-green-800 font-semibold  border ">Feedback</td>
                <td class="py-2 px-4 text-sm text-green-800  font-semibold  border ">{{ agent.feedback_score }}</td>
                <td class="py-2 px-4 text-sm text-green-800  font-semibold  border " v-if="!fullyear">{{ agent.month }}</td>
                <td class="py-2 px-4 text-sm text-green-800  font-semibold  border ">{{ agent.year }}</td>
                <td class="py-2 px-4 text-sm text-green-800  font-semibold  border ">{{ agent.feedback_score }}</td>
              </tr>
            </tbody>
          </table>
        </div>
  

    </div>
  </template>
  
  <script setup>
  
  const props = defineProps({
            agents : {
                type: Array
            },
            fullyear: {
              type: Boolean,
              required: true
            }
        })
    const metrics = ref([
      {
        type: 'SHIPOK',
        count: 100,
        month: 'May',
        year: 2025,
        score: 4
      },
      {
        type: 'New Deposit',
        count: 100,
        month: 'May',
        year: 2025,
        score: 4
      }

    ]);

   
  </script>
  
  <style>
  /* Add custom styles if needed */
  </style>
  