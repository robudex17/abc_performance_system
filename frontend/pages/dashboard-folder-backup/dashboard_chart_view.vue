<template>
    <div class="dashboard-container p-4 mt-20 bg-gray-50 rounded-lg">
         <!-- Loading Spinner -->
       <div v-if="dashBoardStore.state.loading">
        <spinner></spinner>
       </div>
        <div v-else> 
          
              <!-- Heading and Overall Performance Section -->
                <!-- Heading and Active Agents Section -->
                  
              <h1  class="text-3xl font-semibold text-gray-800 mb-8 uppercase p-4 bg-gray-200 border-2 border-gray-300 rounded-lg">
                  Active Agents: 
                  <span class="text-green-700 font-bold">{{ activeAgents }}</span>
              </h1>
              
              <div >
                  <h1 class="text-3xl font-semibold text-gray-800  mb-8 uppercase">Performance</h1>
                  <p class="text-xl font-medium text-gray-600 mt-10 mb-4 border-b-2 border-gray-200 pb-2">1. Overall Performance Metrics</p>
                  
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- Monthly Target vs ShipOK -->
                    <div class="card bg-white shadow-md rounded-lg p-6">
                      <h3 class="text-lg font-semibold text-gray-800 mb-4">Month Target vs. ShipOK ({{ month }} {{ year }})</h3>
                      <div class="chart-container w-full h-56">
                        <canvas id="monthlyTargetChart"></canvas>
                        <p>
                          <span v-for="(part, index) in monthTargetShipOk.message" :key="index">
                            <span v-if="typeof part ==='object'" :class="part.class">{{ part.text }}</span>
                            <template v-else>{{ part }}</template>
                            
                          </span>
                          <span class="font-bold">{{ month }}</span>
                        </p>
                      <p>ShipOk percentage: <span :class="monthTargetShipOk.percent_class">{{ monthTargetShipOk.percentage }}%</span></p>
                      </div>
                    
                    </div>
              
                    <!-- Yearly Target vs ShipOK -->
                    <div class="card bg-white shadow-md rounded-lg p-6">
                      <h3 class="text-lg font-semibold text-gray-800 mb-4">Year Target vs. ShipOK ({{ year }})</h3>
                      <div class="chart-container w-full h-56">
                        <canvas id="yearlyTargetChart"></canvas>
                        <p>
                          <span v-for="(part, index) in yearTargetShipOk.message" :key="index">
                            <span v-if="typeof part ==='object'" :class="part.class">{{ part.text }}</span>
                            <template v-else>{{ part }}</template>
                            
                          </span>
                          <span class="font-bold">{{ year }}</span>
                        </p>
                      <p>ShipOk percentage: <span :class="yearTargetShipOk.percent_class">{{ yearTargetShipOk.percentage }}%</span></p>
                      </div>
                    </div>
              
                    <!-- Monthly New Deposit -->
                    <div class="card bg-white shadow-md rounded-lg p-6">
                      <h3 class="text-lg font-semibold text-gray-800 mb-4">Month New Deposit ({{ month }} {{ year }})</h3>
                      <div class="chart-container w-full h-56">
                        <canvas id="monthlyDepositChart"></canvas>
                      </div>
                    </div>
              
                    <!-- Yearly New Deposit -->
                    <div class="card bg-white shadow-md rounded-lg p-6">
                      <h3 class="text-lg font-semibold text-gray-800 mb-4">Year New Deposit ({{ year }})</h3>
                      <div class="chart-container w-full h-56">
                        <canvas id="yearlyDepositChart"></canvas>
                      </div>
                    </div>
              
                    <!-- Agent Ratings -->
                    <div class="card bg-white shadow-md rounded-lg p-6">
                      <h3 class="text-lg font-semibold text-gray-800 mb-4">Agent Ratings: ({{ month }} {{ year }})</h3>
                      <div class="chart-container w-full h-56">
                        <canvas id="agentRatingsChart"></canvas>
                      </div>
                    </div>

                    <!-- Agent Ratings Year -->
                    <div class="card bg-white shadow-md rounded-lg p-6">
                      <h3 class="text-lg font-semibold text-gray-800 mb-4">Agent Ratings Year: ( {{ year }})</h3>
                      <div class="chart-container w-full h-56">
                        <canvas id="agentRatingsChartYear"></canvas>
                      </div>
                    </div>                
              
                    <!-- Market Data  Monthly-->
                    <div class="card bg-white shadow-md rounded-lg p-6">
                      <h3 class="text-lg font-semibold text-gray-800 mb-4">Per Market Target and ShipOk Distribution: ({{ month }} {{ year }})</h3>
                      <div class="chart-container w-full h-56">
                        <canvas id="marketChart"></canvas>
                      </div>
                    </div>
                    <!-- Market Data  Monthly-->
                    <div class="card bg-white shadow-md rounded-lg p-6">
                      <h3 class="text-lg font-semibold text-gray-800 mb-4">Per Market Target and ShipOk Distribution: ( {{ year }})</h3>
                      <div class="chart-container w-full h-56">
                        <canvas id="marketChartYear"></canvas>
                      </div>
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



