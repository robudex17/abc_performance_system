<template>
    <div class="p-4 mt-20">
      <!-- Loading Spinner -->
      <div v-if="analyticsStore.state.loading">
        <spinner></spinner>
      </div>
  
      <div v-else>
        <div v-if="analyticsStore.state.analyticsData.length > 0">
          <h1 class="text-4xl font-extrabold text-gray-800 text-center mt-6 mb-10">
            Agents Historical Trends
          </h1>
  
          <div class="agent-card">
            <h2 class="text-green-800 font-bold text-2xl">Agent Name: {{ agent?.db_name }}</h2>
            <h2 class="text-purple-800 font-bold text-2xl">Year: {{ agent?.year }}</h2>
  
            <!-- Line Chart -->
            <canvas ref="agentChartLine" id="agentChart_line" width="400" height="200"></canvas>
  
            <!-- Bar Chart -->
            <canvas ref="agentChartBar" id="agentChart_bar" width="400" height="200"></canvas>
  
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
                  <td>{{ agent?.target[monthIndex] }}</td>
                  <td>{{ agent?.ship_ok[monthIndex] }}</td>
                  <td :class="getStatus(agent?.ship_ok[monthIndex], agent?.target[monthIndex]).class">
                    {{ getStatus(agent?.ship_ok[monthIndex], agent?.target[monthIndex]).text }}
                  </td>
                </tr>
              </tbody>
            </table>
  
            <!-- Deposits Data Table -->
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
                  <td>{{ agent?.new_deposit[monthIndex] }}</td>
                </tr>
              </tbody>
            </table>
  
            <!-- Absences, Tardiness, and Memos -->
            <h3 class="text-2xl font-bold text-gray-700 mt-6">Absences - Tardiness - Memos</h3>
            <table class="status-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Absences</th>
                  <th>Tardiness</th>
                  <th>Memos</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(month, monthIndex) in months" :key="monthIndex">
                  <td>{{ month }}</td>
                  <td>{{ agent?.absences[monthIndex] }}</td>
                  <td>{{ agent?.tardiness[monthIndex] }}</td>
                  <td>{{ agent?.memos[monthIndex] }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
  
        <div v-else class="text-red-700 font-bold text-5xl">No Available Data.</div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed, watch } from "vue";
  import { useRouter, useRoute } from "vue-router";
  import { useAuthStore } from "~/stores/auth";
  import { useAnalyticsStore } from "~/stores/sales_analytics";
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
  
  definePageMeta({ middleware: ["auth"] });
  
  // Register Chart.js components
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
  
  const authStore = useAuthStore();
  authStore.fetchTokenFromLocalStore();
  const currentUser = authStore.state.user;
  const agentId = currentUser?.login_id;
  
  const router = useRouter();
  const route = useRoute();
  const analyticsStore = useAnalyticsStore();
  
  const agent = computed(() => {
    return analyticsStore.state.analyticsData.find((a) => a.agent_id === agentId);
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
  
  const agentChartLine = ref(null);
  const agentChartBar = ref(null);
  
  const renderAgentCharts = () => {
    if (!agent.value) return;
  
    if (agentChartLine.value) {
      new Chart(agentChartLine.value.getContext("2d"), {
        type: "line",
        data: {
          labels: months,
          datasets: [
            { label: "ShipOK", data: agent.value.ship_ok, borderColor: "blue", borderWidth: 2, fill: false },
            { label: "Target", data: agent.value.target, borderColor: "green", borderWidth: 2, fill: false },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "top" },
            title: { display: true, text: `${agent.value.db_name}'s Historical Trends` },
          },
        },
      });
    }
  
    if (agentChartBar.value) {
      new Chart(agentChartBar.value.getContext("2d"), {
        type: "bar",
        data: {
          labels: months,
          datasets: [
            { label: "ShipOK", data: agent.value.ship_ok, backgroundColor: "blue" },
            { label: "Target", data: agent.value.target, backgroundColor: "green" },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "top" },
            title: { display: true, text: `${agent.value.db_name}'s Monthly ShipOK vs Target (Bar Chart)` },
          },
        },
      });
    }
  };
  
  const getStatus = (shipOk, target) => {
    if (target == 0 && target == 0) return { text: "No Data", class: "below-target" };
    if (shipOk < target) return { text: "Below Target", class: "below-target" };
    if (shipOk === target) return { text: "Hit Target", class: "hit-target" };
    return { text: "Exceed Target", class: "exceed-target" };
  };
  
  onMounted(async () => {
    await analyticsStore.fetchAnalyticsData(route.query, "agents");
    if (agent.value) renderAgentCharts();
  });
  
  watch(route, async (newRoute) => {
    router.push(newRoute.fullPath);
    await analyticsStore.fetchAnalyticsData(newRoute.query, "agents");
    if (agent.value) renderAgentCharts();
  });
  </script>
  
  <style scoped>
  .agent-card {
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
  