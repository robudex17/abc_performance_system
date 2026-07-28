<template>
  <div class="grid grid-cols-1 gap-4 p-4 mt-20">

    <div v-if="customSeachStore.state.loading">
      <spinner></spinner>
    </div>

    <div v-else>
      <div v-if=" data.length > 0">
        <p class="text-gray-800 font-bold text-3xl mb-2 text-center">
          {{ filterBy.toUpperCase() }} TARGET
        </p>
              
        <!-- Export Button OUTSIDE table -->
        <div class="w-full flex justify-end mb-2">
          <export-to-excel-component
            v-if="isAdmin && data?.length > 0"
            :exportUrl="exportUrl"
            :exportFileName="exportFileName"
            :query="query"
            :token="token"
           
            class=" !text-white !text-[10px] !px-2 !py-1 !rounded
                  !hover:bg-green-600 !transition-all !duration-200 shadow"
          />
        </div>
        <table class="w-full table-auto border-collapse bg-white">
          <thead>
            <tr class="bg-gradient-to-r from-blue-200 to-blue-300 text-gray-800 text-xs">
              <th class="py-2 px-2 border text-center font-bold"  v-if="filterBy != 'team' && filterBy !='overall' ">ID</th>
              <th class="py-2 px-2 border text-center font-bold"  v-if="filterBy != 'team' && filterBy !='overall'">Name</th>
              <th class="py-2 px-2 border text-center font-bold"  v-if="filterBy != 'team' && filterBy !='overall'">Employee Status</th>
              <th class="py-2 px-2 border text-center font-bold"  v-if="filterBy != 'team' ">Market</th>
              <th class="py-2 px-2 border text-center font-bold">Team</th>
              <th class="py-2 px-2 border text-center font-bold">Month</th>
              <th class="py-2 px-2 border text-center font-bold">Year</th>
              <th class="py-2 px-2 border text-center font-bold" >Target</th>
              <th class="py-2 px-2 border text-center font-bold" >Shipok</th>
              <th class="py-2 px-2 border text-center font-bold" >Percentage(%)</th>
              <th class="py-2 px-1 border text-center font-bold">Remaining Units</th>
              <th class="py-2 px-2 border text-center font-bold" v-if="filterBy == 'overall'">Target <span class="text-red-500">(No Truck)</span></th>
              <th class="py-2 px-2 border text-center font-bold" v-if="filterBy == 'overall'">Shipok <span class="text-red-500">(No Truck)</span></th>
              <th class="py-2 px-2 border text-center font-bold" v-if="filterBy == 'overall'">Percentage(%) <span class="text-red-500">(No Truck)</span></th>
              <th class="py-2 px-1 border text-center font-bold" v-if="filterBy == 'overall'">Remaining Units <span class="text-red-500">(No Truck)</span></th>
              <th class="py-2 px-2 border text-center font-bold" v-if="filterBy == 'team'">Team Mambers</th>
              <th class="py-2 px-2 border text-center font-bold" v-if="filterBy == 'overall'">Team</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="agent in paginatedAgents" :key="uniqueKey(agent)">
              <!-- MAIN ROW -->
              <tr class="even:bg-blue-50 odd:bg-white">
                
                <td class="py-1 px-2 border text-center" v-if="filterBy != 'team' && filterBy != 'overall'">
                  {{ agent.id }}
                </td>

                <td class="py-1 px-2 border text-center" v-if="filterBy != 'team' && filterBy != 'overall'">
                  <div class="flex items-center space-x-2">
                    <img
                      v-if="agent.image_link"
                      :src="updateImageLink(agent.image_link)"
                      alt="Agent Image"
                      class="w-9 h-9 rounded-full object-cover shadow"
                    />
                    <span>{{ agent.db_name }}</span>
                  </div>
                </td>

                <td v-if="filterBy != 'team' && filterBy != 'overall'"
                  class="py-1 px-2 border text-center"
                  :class="{
                    'text-red-600 font-bold': agent.employee_status === 'Resigned',
                    'text-green-600 font-bold': agent.employee_status === 'Hired' || agent.employee_status === 'Rehired'
                  }"
                >
                  {{ agent.employee_status }}
                </td>

                <td class="py-1 px-2 border text-center" v-if="filterBy != 'team'">
                  {{ agent.market_name?.toUpperCase?.() ?? '' }}
                </td>

                <td class="py-1 px-2 border text-center">{{ agent.team_name }}</td>
                <td class="py-1 px-2 border text-center">{{ agent.month }}</td>
                <td class="py-1 px-2 border text-center">{{ agent.year }}</td>
                <td class="py-1 px-2 border text-center font-bold">{{ agent.target }}</td>
                <td class="py-1 px-2 border text-center font-bold">{{ agent.shipok }}</td>

                <td class="py-1 px-2 border text-center font-bold">
                  {{ getWholeNumberPercentage(agent.target, agent.shipok) }}
                </td>

                <td
                  class="py-1 px-2 border text-center font-bold"
                  :class="(agent.target - agent.shipok) >= 0 ? 'text-red-600 border' : 'text-green-600'"
                >
                  {{ agent.target - agent.shipok }}
                </td>

                <td class="py-1 px-2 border text-center font-bold" v-if="filterBy == 'overall'">{{ agent.target_without_trucks }}</td>
                <td class="py-1 px-2 border text-center font-bold" v-if="filterBy == 'overall'">{{ agent.shipok_without_trucks }}</td>

                <td class="py-1 px-2 border text-center font-bold" v-if="filterBy == 'overall'">
                  {{ getWholeNumberPercentage(agent.target_without_trucks, agent.shipok_without_trucks) }}
                </td>

                <td
                  class="py-1 px-2 border text-center font-bold" v-if="filterBy == 'overall'"
                  :class="(agent.target_without_trucks - agent.shipok_without_trucks) >= 0 ? 'text-red-600 border' : 'text-green-600'"
                >
                  {{ agent.target_without_trucks - agent.shipok_without_trucks }}
                </td>                

                <!-- BUTTON -->
                <td v-if="filterBy == 'team' || filterBy == 'overall'" class="py-1 px-2 border text-center font-bold">
                  <button 
                    class="px-3 py-0 text-white rounded transition"
                    :class="uniqueKey(agent) === openRowId ? 'bg-orange-500' : 'bg-blue-500'"
                    @click="toggle(uniqueKey(agent))"
                  >
                    {{ uniqueKey(agent) === openRowId ? 'Hide Breakdown' : 'Show Breakdown' }}
                  </button>
                </td>
              </tr>

              <!-- BREAKDOWN ROW -->
              <tr v-if="uniqueKey(agent) === openRowId">
              <td :colspan=" filterBy === 'team'  ? 11   : filterBy === 'overall'  ? 7  : 12 " class="border p-0">

                  <Transition name="slide">
                    <div v-if="uniqueKey(agent) === openRowId" class="breakdown-wrapper">
                      <table class="table-auto border w-full bg-gray-50">
                        <thead>
                            <tr class="bg-red-400 text-white text-xs py-1">
                              <th class=" px-2 border text-center font-bold text-xs text-white" v-if="filterBy === 'team'">ID</th>
                              <th class=" px-2 border text-center font-bold text-xs" v-if="filterBy === 'team'" >Name</th>
                              <th class=" px-2 border text-center font-bold text-xs" v-if="filterBy === 'team'">Employee Status</th>
                              <th class=" px-2 border text-center font-bold text-xs" v-if="filterBy === 'team'" >Market</th>
                              <th class=" px-2 border text-center font-bold text-xs">Team</th>
                              <th class=" px-2 border text-center font-bold text-xs">Month</th>
                              <th class=" px-2 border text-center font-bold text-xs">Year</th>
                              <th class=" px-2 border text-center font-bold text-xs">Target</th>
                              <th class=" px-2 border text-center font-bold text-xs">Shipok</th>
                              <th class=" px-2 border text-center font-bold text-xs">Percentage(%)</th>
                            
                              <th class=" px-1 border text-center font-bold">
                                <div class="flex items-center justify-center gap-2">
                                  <span>Remaining Units</span>
                                </div>
                              </th>
                        
                            </tr>
                        </thead>
                        <tbody>


                        <tr v-for="member in agent.teammembers" :key="member.id" class="even:bg-red-50 odd:bg-white ext-white text-xs py-1"  >
                          
                          <td class="py-1 px-2 border text-center" v-if="filterBy === 'team'">
                            {{ member.id }}
                          </td>

                          <td class="py-1 px-2 border text-center" v-if="filterBy === 'team'">
                            <div class="flex items-center space-x-2">
                              <img
                                v-if="member.image_link"
                                :src="updateImageLink(member.image_link)"
                                alt="Agent Image"
                                class="w-9 h-9 rounded-full object-cover shadow"
                              />
                              <span>{{ member.db_name }}</span>
                            </div>
                          </td>

                          <td v-if="filterBy === 'team'"
                            class="py-1 px-2 border text-center"
                            :class="{
                              'text-red-600 font-bold': member.employee_status === 'Resigned',
                              'text-green-600 font-bold': member.employee_status === 'Hired' || member.employee_status === 'Rehired'
                            }"
                          >
                            {{ member.employee_status }}
                          </td>

                          <td class="py-1 px-2 border text-center"  v-if="filterBy === 'team'">
                            {{ member.market_name?.toUpperCase?.() ?? '' }}
                          </td>

                          <td class="py-1 px-2 border text-center">{{ member.team_name }}</td>
                          <td class="py-1 px-2 border text-center">{{ member.month }}</td>
                          <td class="py-1 px-2 border text-center">{{ member.year }}</td>
                          <td class="py-1 px-2 border text-center font-bold">{{ member.target }}</td>
                          <td class="py-1 px-2 border text-center font-bold">{{ member.shipok }}</td>

                          <td class="py-1 px-2 border text-center font-bold">
                            {{ getWholeNumberPercentage(member.target, member.shipok) }}
                          </td>

                          <td
                            class="py-1 px-2 border text-center font-bold"
                            :class="(member.target - member.shipok) >= 0 ? 'text-red-600 border' : 'text-green-600'"
                          >
                            {{ member.target - member.shipok }}
                          </td>

                 
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


        <!-- ✅ Pagination -->
        <div
          v-if="totalPages > 1"
          class="mt-4 flex justify-center space-x-4 mb-2"
        >
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

      <div v-else class="text-red-700 font-bold text-5xl text-center">
        No Available Data.
      </div>
    </div>
  </div>