const dashBoardStore = useDashBoardStore()

const data = computed(() => {
return dashBoardStore.state.dashboard
})


const activeAgents = computed(() => {
  return dashBoardStore.state.dashboard.active_agents?.active_agents
});

const month = computed(() => {
  return dashBoardStore.state.dashboard.monthly_target_shipok?.month
})

const year = computed(() => {
  return dashBoardStore.state.dashboard.monthly_target_shipok?.year
})

const monthTargetShipOk = computed(() => {
   const monthTarget = Number(dashBoardStore.state.dashboard.monthly_target_shipok?.monthly_target)
   const monthShipOk =  Number(dashBoardStore.state.dashboard.monthly_target_shipok?.total_shipok) 

  
   let percentage = (monthShipOk/monthTarget) * 100
   percentage = Math.round(percentage * 100)/100

  
   let data = {
    has_data: 0,
    message: [ ],
    percentage: 0, 
    target: monthTarget,
    shipok: monthShipOk,
   }

   if (monthShipOk == 0 && monthTarget == 0){
     data.message.push('No Data Available for the month of: ')
   
    
   }
  
  else if (monthTarget > monthShipOk) {
       let result = monthTarget - monthShipOk
       data.has_data = 1
     
      data.message = ["The remaining units that need to be sold are ", {text: ` ${result} `, class:"text-green-800 font-bold"}, "for the month of: " ] 
      data.percentage = percentage 
   }
  else if ( monthShipOk > monthTarget){
    let exceededBy = monthShipOk - monthTarget
    data.has_data = 1
    data.message = ["ShipOK have exceeded the Target by: ", {text: ` ${exceededBy} `, class: "text-green-600"}, "for the month of: " ]
    data.percentage = percentage
   }
   else if (monthTarget == monthShipOk) {
       data.has_data = 1
       data.message  = ["The Target was hit for the month of: "] 
      data.percentage = percentage
   }
  
  
   data.percent_class = percentage <=30? "text-red-800 font-bold" : percentage <=60 ? "text-orange-800 font-bold" : percentage<=100 ? "text-green-800 font-bold" : percentage>100 ? "text-purple-800 font-bold" : ""
   return data
})


const yearTargetShipOk = computed(() => {
   const yearTarget = Number(dashBoardStore.state.dashboard.year_target_shipok?.year_target)
   const yearShipOk =  Number(dashBoardStore.state.dashboard.year_target_shipok?.total_shipok) 

  
   let percentage = (yearShipOk/yearTarget) * 100
   percentage = Math.round(percentage * 100)/100

  
   let data = {
    has_data: 0,
    message: [ ],
    percentage: 0, 
    target: yearTarget,
    shipok: yearShipOk,
   }

   if (yearShipOk == 0 && yearTarget == 0){
     data.message.push('No Data Available for the year of: ')
   
    
   }
  
  else if (yearTarget > yearShipOk) {
       let result = yearTarget - yearShipOk
       data.has_data = 1
     
      data.message = ["The remaining units that need to be sold are ", {text: ` ${result} `, class:"text-green-800 font-bold"}, "for the year of: " ] 
      data.percentage = percentage 
   }
  else if ( yearShipOk > yearTarget){
    let exceededBy = yearShipOk - yearTarget
    data.has_data = 1
    data.message = ["ShipOK have exceeded the Target by: ", {text: ` ${exceededBy} `, class: "text-green-600"}, "for the year of: " ]
    data.percentage = percentage
   }
   else if (yearTarget == yearShipOk) {
       data.has_data = 1
       data.message  = ["The Target was hit for the year of: "] 
      data.percentage = percentage
   }
  
  
   data.percent_class = percentage <=30? "text-red-800 font-bold" : percentage <=60 ? "text-orange-800 font-bold" : percentage<=100 ? "text-green-800 font-bold" : percentage>100 ? "text-purple-800 font-bold" : ""
   return data
})


