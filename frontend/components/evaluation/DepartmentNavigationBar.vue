<template>
    <div>
        <header class="bg-white shadow-md flex items-center justify-between gap-6 px-6 py-4 fixed left-[304px] right-0">
          <!-- Brand -->
          <div class="flex items-center gap-6 min-w-0">
              <div class="text-lg font-bold whitespace-nowrap">SBTPH {{ view.label.toUpperCase() }} APP</div>
              <!-- Dropdown for manage sales agent -->
              <div v-if="route.path == employeesPath" class="flex items-center gap-2">
         
                <select 
                  class="px-2 py-1 border  font-bold text-sm rounded bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                 v-model="employementStatus"
                >
              
                <option class="text-green-500 font-bold" value="Hired">ACTIVE</option>
                <option  class="text-red-500 font-bold" value="Resigned">RESIGNED</option>

                </select>
                <button  
                  class="px-2 py-1 bg-blue-500 text-white rounded font-bold text-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  @click="fetchCsdEmployees"
                >
                  Submit
                </button>
              </div> 
              <!-- Custom Range: the start month, the end month and the employee status (the pattern of the sales custom search: the bar changes the url) -->
              <div
                v-else-if="isCustomRangePage"
                class="flex items-center gap-3"
              >
                <div v-if="isCustomRangeList" class="flex items-center gap-2">
                  <label for="range-status" class="text-xs font-medium text-gray-700 whitespace-nowrap">Status:</label>
                  <select
                    id="range-status"
                    v-model="rangeStatus"
                    class="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="all">ALL</option>
                    <option value="hired">HIRED</option>
                    <option value="resigned">RESIGNED</option>
                  </select>
                </div>
                <div class="flex items-center gap-2">
                  <label for="start-date" class="text-xs font-medium text-gray-700 whitespace-nowrap">From:</label>
                  <input
                    id="start-date"
                    type="month"
                    v-model="rangeStart"
                    class="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                <div class="flex items-center gap-2">
                  <label for="end-date" class="text-xs font-medium text-gray-700 whitespace-nowrap">To:</label>
                  <input
                    id="end-date"
                    type="month"
                    v-model="rangeEnd"
                    class="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                <button
                  class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  @click="submitCustomRange"
                >
                  Submit
                </button>
              </div>
              <div
                v-else
                class="flex flex-col sm:flex-row items-center gap-4"
              >

                       <!-- End Date -->
                <div class="flex items-center gap-2">
                  <label for="end-date" class="text-sm font-medium text-gray-700 whitespace-nowrap">
                    Select Date:
                  </label>
                  <!-- the yearly pages (Agent_Yearly) pick a year, the others a month -->
                  <select
                    v-if="isYearPage"
                    id="end-date"
                    v-model="yearValue"
                    class="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
                  </select>
                  <input
                    v-else
                    id="end-date"
                    type="month"
                    v-model="yearMonth"
                    class="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />

                <select v-if="showScope"
                  class="p-2 border rounded bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  v-model="scope"
                >
              
                <option v-for="opt in ['agent', 'team_leader', 'team', ]" :key="opt" :value="opt">{{ opt.toUpperCase()  }}</option>

                </select>                  


                </div>

         

                <!-- Submit Button -->
                <button
                  class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  @click="SubmitYearMonth"
                >
                  Submit
                </button>

         
              </div>              

          </div>

                <!-- User Profile -->
            <div class="relative flex items-center gap-2 cursor-pointer group flex-shrink-0 whitespace-nowrap pl-4">
              <p>
              <span class="font-semibold text-gray-700" :class="isCustomRangePage ? 'hidden 2xl:inline' : ''">Current User: </span>
              <span class="font-bold text-purple-800 uppercase"> {{ currentUser.username }}</span>
            
               </p> 
              <img 
                    :src="updateImageLink(currentUser.image_link)" 
                    alt="User Profile" 
                    class="w-10 h-10 rounded-full border-2 border-gray-300"
                />
          </div>


        </header>
    </div>
</template>

