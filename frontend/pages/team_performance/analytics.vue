<template>
    <div class="p-4 mt-20">
  
      <!-- Loading Spinner -->
      <div v-if="analyticsMarketStore.state.loading">
        <spinner></spinner>
      </div>
      <div v-else>
        <div v-if="analyticsMarketStore.state.analyticsData.length > 0">
          <h1 class="text-4xl font-extrabold text-gray-800 text-center mt-6 mb-10">
            Market Historical Trends
          </h1>
          
                  <!-- Pagination Controls -->
            <div class="pagination-controls">
            <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
            <span>Page {{ currentPage }} of {{ totalPages }}</span>
            <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
          </div>
          <!-- Display Agent Charts with Pagination -->
          <div v-for="(market, index) in pagedMarket" :key="market.market" class="market-card">
            <p class="uppercase font-bold">{{ market.market_name }} - agents: 
              <span class="uppercase text-3xl font-bold text-green-800">{{ market.agent_members }}</span>
  
            </p>
            <p class="font-bold uppercase text-xl">Year: {{ market.year }}</p>
  
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
                  <td>{{ market.target[monthIndex] }}</td>
                  <td>{{ market.ship_ok[monthIndex] }}</td>
                  <td :class="getStatus(market.ship_ok[monthIndex], market.target[monthIndex]).class">
                    {{ getStatus(market.ship_ok[monthIndex], market.target[monthIndex]).text }}
                  </td>
                </tr>
              </tbody>
            </table>
  
            <!-- Table for Deposits Data -->
            <h3 class="text-2xl font-bold text-gray-700 mt-6">New Deposits</h3>
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
                  <td>{{ market.new_deposit[monthIndex] }}</td>
                </tr>
              </tbody>
            </table>
  
          </div>
  
  
        </div>
        <div v-else class="text-red-700 font-bold text-5xl">
          No Available Data.
        </div>
      </div>
  
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed, watch } from "vue";
  import { useRouter, useRoute } from "vue-router";
  // import { useAnalyticsStore } from "@/stores/analyticsStore"; // Assuming the store is imported correctly
  
  definePageMeta({
      middleware: ['auth'] 
  })
  
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
    BarElement,
  } from "chart.js";
  
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
  
  const router = useRouter();
  const route = useRoute();
  const query = route.query;
  
  const analyticsMarketStore = useAnalyticsStore();
  
  const market = computed(() => analyticsMarketStore.state.analyticsData);
  
  const currentPage = ref(1);
  const marketPerPage = 1;
  
  const totalPages = computed(() => Math.ceil(market.value.length / marketPerPage));
  
  const pagedMarket = computed(() => {
    const startIndex = (currentPage.value - 1) * marketPerPage;
    const endIndex = startIndex + marketPerPage;
    return market.value.slice(startIndex, endIndex);
  });
  
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  
 
  
  const charts = [];
  
  const renderMarketCharts = () => {
    // Destroy existing charts before creating new ones
    charts.forEach(chart => chart.destroy());
    charts.length = 0; // Clear the array
  
    pagedMarket.value.forEach((market, index) => {
      const lineChartRef = document.getElementById(`marketChart_${index}_line`);
      const barChartRef = document.getElementById(`marketChart_${index}_bar`);
  
      if (lineChartRef) {
        const lineChart = new Chart(lineChartRef.getContext("2d"), {
          type: "line",
          data: {
            labels: months,
            datasets: [
              {
                label: "ShipOK",
                data: market.ship_ok,
                borderColor: "blue",
                borderWidth: 2,
                fill: false,
              },
              {
                label: "Target",
                data: market.target,
                borderColor: "green",
                borderWidth: 2,
                fill: false,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: { position: "top" },
              title: { display: true, text: `${market.market_name}'s Historical Trends` },
            },
          },
        });
        charts.push(lineChart);
      }
  
      if (barChartRef) {
        const barChart = new Chart(barChartRef.getContext("2d"), {
          type: "bar",
          data: {
            labels: months,
            datasets: [
              {
                label: "ShipOK",
                data: market.ship_ok,
                backgroundColor: "blue",
              },
              {
                label: "Target",
                data: market.target,
                backgroundColor: "green",
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: { position: "top" },
              title: { display: true, text: `${market.market_name}'s Monthly ShipOK vs Target (Bar Chart)` },
            },
          },
        });
        charts.push(barChart);
      }
    });
  };
  
  
  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++;
    }
  };
  
  const prevPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--;
    }
  };
  
  const getStatus = (shipOk, target) => {
    if (shipOk < target) {
      return { text: "Below Target", class: "below-target" }; // Red
    } else if (shipOk === target) {
      return { text: "Hit Target", class: "hit-target" }; // Orange
    } else {
      return { text: "Exceed Target", class: "exceed-target" }; // Green
    }
  };
  
  watch(currentPage, () => {
    setTimeout(() => renderMarketCharts(), 0); // Ensure charts render after DOM updates
  });
  
  onMounted(async () => {
    await analyticsMarketStore.fetchAnalyticsData(query, "market");
    if (market.value) {
      renderMarketCharts();
    }
  });
  
  watch(route, async (newRoute) => {
    console.log("The route is changed, reacting to the change..");
    router.push(newRoute.fullPath);
    await analyticsMarketStore.fetchAnalyticsData(newRoute.query, "market");
    if (market.value) {
      renderMarketCharts();
    }
  });
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
  
  .pagination-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    margin: 20px 0;
  }
  
  button {
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.3s;
  }
  
  button:hover {
    background-color: #0056b3;
  }
  
  button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  
  span {
    font-size: 16px;
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
  
  .status-table td:nth-child(4) {
    font-weight: bold;
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
  