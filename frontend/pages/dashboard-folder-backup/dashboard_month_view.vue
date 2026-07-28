<template>
  <div class="grid grid-cols-1 gap-4 p-4 mt-20">
    <div v-if="dashBoardStore.state.loading">
        <spinner></spinner>
    </div>
    <div v-else>
            <p class="text-gray-800 font-bold text-7xl mb-10">Per Market Performance</p>
            <p  class="text-gray-800 font-bold text-4xl mb-3">Target Vs ShipOk <span class="text-red-600">({{ trucks }})</span> as of: <span class="text-red-600">( {{ month }} {{ year }})</span></p>
            
            <div v-for="target_shipok in data" :key="target_shipok.market_id" class="bg-white shadow-md rounded-lg p-4 border border-gray-200">
                <h2 class=" uppercase text-2xl font-semibold text-gray-800 mb-4">{{ target_shipok.market_name }}</h2>
                <div class="grid grid-cols-4 gap-4">
                    <div class="bg-blue-100 p-6 rounded-lg shadow flex flex-col items-center justify-center h-32">
                    <p class="text-gray-800 font-bold text-7xl">{{ target_shipok.total_target }}</p>
                    <p class="text-gray-600 font-medium text-lg">Target(units)</p>
                    </div>
                    <div class="bg-green-100 p-6 rounded-lg shadow flex flex-col items-center justify-center h-32">
                    <p class="text-gray-800 font-bold text-7xl">{{ target_shipok.total_ship_ok }}</p>
                    <p class="text-gray-600 font-medium text-lg">Ship OK(units)</p>
                    </div>
                    <div class="bg-yellow-100 p-6 rounded-lg shadow flex flex-col items-center justify-center h-32">
                    <p class="text-gray-800 font-bold text-6xl">
                        {{ target_shipok.total_target > 0 ? ((target_shipok.total_ship_ok / target_shipok.total_target) * 100).toFixed(2) + '%' : '0%' }}
                    </p>
                    <p class="text-gray-600 font-medium text-lg">Percentage</p>
                    </div>
                    <div :class="(target_shipok.total_target - target_shipok.total_ship_ok) >= 0 ? 'bg-red-100' : 'bg-green-100'" class="p-6 rounded-lg shadow flex flex-col items-center justify-center h-32">
                    <p class="text-gray-800 font-bold text-6xl">{{ target_shipok.total_target - target_shipok.total_ship_ok }}</p>
                    <p class="text-gray-600 font-medium text-lg">Remaining(units)</p>
                    </div>
                </div>
            </div>
            <p class="text-gray-800 font-bold text-4xl mt-5 mb-5 pt-10">New Deposit <span class="text-red-600">({{ trucks }})</span> as of: <span class="text-red-600">( {{ month }} {{ year }})</span></p>
            <div v-for="target_shipok in data" :key="target_shipok.market_id" class="bg-white shadow-md rounded-lg p-4 border border-gray-200">
                <h2 class=" uppercase text-2xl font-semibold text-gray-800 mb-4">{{ target_shipok.market_name }}</h2>
                <div class="grid grid-cols-1 gap-4">
                    <div class="bg-orange-100 p-6 rounded-lg shadow flex flex-col items-center justify-center h-32">
                    <p class="text-gray-800 font-bold text-7xl">{{ target_shipok.total_deposit }}</p>
                    <p class="text-gray-600 font-medium text-lg">New Deposit(account)</p>
                    </div>
          
            
                </div>
            </div>    
            
            <p class="text-gray-800 font-bold text-7xl mb-10 pt-20">Overall Market Performance</p>
            <p  class="text-gray-800 font-bold text-4xl mb-3">Target Vs ShipOk <span class="text-red-600">({{ trucks }})</span> as of: <span class="text-red-600">( {{ month }} {{ year }})</span></p>
            
            <div class="bg-white shadow-md rounded-lg p-4 border border-gray-200">
                <h2 class=" uppercase text-2xl font-semibold text-gray-800 mb-4">All Market</h2>
                <div class="grid grid-cols-4 gap-4">
                    <div class="bg-blue-100 p-6 rounded-lg shadow flex flex-col items-center justify-center h-32">
                    <p class="text-gray-800 font-bold text-7xl">{{ dataOverallTarget.monthly_target }}</p>
                    <p class="text-gray-600 font-medium text-lg">Target(units)</p>
                    </div>
                    <div class="bg-green-100 p-6 rounded-lg shadow flex flex-col items-center justify-center h-32">
                    <p class="text-gray-800 font-bold text-7xl">{{ dataOverallTarget.total_shipok }}</p>
                    <p class="text-gray-600 font-medium text-lg">Ship OK(units)</p>
                    </div>
                    <div class="bg-yellow-100 p-6 rounded-lg shadow flex flex-col items-center justify-center h-32">
                    <p class="text-gray-800 font-bold text-6xl">
                        {{ dataOverallTarget.monthly_target > 0 ? ((dataOverallTarget.total_shipok / dataOverallTarget.monthly_target) * 100).toFixed(2) + '%' : '0%' }}
                    </p>
                    <p class="text-gray-600 font-medium text-lg">Percentage</p>
                    </div>
                    <div :class="(dataOverallTarget.monthly_target - dataOverallTarget.total_shipok) >= 0 ? 'bg-red-100' : 'bg-green-100'" class="p-6 rounded-lg shadow flex flex-col items-center justify-center h-32">
                    <p class="text-gray-800 font-bold text-6xl">{{ dataOverallTarget.monthly_target - dataOverallTarget.total_shipok }}</p>
                    <p class="text-gray-600 font-medium text-lg">Remaining(units)</p>
                    </div>
                </div>
            </div>
            <p class="text-gray-800 font-bold text-4xl mt-5 mb-5 pt-10">New Deposit <span class="text-red-600">({{ trucks }})</span> as of: <span class="text-red-600">( {{ month }} {{ year }})</span></p>
            <div  class="bg-white shadow-md rounded-lg p-4 border border-gray-200">
                <h2 class=" uppercase text-2xl font-semibold text-gray-800 mb-4">All Market</h2>
                <div class="grid grid-cols-1 gap-4">
                    <div class="bg-orange-100 p-6 rounded-lg shadow flex flex-col items-center justify-center h-32">
                    <p class="text-gray-800 font-bold text-7xl">{{ dataOverallDeposit.new_deposit }}</p>
                    <p class="text-gray-600 font-medium text-lg">New Deposit(account)</p>
                    </div>
          
            
                </div>
            </div>              
   </div>

    
  </div>