// Function to initialize charts
function initializeCharts() {
  // Monthly Target vs ShipOK Chart
  if (!data.value) return

  new Chart(document.getElementById('monthlyTargetChart'), {
    type: 'bar',
    data: {
      labels: ['Target', 'ShipOK'],
      datasets: [
        {
          label: 'Monthly',
          data: [data.value.monthly_target_shipok?.monthly_target, data.value.monthly_target_shipok?.total_shipok],
          backgroundColor: ['#4caf50', '#ff9800'],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
    },
  });

  // Yearly Target vs ShipOK Chart
  new Chart(document.getElementById('yearlyTargetChart'), {
    type: 'bar',
    data: {
      labels: ['Target', 'ShipOK'],
      datasets: [
        {
          label: 'Yearly',
          data: [data.value.year_target_shipok?.year_target, data.value.year_target_shipok?.total_shipok],
          backgroundColor: ['#2196f3', '#ffc107'],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
    },
  });

  // Monthly New Deposit Chart
  new Chart(document.getElementById('monthlyDepositChart'), {
    type: 'bar',
    data: {
      labels: ['New Deposits'],
      datasets: [
        {
          label: `Deposits (${data.value.current_month_newdeposit?.month} ${data.value.current_month_newdeposit?.year})`,
          data: [data.value.current_month_newdeposit?.new_deposit],
          backgroundColor: '#673ab7',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  // Yearly New Deposit Chart (Bar Chart)
  new Chart(document.getElementById('yearlyDepositChart'), {
    type: 'bar',
    data: {
      labels: ['New Deposits'],
      datasets: [
        {
          label: `Deposits (${data.value.current_year_newdeposit?.year})`,
          data: [data.value.current_year_newdeposit?.new_deposit],
          backgroundColor: '#ff5722',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  // Agent Ratings Chart
  new Chart(document.getElementById('agentRatingsChart'), {
    type: 'bar',
    data: {
      labels: Object.keys(data.value.agent_ratings),
      datasets: [
        {
          label: 'Agent Ratings',
          data: Object.values(data.value.agent_ratings),
          backgroundColor: ['#4caf50', '#8bc34a', '#ffeb3b', '#ff9800', '#f44336'],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      indexAxis: 'y',
      scales: {
        x: {
            beginAtZero: true,
        }
      }
    },
  });


    // Agent Ratings Chart Year
    new Chart(document.getElementById('agentRatingsChartYear'), {
    type: 'bar',
    data: {
      labels: Object.keys(data.value.agent_ratings_year),
      datasets: [
        {
          label: 'Agent Ratings Year',
          data: Object.values(data.value.agent_ratings_year),
          backgroundColor: ['#4caf50', '#8bc34a', '#ffeb3b', '#ff9800', '#f44336'],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      indexAxis: 'y',
      scales: {
        x: {
            beginAtZero: true,
        }
      }
    },
  });

  // Market Data Chart
  new Chart(document.getElementById('marketChart'), {
    type: 'bar',
    data: {
      labels: data.value.target_shipok_market.map(market => market.market_name),
      datasets: [
        {
          label: 'Total Target',
          data: data.value.target_shipok_market.map(market => market.total_target),
          backgroundColor: '#2196f3',
        },
        {
          label: 'Total ShipOK',
          data: data.value.target_shipok_market.map(market => market.total_ship_ok),
          backgroundColor: '#ffc107',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
    },
  });

    // Market Data Chart
    new Chart(document.getElementById('marketChartYear'), {
    type: 'bar',
    data: {
      labels: data.value.target_shipok_market_year.map(market => market.market_name),
      datasets: [
        {
          label: 'Total Target',
          data: data.value.target_shipok_market_year.map(market => market.total_target),
          backgroundColor: '#2196f3',
        },
        {
          label: 'Total ShipOK',
          data: data.value.target_shipok_market_year.map(market => market.total_ship_ok),
          backgroundColor: '#ffc107',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
    },
  });


  // Attendance and Behavior Chart
  new Chart(document.getElementById('attendanceChart'), {
    type: 'bar',
    data: {
      labels: ['Tardiness', 'Absences', 'Memos'],
      datasets: [
        {
          label: 'Attendance Behavior',
          data: [data.value.attendance.tardiness, data.value.attendance.absences, data.value.attendance.memos],
          backgroundColor: ['#4caf50', '#ff9800', '#f44336'],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
    },
  });
}

//Toggle the view mode between card and table

onMounted(async () => {
await dashBoardStore.fetchDashboard(query)

 if (data.value){
  initializeCharts()
 }
})

watch(route,  async (newRoute) => {
  console.log('The route is change. we should react to the change..')
  router.push(newRoute.fullPath)
  await dashBoardStore.fetchDashboard(newRoute.query)
  if (data.value){
  initializeCharts()
 }
  
})




</script>

<style scoped>
.dashboard-container {
  padding: 1rem;
  overflow-x: hidden; /* Prevent horizontal scrolling */
  z-index: 1;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3 cards per row */
  gap: 20px;
  width: 100%;
  box-sizing: border-box; /* Ensure the layout doesn't exceed the container */
  grid-auto-rows: 1fr;
}

.card {
  border: 1px solid #ccc;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  box-sizing: border-box; /* Ensure padding is included in the width */
  width: 100%; /* Ensure each card takes up 100% of the available space in its grid cell */
}

.chart-container {
  position: relative;
  height: 300px;
  width: 100%; /* Ensure the chart container is responsive */
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr); /* 2 cards per row on medium screens */
  }
}

@media (max-width: 768px) {
  .card-grid {
    grid-template-columns: 1fr; /* 1 card per row on small screens */
  }
}


</style>


  