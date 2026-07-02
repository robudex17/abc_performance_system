<template>
    <div class=" p-4 mt-20">
      <!-- Loading Spinner -->
      <div v-if="analyticsStore.state.loading">
        <spinner></spinner>
       </div>
      <!-- Pagination Controls -->
      <div v-else>
          <div v-if = "analyticsStore.state.analyticsData.length > 0">
            <div class="pagination-controls">
            <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
            <span>Page {{ currentPage }} of {{ totalPages }}</span>
            <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
          </div>

            <h1 class="text-4xl font-extrabold text-gray-800 text-center mt-6 mb-10">
              Agents Historical Trends 
          </h1>

      
          <!-- Display Agent Charts with Pagination -->
          <div v-for="(agent, index) in pagedAgents" :key="agent.db_name" class="agent-card">
            <h2 class="text-green-800 font-bold text-2xl">Agent Name: {{ agent.db_name }}</h2>
            <h2 class="text-purple-800 font-bold text-2xl">Year: {{ agent.year }}</h2>
            <!-- Line Chart -->
            <canvas :ref="`agentChart_${index}_line`" :id="`agentChart_${index}_line`" width="400" height="200"></canvas>
            
            <!-- Bar Chart -->
            <canvas :ref="`agentChart_${index}_bar`" :id="`agentChart_${index}_bar`" width="400" height="200"></canvas>
      
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
                  <td>{{ agent.target[monthIndex] }}</td>
                  <td>{{ agent.ship_ok[monthIndex] }}</td>
                  <!-- <td>{{ getStatus(agent.ship_ok[monthIndex], agent.target[monthIndex]) }}</td> -->
                  <td :class="getStatus(agent.ship_ok[monthIndex], agent.target[monthIndex]).class">
                  {{ getStatus(agent.ship_ok[monthIndex], agent.target[monthIndex]).text }}
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
                  <td>{{ agent.new_deposit[monthIndex] }}</td>
                </tr>
              </tbody>
            </table>

            <h3 class="text-2xl font-bold text-gray-700 mt-6"> Absences - Tardiness - Memos</h3>
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
                  <td>{{ agent.absences[monthIndex] }}</td>
                  <td>{{ agent.tardiness[monthIndex] }}</td>
                  <td>{{ agent.memos[monthIndex] }}</td>
                </tr>
                
              </tbody>
            </table>
            
          </div>
          </div>
          <div v-else class="text-red-700 font-bold  text-5xl">
             No Available Data.
           </div>
      </div>


    </div>
  </template>
  
  <script>
  import { ref, onMounted, computed, watch } from "vue";
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
import { useAnalyticsStore } from "~/stores/sales_analytics";
  
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
  
  export default {
    
    setup() {

    definePageMeta({
        middleware: ['auth' ,'adminmanager'] 
     })


      const router = useRouter()
      const route =  useRoute()
      const query = route.query

      const scope = 'agents'

      const analyticsStore = useAnalyticsStore()
                           
      const agents = computed(()=> {
        return analyticsStore.state.analyticsData
      })
   
    
    
      const currentPage = ref(1);
      const agentsPerPage = 1;
  
      const totalPages = computed(() => Math.ceil(agents.value.length / agentsPerPage));
  
      const pagedAgents = computed(() => {
        const startIndex = (currentPage.value - 1) * agentsPerPage;
        const endIndex = startIndex + agentsPerPage;
        return agents.value.slice(startIndex, endIndex);
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
  
      const renderAgentCharts = () => {
        pagedAgents.value.forEach((agent, index) => {
          const lineChartRef = document.getElementById(`agentChart_${index}_line`);
          const barChartRef = document.getElementById(`agentChart_${index}_bar`);
          
          if (lineChartRef) {
            new Chart(lineChartRef.getContext("2d"), {
              type: "line",
              data: {
                labels: months,
                datasets: [
                  {
                    label: "ShipOK",
                    data: agent.ship_ok,
                    borderColor: "blue",
                    borderWidth: 2,
                    fill: false,
                  },
                  {
                    label: "Target",
                    data: agent.target,
                    borderColor: "green",
                    borderWidth: 2,
                    fill: false,
                  },
                ],
              },
              options: {
                responsive: true,
                plugins: {
                  legend: {
                    position: "top",
                  },
                  title: {
                    display: true,
                    text: `${agent.db_name}'s Historical Trends`,
                  },
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
                    data: agent.ship_ok,
                    backgroundColor: "blue",
                  },
                  {
                    label: "Target",
                    data: agent.target,
                    backgroundColor: "green",
                  },
                ],
              },
              options: {
                responsive: true,
                plugins: {
                  legend: {
                    position: "top",
                  },
                  title: {
                    display: true,
                    text: `${agent.name}'s Monthly ShipOK vs Target (Bar Chart)`,
                  },
                },
              },
            });
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
        setTimeout(() => renderAgentCharts(), 0); // Ensure charts render after DOM updates
      });
  
      onMounted(async () => {
        await analyticsStore.fetchAnalyticsData(query, 'agents')
        if (agents.value){
          renderAgentCharts();

        }
       
      });



    watch(route,  async (newRoute) => {
      console.log('The route is change. we should react to the change..')
      router.push(newRoute.fullPath)
      await analyticsStore.fetchAnalyticsData(newRoute.query, 'agents')
      if (agents.value){
        renderAgentCharts();
    }
      
    })

  
      return {
        agents,
        pagedAgents,
        currentPage,
        totalPages,
        agentsPerPage,
        nextPage,
        prevPage,
        months,
        getStatus,
        analyticsStore,
      };
    },
  };
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
  