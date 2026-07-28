<template>
    <div class="p-4 mt-20">
      <h1 class="text-3xl font-extrabold text-gray-800 mb-6 text-center">Local Manager Information</h1>
  

      <!-- Agents Table -->
      <div class="overflow-x-auto shadow-xl rounded-lg">
        <table class="w-full table-auto border-collapse bg-white">
          <thead>
            <tr class="bg-gradient-to-r from-blue-200 to-blue-300 text-gray-800">
              <th class="py-4 px-6 border font-semibold uppercase">ID</th>
              <th class="py-4 px-6 border font-semibold uppercase">Manager Name</th>
              <th class="py-4 px-6 border font-semibold uppercase">Agent Type</th>
              <th class="py-4 px-6 border font-semibold uppercase">First Name</th>
              <th class="py-4 px-6 border font-semibold uppercase">Last Name</th>
              <th class="py-4 px-6 border font-semibold uppercase">Database Name</th>
              <th class="py-4 px-6 border font-semibold uppercase">Market</th>
              <th class="py-4 px-6 border font-semibold uppercase">Image</th>
              <th class="py-4 px-6 border font-semibold uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="agent in paginatedAgents"
              :key="agent.id"
              class="even:bg-blue-50 odd:bg-white"
            >
              <td class="py-4 px-6 border text-center text-gray-700">
                {{ agent.id }}
              </td>
              <td class="py-4 px-6 border text-center text-gray-700">
                {{ agent.manager_name }}
              </td>
              <td class="py-4 px-6 border text-center text-gray-700">
                {{ agent.agent_type }}
              </td>
              <td class="py-4 px-6 border text-center text-gray-700">
                {{ agent.firstname }}
              </td>
              <td class="py-4 px-6 border text-center text-gray-700">
                {{ agent.lastname }}
              </td>
              <td class="py-4 px-6 border text-center text-gray-700">
                {{ agent.db_name }}
              </td>
              <td class="py-4 px-6 border text-center text-gray-700">
                {{ agent.market_name }}
              </td>
              <td class="py-4 px-6 border text-center">
                <img
                  :src="updateImageLink(agent.image_link)"
                  alt="Agent Image"
                  class="h-12 w-12 rounded-full mx-auto border border-blue-200"
                />
              </td>
              <td class="py-4 px-6 border text-center">
                <div class="flex justify-center space-x-2">
                  <NuxtLink 
                    :to="{
                      path: `/feedback/lm_feedback/${agent.id}` , query: { db_name: agent.db_name}
                      
                    }"
                    class="px-4 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600  disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Give Feedback
                  </NuxtLink>
             
            
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-4 flex justify-center space-x-4">
        <button
          v-for="page in totalPages"
          :key="page"
          class="px-4 py-2 border rounded"
          :class="{
            'bg-blue-500 text-white': currentPage === page,
            'bg-white text-gray-700': currentPage !== page,
          }"
          @click="currentPage = page"
        >
          {{ page }}
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  
  definePageMeta({
    middleware: ['auth']
  })
  
  import { ref, computed } from 'vue';
  import { onMounted } from 'vue';
  
  //get the current user
  const authStore = useAuthStore()
  authStore.fetchTokenFromLocalStore()
  
  const currentUser = authStore.state.user 
  let query;
  if (currentUser.role == 'manager' && currentUser.agent_type == 2){
    query = {give_feedback: 'lm'}
  }else if (currentUser.role == 'manager' && currentUser.agent_type == 1){
    query = { give_feedback: 'manager'}
  }
  

  const manageSalesAgentStore = useManageSalesAgentStore()
  
  
  const fetchSalesAgents = () => {
    manageSalesAgentStore.fetchSalesAgents(query);
  };
  
  const config = useRuntimeConfig()
  
  const updateImageLink = (imageLink) => {
        return `${config.public.imageBaseUrl}${imageLink}`
  }
 
 
  onMounted(() => {
    fetchSalesAgents();
    
  });
  
  const itemsPerPage = 10;
  const currentPage = ref(1);
  const isModalOpen = ref(false);
  const isModalOpenForLogin = ref(false)
  const  enablePasswordRecovery = ref(false)
  const editMode = ref(false); // Toggle between Add and Edit mode
  const editLoginMode = ref(false); // Toggle between Add and Edit mode for login
  const imagePreview = ref(null);
  

  

  const agents = computed(() => manageSalesAgentStore.state.salesAgents);

  const totalPages = computed(() =>
    Math.ceil(agents.value.length / itemsPerPage)
  )
  
  const paginatedAgents = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return agents.value.slice(start, end);
  });
  




  </script>
  