<template>
    <div>
    <h1 class="text-2xl font-bold mb-4 text-center">Feedback By Senior Manager</h1> 
    <div v-if="lms.length == 0">
        <p class="text-lg text-red-800 font-bold text-center">No Currrent Feedback</p>
    </div>   
    <div class="overflow-x-auto" v-else>

      <table class="min-w-full border border-green-500 rounded-lg">
        <thead class="bg-green-200">
          <tr>
            <th class="py-2 px-4 text-left text-sm font-medium text-green-900">LM ID</th>
            <th class="py-2 px-4 text-left text-sm font-medium text-green-900">LM DBNAME</th>
            <th class="py-2 px-4 text-left text-sm font-medium text-green-900">MANAGER ID </th>
            <th class="py-2 px-4 text-left text-sm font-medium text-green-900">MANAGER DBNAME</th>
            <th class="py-2 px-4 text-left text-sm font-medium text-green-900">DATE</th>
            <th class="py-2 px-4 text-left text-sm font-medium text-green-900">MONTH</th>
            <th class="py-2 px-4 text-left text-sm font-medium text-green-900">YEAR</th>
            <th class="py-2 px-4 text-left text-sm font-medium text-green-900">FEEDBACK SCORE</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            :key="lm.id" 
            v-for="lm in lms" 
            :class="['odd:bg-white', 'even:bg-green-50']">
            <td class="py-2 px-4 text-sm text-green-800">{{ lm.lm_id }}</td>
            <td class="py-2 px-4 text-sm text-green-800 font-bold">{{ lm.lm_dbname }}</td>
            <td class="py-2 px-4 text-sm text-green-800">{{ lm.manager_id }}</td>
            <td class="py-2 px-4 text-sm text-green-800 uppercase font-bold">{{lm.manager_dbname }}</td>
            <td class="py-2 px-4 text-sm text-green-800">{{ lm.date }}</td>
            <td class="py-2 px-4 text-sm text-green-800">{{ lm.month }}</td>
            <td class="py-2 px-4 text-sm text-green-800">{{ lm.year }}</td>
            <td class="py-2 px-4 text-sm text-purple-800 font-bold" > {{ lm.feedback_score }}</td>
 
          </tr>
        </tbody>
      </table>
    </div>
   </div> 
  </template>
  
  <script setup>
      import { ref,defineProps } from 'vue';
      
      const props = defineProps({
        lms: {
            type: Array,
            required: true,
        }
      });
      
  </script>
  
  <style scoped>
      .status {
        font-weight: bold;
      }
      
      .status.active {
        color: #4caf50;
      }
      
      .status.inactive {
        color: #f44336;
      }
      
      .agent-photo {
        display: flex;
        justify-content: center;
        align-items: center;
      }
      
      .agent-photo img {
        width: 3rem;
        height: 3rem;
        object-fit: cover;
      }
      
      .agent-photo span {
        font-size: 0.875rem;
        color: #777;
      }
  </style>
  