<script setup>
    import { ref, watch,computed } from "vue";
    
    import { months, monthMap, isFutureMonth } from '@/utils/constants'
    import { DEPARTMENT_VIEWS } from '~/config/departmentViews'
    import { checkRange } from '~/utils/month_range'

    // the same navigation bar for CSD and Collection (the layouts pass the department)
    const props = defineProps({
      department: { type: String, default: 'csd' },
    })
    const view = DEPARTMENT_VIEWS[props.department] ?? DEPARTMENT_VIEWS.csd
    const employeesPath = `${view.base}/${view.code}_employees_management`


    //get the current user
    const authStore = useAuthStore()
    authStore.fetchTokenFromLocalStore()

    const currentUser = authStore.state.user 
   

    const config = useRuntimeConfig()

    const updateImageLink = (imageLink) => {
        return `${config.public.imageBaseUrl}${imageLink}`
      }

    const viewMode = ref("card");
    const selectedMonth = ref("");
    const selectedYear = ref("");
    const router = useRouter()
    const route = useRoute()
    const urlPath = ref(route.fullPath)
    const yearMonth = ref(route.query.year_month || "")
   

    const  filterBy = ref([])
    const selectedFilterValue = ref('')


    const employementStatus = ref('Hired')
    const scope = ref(route.query.scope || 'agent')
    // the leaderboard scope (AGENT / TEAM LEADER / TEAM) is on the home of the departments; the home of the GOM is the leadership list
    const showScope = computed(() => route.path == view.base && view.code !== 'gom')

    // the yearly pages of the CSD Agent / Team Performance: the list (yearly) and the details of one employee / team (year)
    const isYearPage = computed(() => [
      `${view.base}/agent_performance/yearly`, `${view.base}/agent_performance/year`,
      `${view.base}/team_performance/yearly`, `${view.base}/team_performance/year`,
    ].includes(route.path))
    // the Custom Range pages (the list and the details of one employee): the start and the end month, and the status on the list
    const isCustomRangeList = computed(() => route.path === `${view.base}/agent_performance/custom_range`)
    const isCustomRangePage = computed(() => isCustomRangeList.value || route.path === `${view.base}/agent_performance/custom_range_details`)
    const rangeStart = ref(route.query.start_date || '')
    const rangeEnd = ref(route.query.end_date || '')
    const rangeStatus = ref(route.query.employee_status || 'all')
    watch(() => route.query, (query) => {
      rangeStart.value = query.start_date || ''
      rangeEnd.value = query.end_date || ''
      rangeStatus.value = query.employee_status || 'all'
    })

    const submitCustomRange = () => {
      const check = checkRange(rangeStart.value, rangeEnd.value)
      if (!check.valid) {
        alert(check.message)
        return
      }
      const currentRoute = router.currentRoute.value
      router.push({
        path: currentRoute.path,
        query: {
          start_date: rangeStart.value,
          end_date: rangeEnd.value,
          ...(isCustomRangeList.value ? { employee_status: rangeStatus.value } : {}),
          // the details page of one employee needs its employee after the range is changed
          ...(currentRoute.query.employee_id ? { employee_id: currentRoute.query.employee_id } : {}),
        },
      })
    }

    const thisYear = new Date().getFullYear()
    const yearOptions = Array.from({ length: 6 }, (_, index) => String(thisYear - index))
    const yearValue = ref(route.query.year || String(thisYear))


    const fetchCsdEmployees = () => {
      if (route.path == employeesPath){ {
         
          const currentRoute = router.currentRoute.value 

          router.push( {
             path: currentRoute.path,
             query: {
               employee_status: employementStatus.value
             } 

          })
      }
      return
    }
   }

   const SubmitYearMonth = () => {   
          const currentRoute = router.currentRoute.value 

          // the yearly pages: only the year (and the employee of the details page)
          if (isYearPage.value) {
            router.push({
              path: currentRoute.path,
              query: {
                year: yearValue.value,
                ...(currentRoute.query.employee_id ? { employee_id: currentRoute.query.employee_id } : {}),
                ...(currentRoute.query.team_id ? { team_id: currentRoute.query.team_id } : {}),
              }
            })
            return
          }

          if(yearMonth.value){
             if(isFutureMonth(yearMonth.value)){
               alert('Cannot Select Future Year-Month')
               return
             }
          }

          router.push( {
             path: currentRoute.path,
             query: {
               year_month : yearMonth.value,
               ...(showScope.value ? { scope: scope.value } : {}),
               // the none-sales feedback list page needs its feedback_type after the date is changed
               ...(currentRoute.query.feedback_type ? { feedback_type: currentRoute.query.feedback_type } : {}),
               // the Give Feedback form page needs who gives / receives the feedback after the date is changed
               // (the page middleware denies the form when who_give_feedback_id is not the logged in user)
               ...Object.fromEntries(
                 ['who_give_feedback_id', 'who_give_feedback_db_name', 'who_receive_feedback_id', 'who_receive_feedback_db_name', 'evaluator_id']
                   .filter(key => currentRoute.query[key] !== undefined)
                   .map(key => [key, currentRoute.query[key]])
               ),
               // the details page of one employee (Agent Performance) needs its employee after the date is changed
               ...(currentRoute.query.employee_id ? { employee_id: currentRoute.query.employee_id } : {}),
               ...(currentRoute.query.team_id ? { team_id: currentRoute.query.team_id } : {}),
               // the employee details page needs it to keep its layout after the date is changed
               ...(currentRoute.query.department_code ? { department_code: currentRoute.query.department_code } : {}),
             }

          })
      
      return
     

    }




</script>

<style scoped>
  aside {
    transition: width 0.3s ease-in-out;
  }
  nav ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  nav ul li {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  nav ul li i {
    font-size: 1.2em;
  }
  header {
    z-index: 10;
  }
</style>