</template>



<script setup>

definePageMeta({
   middleware: 'auth'
})
import { onMounted,computed } from 'vue';

import Chart from 'chart.js/auto';
import { text } from '@fortawesome/fontawesome-svg-core';

const router = useRouter()
const route = useRoute()



const query = route.query

const month = ref(null)
const year = ref(null)
const trucks = ref('WITH TRUCKS')

    // Months for the dropdown
    const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
         ];


    month.value= query.month
    year.value = query.year 

 
    // console.log(route.query)

    if (!route.query.month){
        month.value= months[new Date().getMonth()]
     }

    if (!route.query.year){
        year.value = new Date().getFullYear()
    }

    if (route.query.withTrucks == 'false'){
      trucks.value = 'WITHOUT TRUCKS'
    }


const dashBoardStore = useDashBoardStore()

const data = computed(() => {
return dashBoardStore.state.dashboard.target_shipok_market
})

const dataOverallTarget = computed(() => {
  return dashBoardStore.state.dashboard?.monthly_target_shipok || { monthly_target: 0, total_shipok: 0, month: null, year: null };
})

const dataOverallDeposit = computed(() => {
  return dashBoardStore.state.dashboard?.current_month_newdeposit || { month: null, year: null, new_deposit: 0};
})




onMounted(async () => {
await dashBoardStore.fetchDashboard(query)

 
})

watch(route,  async (newRoute) => {
  console.log('The route is change. we should react to the change..')
  month.value = newRoute.query.month
  year.value = newRoute.query.year

  if(newRoute.query.withTrucks == 'false'){
     trucks.value = 'WITHOUT TRUCKS'
  }else{
    trucks.value = 'WITH TRUCKS'
  }

  router.push(newRoute.fullPath)
  await dashBoardStore.fetchDashboard(newRoute.query)

  
})

</script>


<style scoped>
  /* Additional styling can go here if needed */
</style>
