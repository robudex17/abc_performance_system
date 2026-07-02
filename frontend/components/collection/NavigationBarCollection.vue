<template>
    <div>
        <header class="w-full bg-white shadow-md flex items-center justify-between px-6 py-4 fixed">
          <!-- Brand -->
          <div class="flex items-center gap-10">
              <div class="text-lg font-bold">SBTPH COLLECTION APP</div>
              
              <!-- Dropdown for manage sales agent -->
              <div v-if="route.path =='/collection/collection_employees_management'" class="flex items-center gap-2">
         
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
    
    import { months, monthMap } from '@/utils/constants'


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
    const selectStartDate = ref("")
    const selectEndDate = ref("")

    const  filterBy = ref([])
    const selectedFilterValue = ref('')


    const employementStatus = ref('Hired')


    const fetchCsdEmployees = () => {
      if (route.path == '/collection/collection_employees_management'){ {
         
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