</template>

<script setup>
    definePageMeta({
      middleware: ['auth']
    })

    import { ref, computed, onMounted, watch } from 'vue'
    import { useRouter, useRoute } from 'vue-router'
    import API from '~/utils/api'

    import { months, getWholeNumberPercentage } from '@/utils/constants'
   
    const authStore = useAuthStore()
    authStore.fetchTokenFromLocalStore()

    const router = useRouter()
    const route = useRoute()
    const currentUser = authStore.state.user
    const token = authStore.state.token
    
    const isAdmin = ref(false)
    const query = ref('')
    const filterBy = ref('')
    const filterId = ref('')
    const openRowId = ref(null)

  
    filterBy.value = route.query.filterBy 
    filterId.value = route.query.filterId
    query.value = route.query

    const exportUrl = API.export.custom_search_target_export
    const searchType = route.params.search_type


    // month.value = route.query.month || months[new Date().getMonth()]
    // year.value = route.query.year || new Date().getFullYear()

    // Store
    const customSeachStore = useCustomSearchStore()
    const data = computed(() => customSeachStore.state.customSearch)

    // ✅ Pagination
    const itemsPerPage = ref(10)
    const currentPage = ref(1)

    const totalPages = computed(() =>
      Math.ceil(data.value.length / itemsPerPage.value)
    )

    const paginatedAgents = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return data.value?.slice(start, end)
    })

    if (currentUser.role == 'poweruser' || currentUser.role == 'admin' ) {
         isAdmin.value = true
    }

    const exportFileName = computed(() => {

      if(route.query.start_date && route.query.end_date){
            const [ start_year, start_month] = route.query.start_date.split("-")
            const [ end_year,  end_month ] = route.query.end_date.split("-")
        
        return `${months[Number(start_month) -1]}${start_year}-${months[Number(end_month)-1]}${end_year}-target.xlsx`
      }
      
        return `NoFilename-target.xlsx`
       

    })

    //Unique combo for each row

    const uniqueKey = (team) => `${team?.team_id}-${team?.month}-${team?.year}`

    const toggle = (rowId) => {
         openRowId.value = openRowId.value === rowId ? null : rowId
    }


    // ✅ Fetch function (clears old data properly)
    const fetchCustomSearchData = async (searchType, query) => {
      customSeachStore.state.customSearch = [] // clear before fetch
      customSeachStore.state.loading = true
      await customSeachStore.fetchCustomSearch(searchType, query)
      customSeachStore.state.loading = false
      currentPage.value = 1 // reset pagination
    }

    // ✅ Config for image URL
    const config = useRuntimeConfig()
    const updateImageLink = (imageLink) => {
      return `${config.public.imageBaseUrl}${imageLink}`
    }

    // ✅ Initial fetch
    onMounted(() => {
      // fetchCustomSearchData(searchType, route.query)
       customSeachStore.state.customSearch = []
      
    })



    // ✅ Watch route change only when query changes
    watch(
      () => route.fullPath,
      (newRoute, oldRoute) => {
        if (newRoute !== oldRoute) {
          
          fetchCustomSearchData(searchType, route.query)
           query.value = route.query
           filterBy.value = route.query.filterBy 
           filterId.value = route.query.filterId
        }
      }
    )




    // ✅ Reset page when data changes
    watch(data, () => {
      currentPage.value = 1
    })


</script>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

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
