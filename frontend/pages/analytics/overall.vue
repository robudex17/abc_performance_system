<template>
  <div class="p-4 mt-20">
    <!-- Loading Spinner -->
    <div v-if="analyticsOverAllStore.state.loading">
      <spinner></spinner>
    </div>
    <div v-else>
      <div v-if="analyticsOverAllStore.state.analyticsData.length > 0">
        <h1 class="text-4xl font-extrabold text-gray-800 text-center mt-6 mb-10">
            SBTPH Performance Historical Trends
       </h1>

        <!-- Display Agent Charts with Pagination -->
        <div v-for="(performance, index) in sbtphPerformance" :key="performance" class="market-card">
          <!-- Line Chart -->
          <canvas :ref="`marketChart_${index}_line`" :id="`marketChart_${index}_line`" width="400" height="200"></canvas>

          <!-- Bar Chart -->
          <canvas :ref="`marketChart_${index}_bar`" :id="`marketChart_${index}_bar`" width="400" height="200"></canvas>

          <!-- Table for Monthly Data -->
          <table class="status-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Target</th>
                <th>ShipOK</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(month, monthIndex) in months" :key="monthIndex">
                <td>{{ month }}</td>
                <td>{{ performance.target[monthIndex] }}</td>
                <td>{{ performance.ship_ok[monthIndex] }}</td>
                <td :class="getStatus(performance.ship_ok[monthIndex], performance.target[monthIndex]).class">
                  {{ getStatus(performance.ship_ok[monthIndex], performance.target[monthIndex]).text }}
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Table for Deposits Data -->
          <h3 class="text-2xl font-bold text-gray-700 mt-6"> New Deposits</h3>
          <table class="status-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Deposit Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(month, monthIndex) in months" :key="monthIndex">
                <td>{{ month }}</td>
                <td>{{ performance.new_deposit[monthIndex] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div  v-else class="text-red-700 font-bold text-5xl">
        No Data Available
      </div>
    </div>

  </div>
</template>

<script setup>

definePageMeta({
    middleware: ['auth' ,'adminmanager'] 
})

import { ref, onMounted,computed, watch } from 'vue';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  BarController,
  BarElement
} from 'chart.js';

// Register required Chart.js components
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  BarController,
  BarElement
);



const router = useRouter()
const route = useRoute()
const query = route.query 

const analyticsOverAllStore = useAnalyticsStore()

const sbtphPerformance =  computed(()=> {
  return analyticsOverAllStore.state.analyticsData
})

const months = [
  "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
];

// Render Market Charts
const renderMarketCharts = () => {
  sbtphPerformance.value.forEach((performance, index) => {
    const lineChartRef = document.getElementById(`marketChart_${index}_line`);
    const barChartRef = document.getElementById(`marketChart_${index}_bar`);

    if (lineChartRef) {
      new Chart(lineChartRef.getContext("2d"), {
        type: "line",
        data: {
          labels: months,
          datasets: [
            {
              label: "ShipOK",
              data: performance.ship_ok,
              borderColor: "blue",
              borderWidth: 2,
              fill: false,
            },
            {
              label: "Target",
              data: performance.target,
              borderColor: "green",
              borderWidth: 2,
              fill: false,
            }
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "top" },
            title: { display: true, text: `SBTPH Performance's Historical Trends` },
          },
        },
      });
    }

    if (barChartRef) {
      new Chart(barChartRef.getContext("2d"), {
        type: "bar",
        data: {
          labels: months,
          datasets: [
            {
              label: "ShipOK",
              data: performance.ship_ok,
              backgroundColor: "blue",
            },
            {
              label: "Target",
              data: performance.target,
              backgroundColor: "green",
            }
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "top" },
            title: { display: true, text: `Monthly ShipOK vs Target (Bar Chart)` },
          },
        },
      });
    }
  });
};

// Get Status Function
const getStatus = (shipOk, target) => {
  if (shipOk < target) {
    return { text: "Below Target", class: "below-target" }; // Red
  } else if (shipOk === target) {
    return { text: "Hit Target", class: "hit-target" }; // Orange
  } else {
    return { text: "Exceed Target", class: "exceed-target" }; // Green
  }
};

// On Mounted Lifecycle Hook
onMounted(async() => {
  await analyticsOverAllStore.fetchAnalyticsData(query, 'overall')
  if (sbtphPerformance.value){
    renderMarketCharts();
  }
  
});


watch( route, async (newRoute) => {
  console.log("The route is changed, reacting to the change..")
  router.push(newRoute.fullPath)
  await analyticsOverAllStore.fetchAnalyticsData(newRoute.query, 'overall')
  if(sbtphPerformance.value){
    renderMarketCharts()
  }
})
</script>

<style scoped>
.market-card {
  border: 1px solid #ddd;
  padding: 20px;
  margin: 20px 0;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.status-table {
  width: 100%;
  margin-top: 20px;
  border-collapse: collapse;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
}

.status-table th,
.status-table td {
  padding: 12px;
  text-align: center;
  border-bottom: 1px solid #ddd;
}

.status-table th {
  background-color: #007bff;
  color: white;
  font-weight: bold;
}

.status-table td {
  background-color: #f9f9f9;
}

.status-table tr:hover td {
  background-color: #f1f1f1;
}

.status-table .below-target {
  color: red;
}

.status-table .hit-target {
  color: orange;
}

.status-table .exceed-target {
  color: green;
}
</style>
