<template>
    <div>
      <h1 class="text-2xl font-bold mb-4 text-center">{{ agentFirstname }} {{ agentLastname }} (<span class="text-green-600">{{ agentId }}</span>) Employments and Assignments  Information</h1>    
      <div class="overflow-x-auto">
        <table class="w-full table-auto border-collapse bg-white">
          <thead class="bg-gradient-to-r from-blue-300 to-blue-300 text-gray-800">
            <tr>
              <!-- <th class="py-2 px-4 text-left text-sm font-medium text-green-900">Agent ID</th> -->
              <!-- <th class="py-2 px-4 text-left text-sm font-medium text-green-900">Name</th> -->
              <th class="py-2 px-4 text-center text-sm font-bold border">Employeee Status</th>
              <th class="py-2 px-4 text-center text-sm font-bold  border">Date Hired</th>
              <th class="py-2 px-4 text-center text-sm font-bold  border">Date Resigned</th>
              <!-- <th class="py-2 px-4 text-left text-sm font-medium text-green-900">Agent Type</th> -->
              <th class="py-2 px-4 text-center text-sm font-bold  border">Position</th>
              <!-- <th class="py-2 px-4 text-left text-sm font-medium text-green-900">Manager</th> -->
              <!-- <th class="py-2 px-4 text-left text-sm font-medium text-green-900">Market ID</th> -->
               <th class="py-2 px-4 text-center text-sm font-bold  border">Manager</th>
              <th class="py-2 px-4 text-center text-sm font-bold  border"> Market Assignment</th>
              <th class="py-2 px-4 text-center text-sm font-bold  border">Team Assignment</th>
              <th class="py-2 px-4 text-center text-sm font-bold  border">Assignment Date Start</th> 
              <th class="py-2 px-4 text-center text-sm font-bold  border">Assignment Date End</th>
              <!-- <th class="py-2 px-4 text-left text-sm font-medium text-green-900">Photo</th> -->
            </tr>
          </thead>
          <tbody>
            <tr 
              :key="agent.id" 
              v-for="(agent, index) in agents" 
           
              :class="['odd:bg-white', 'even:bg-green-50']">
              <!-- <td class="py-2 px-4 text-sm text-green-800">{{ agent.id }}</td> -->
              <!-- <td class="py-2 px-4 text-sm text-green-800 font-bold">{{ agent.firstname }} {{ agent.lastname }}</td> -->
              <td
                class="py-2 px-4 text-sm border text-center"
                :class="getStatusClass(setEmployeeStatus(agents, index))"
              >
                {{ setEmployeeStatus(agents, index) }}
              </td>
              <td class="py-2 px-4 text-sm border text-center"
        
              >{{ agent.start_date }} </td>
              <td class="py-2 px-4 text-sm  text-center border"
                  :class="agent.end_date ? 'text-red-600 font-bold' : 'text-green-600 font-bold'">
                {{ agent.end_date ? agent.end_date : 'Currently Employee' }}
              </td>
              <td class="py-2 px-4 text-sm  text-center  border ">{{ agent.agent_role }}</td>
              <td class="py-2 px-4 text-sm  text-center border" >{{ agent.manager_dbname }}</td>
              <td class="py-2 px-4 text-sm  text-center border font-bold">{{ agent.market_name.toUpperCase() }}</td>
              <td class="py-2 px-4 text-sm  text-center border font-bold">{{ agent.team_name.toUpperCase() }}</td>
              <td class="py-2 px-4 text-sm  text-center border">{{ agent.effective_from }}</td>
              <td class="py-2 px-4 text-sm  text-center border"
                  :class="agent.effective_to ? 'text-red-600  text-center font-bold' : 'text-green-600 font-bold text-center '">
                {{ agent.effective_to ? agent.effective_to : 'Currently Assign' }}
              </td>
              <!-- <td class="py-2 px-4 text-sm text-green-800">
                <div class="agent-photo">
                  <img v-if="agent.image_link" :src="updateImageLink(agent.image_link)" alt="Agent Photo" class="rounded-full w-12 h-12 object-cover">
                  <span v-else class="text-sm text-gray-500">No Photo</span>
                </div>
              </td>
   -->
            </tr>
          </tbody>
        </table>
      </div>
   </div> 
  </template>
  
  <script setup>
      import { ref,defineProps } from 'vue';

      const props = defineProps({
        agents: {
            type: Array,
            required: true,
        }

      });

      const agentFirstname = ref("")
      const agentLastname = ref("")
      const agentId = ref(0)

      if(props.agents.length != 0){
         agentFirstname.value = props.agents[0].firstname 
         agentLastname.value  = props.agents[0].lastname 
         agentId.value  = props.agents[0].id

      }

      const setEmployeeStatus = (agents, index) => {
        
         if(agents.length == 1 ){
           return agents[index].employee_status
         }
        
        let nextIndex = index + 1
         
          if(nextIndex >= agents.length){
              return agents[index].employee_status
          }

          // if(agents[index].employee_status === 'Resigned'){
          //     return 'Resigned'
          // }

          if(agents[index].employee_status === 'Rehired' && agents[nextIndex].employee_status === 'Resigned'){
              return 'Rehired'
          }

  
         if(agents[nextIndex].effective_to !== null && agents[index].agent_type > agents[nextIndex].agent_type){
            return 'Promoted'
         }

        if(agents[nextIndex].effective_to !== null && agents[index].agent_type < agents[nextIndex].agent_type){
            return 'Demoted'
         }

          if(agents[nextIndex].effective_to !== null ){
              return 'Transferred'
          }

          return agents[index].employee_status

      }

     const getStatusClass = (status) => {
        switch (status?.trim()) {
          case 'Hired':
          case 'Rehired':
            return 'text-green-600 font-bold'

          case 'Promoted':
            return 'text-blue-600 font-bold'

          case 'Demoted':
            return 'text-orange-500 font-bold'

          case 'Transferred':
            return 'text-purple-500 font-bold' // 💡 Suggestion: purple fits “movement/change”

          case 'Resigned':
            return 'text-red-600 font-bold'

          default:
            return ''
        }
      }
 
      

      const config = useRuntimeConfig()

      const updateImageLink = (imageLink) => {
        return `${config.public.imageBaseUrl}${imageLink}`
      }
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
  