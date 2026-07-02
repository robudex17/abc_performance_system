<template>
    <div class="dashboard-container p-4 mt-20 bg-gray-50 rounded-lg">
      <!-- Heading and Overall Performance Section -->
          <!-- Heading and Active Agents Section -->
        <h1 class="text-3xl font-semibold text-gray-800 mb-8 uppercase p-4 bg-gray-200 border-2 border-gray-300 rounded-lg">
          Active Agents: 
          <span class="text-green-700 font-bold">{{ data.active_agents.active_agents }}</span>
        </h1>

        <h1 class="text-3xl font-semibold text-gray-800  mb-8 uppercase">Performance</h1>
        <p class="text-xl font-medium text-gray-600 mt-10 mb-4 border-b-2 border-gray-200 pb-2">1. Overall Performance Metrics</p>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Monthly Target vs ShipOK -->
            <div class="card bg-white shadow-md rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Month Target vs. ShipOK ({{ data.monthly_target_shipok.month }} {{ data.monthly_target_shipok.year }})</h3>
              <div class="chart-container w-full h-56">
                <canvas id="monthlyTargetChart"></canvas>
              </div>
            </div>
      
            <!-- Yearly Target vs ShipOK -->
            <div class="card bg-white shadow-md rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Year Target vs. ShipOK ({{ data.year_target_shipok.year }})</h3>
              <div class="chart-container w-full h-56">
                <canvas id="yearlyTargetChart"></canvas>
              </div>
            </div>
      
            <!-- Monthly New Deposit -->
            <div class="card bg-white shadow-md rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Month New Deposit ({{ data.current_month_newdeposit.month }} {{ data.current_month_newdeposit.year }})</h3>
              <div class="chart-container w-full h-56">
                <canvas id="monthlyDepositChart"></canvas>
              </div>
            </div>
      
            <!-- Yearly New Deposit -->
            <div class="card bg-white shadow-md rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Year New Deposit ({{ data.current_year_newdeposit.year }})</h3>
              <div class="chart-container w-full h-56">
                <canvas id="yearlyDepositChart"></canvas>
              </div>
            </div>
      
            <!-- Agent Ratings -->
            <div class="card bg-white shadow-md rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Agent Ratings: ({{ data.current_month_newdeposit.month }} {{ data.current_month_newdeposit.year }})</h3>
              <div class="chart-container w-full h-56">
                <canvas id="agentRatingsChart"></canvas>
              </div>
            </div>
      
            <!-- Market Data -->
            <div class="card bg-white shadow-md rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Per Market Target and ShipOk Distribution: ({{ data.current_month_newdeposit.month }} {{ data.current_month_newdeposit.year }})</h3>
              <div class="chart-container w-full h-56">
                <canvas id="marketChart"></canvas>
              </div>
            </div>
        </div>
    
        <!-- Agent and Team Performance Section -->
        <p class="text-xl font-medium text-gray-600 mt-12 mb-4 border-b-2 border-gray-200 pb-2">2. Agent and Team Performance Metrics:</p>
        <!-- Add agent/team performance chart content here -->
      
        <h1 class="text-3xl font-semibold text-gray-800  mb-8 uppercase">Attendance and Behavior</h1>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Attendance Chart -->
          <div class="card bg-white shadow-md rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Attendance Behavior ({{ data.current_month_newdeposit.month }} {{ data.current_month_newdeposit.year }})</h3>
            <div class="chart-container w-full h-56">
              <canvas id="attendanceChart"></canvas>
            </div>
          </div>
        </div>
    </div>
  </template>
  
  

<script setup>
    import { onMounted } from 'vue';
    import Chart from 'chart.js/auto';

    // Static data
    const data = {
      monthly_target_shipok: { month: 'September', year: 2024, monthly_target: '879', total_shipok: '636' },
      year_target_shipok: { year: 2024, year_target: '7554', total_shipok: '6262' },
      current_month_newdeposit: { month: 'September', year: 2024, new_deposit: 18 },
      current_year_newdeposit: { year: 2024, new_deposit: 135 },
      agent_ratings: { EXCEPTIONAL: 1, VERY_SATISFACTORY: 3, SATISFACTORY: 10, NEEDS_IMPROVEMENT: 5, POOR: 1 },
      market: [
        { market_id: 1, market_name: 'oceana', total_target: '116', total_ship_ok: '69' },
        { market_id: 2, market_name: 'malawi', total_target: '25', total_ship_ok: '22' },
        { market_id: 3, market_name: 'cyprus', total_target: '48', total_ship_ok: '37' },
        { market_id: 4, market_name: 'guyana', total_target: '40', total_ship_ok: '19' },
        { market_id: 5, market_name: 'jamaica', total_target: '102', total_ship_ok: '46' },
        { market_id: 6, market_name: 'bahamas', total_target: '36', total_ship_ok: '49' },
        { market_id: 7, market_name: 'kenya', total_target: '47', total_ship_ok: '35' },
        { market_id: 8, market_name: 'mozambique', total_target: '90', total_ship_ok: '76' },
        { market_id: 9, market_name: 'philippines', total_target: '375', total_ship_ok: '283' },
      ],
      active_agents:{"active_agents":20},
      attendance :{"tardiness":13,"absences":4,"memos":3}
    };

    // Function to initialize charts
    function initializeCharts() {
      // Monthly Target vs ShipOK Chart
      new Chart(document.getElementById('monthlyTargetChart'), {
        type: 'bar',
        data: {
          labels: ['Target', 'ShipOK'],
          datasets: [
            {
              label: 'Monthly',
              data: [data.monthly_target_shipok.monthly_target, data.monthly_target_shipok.total_shipok],
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
              data: [data.year_target_shipok.year_target, data.year_target_shipok.total_shipok],
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
              label: `Deposits (${data.current_month_newdeposit.month} ${data.current_month_newdeposit.year})`,
              data: [data.current_month_newdeposit.new_deposit],
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
              label: `Deposits (${data.current_year_newdeposit.year})`,
              data: [data.current_year_newdeposit.new_deposit],
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
          labels: Object.keys(data.agent_ratings),
          datasets: [
            {
              label: 'Agent Ratings',
              data: Object.values(data.agent_ratings),
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
          labels: data.market.map(market => market.market_name),
          datasets: [
            {
              label: 'Total Target',
              data: data.market.map(market => market.total_target),
              backgroundColor: '#2196f3',
            },
            {
              label: 'Total ShipOK',
              data: data.market.map(market => market.total_ship_ok),
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
              data: [data.attendance.tardiness, data.attendance.absences, data.attendance.memos],
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

    // Initialize charts on mounted
    onMounted(() => {
      initializeCharts();
    });
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


  