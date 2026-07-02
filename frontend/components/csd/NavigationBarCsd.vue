<template>
    <div>
        <header class="w-full bg-white shadow-md flex items-center justify-between px-6 py-4 fixed">
          <!-- Brand -->
          <div class="flex items-center gap-10">
              <div class="text-lg font-bold">SBTPH CSD APP</div>
              <!-- Dropdown for manage sales agent -->
              <div v-if="route.path =='/csd/csd_employees_management'" class="flex items-center gap-2">
         
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
              <div
                v-else
                class="flex flex-col sm:flex-row items-center gap-4"
              >

                       <!-- End Date -->
                <div class="flex items-center gap-2">
                  <label for="end-date" class="text-sm font-medium text-gray-700 whitespace-nowrap">
                    Select Date:
                  </label>
                  <input
                    id="end-date"
                    type="month"
                    v-model="yearMonth"
                    class="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />

                <select v-if="route.path == '/csd'"
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
            <div class="relative flex items-center gap-2 cursor-pointer group">
              <p>
              <span class="font-semibold text-gray-700">Current User: </span>
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
    const yearMonth = ref("")
   

    const  filterBy = ref([])
    const selectedFilterValue = ref('')


    const employementStatus = ref('Hired')
    const scope = ref('agent')


    const fetchCsdEmployees = () => {
      if (route.path == '/csd/csd_employees_management'){ {
         
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
               scope:  scope.value,
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
