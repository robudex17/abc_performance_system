<template>
    <div class="dashboard p-4 mt-20">
      <!-- Line Chart Card -->
      <div class="card">
        <h3>Line Chart: Sales Trends</h3>
        <canvas ref="lineChart"></canvas>
      </div>
  
      <!-- Bar Chart Card -->
      <div class="card">
        <h3>Bar Chart: Monthly Sales</h3>
        <canvas ref="barChart"></canvas>
      </div>
  
      <!-- Pie Chart Card -->
      <div class="card">
        <h3>Pie Chart: Product Distribution</h3>
        <canvas ref="pieChart"></canvas>
      </div>
  
      <!-- Radar Chart Card -->
      <div class="card">
        <h3>Radar Chart: Skill Set</h3>
        <canvas ref="radarChart"></canvas>
      </div>
  
      <!-- Polar Area Chart Card -->
      <div class="card">
        <h3>Polar Area Chart: Expense Distribution</h3>
        <canvas ref="polarAreaChart"></canvas>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import {
    Chart,
    LineController,
    BarController,
    PieController,
    RadarController,
    PolarAreaController,
    LineElement,
    BarElement,
    ArcElement,
    PointElement,
    LinearScale,
    RadialLinearScale,
    CategoryScale,
    Title,
    Tooltip,
    Legend,
  } from 'chart.js';
  
  export default {
    name: 'Dashboard',
    setup() {
      const lineChart = ref(null);
      const barChart = ref(null);
      const pieChart = ref(null);
      const radarChart = ref(null);
      const polarAreaChart = ref(null);
  
      // Register Chart.js components
      Chart.register(
        LineController,
        LineElement,
        BarController,
        BarElement,
        PieController,
        ArcElement,
        PointElement,
        RadarController,
        PolarAreaController,
        LinearScale,
        RadialLinearScale,
        CategoryScale,
        Title,
        Tooltip,
        Legend
      );
  
      const renderLineChart = () => {
        if (lineChart.value) {
          const ctx = lineChart.value.getContext('2d');
          new Chart(ctx, {
            type: 'line',
            data: {
              labels: ['January', 'February', 'March', 'April', 'May'],
              datasets: [
                {
                  label: 'Sales Trends',
                  data: [20, 40, 50, 80, 60],
                  borderColor: 'rgba(75, 192, 192, 0.8)',
                  fill: false,
                  tension: 0.1,
                },
              ],
            },
            options: {
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
              },
            },
          });
        }
      };
  
      const renderBarChart = () => {
        if (barChart.value) {
          const ctx = barChart.value.getContext('2d');
          new Chart(ctx, {
            type: 'bar',
            data: {
              labels: ['January', 'February', 'March', 'April', 'May'],
              datasets: [
                {
                  label: 'Monthly Sales',
                  data: [30, 50, 70, 60, 90],
                  backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                  ],
                },
              ],
            },
            options: {
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
              },
            },
          });
        }
      };
  
      const renderPieChart = () => {
        if (pieChart.value) {
          const ctx = pieChart.value.getContext('2d');
          new Chart(ctx, {
            type: 'pie',
            data: {
              labels: ['Product A', 'Product B', 'Product C', 'Product D'],
              datasets: [
                {
                  label: 'Product Distribution',
                  data: [60, 30, 20, 10],
                  backgroundColor: [
                    'rgba(255, 159, 64, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 205, 86, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                  ],
                },
              ],
            },
            options: {
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
              },
            },
          });
        }
      };
  
      const renderRadarChart = () => {
        if (radarChart.value) {
          const ctx = radarChart.value.getContext('2d');
          new Chart(ctx, {
            type: 'radar',
            data: {
              labels: ['JavaScript', 'Python', 'Vue.js', 'Django', 'Node.js'],
              datasets: [
                {
                  label: 'Skill Level',
                  data: [80, 70, 90, 60, 85],
                  backgroundColor: 'rgba(75, 192, 192, 0.2)',
                  borderColor: 'rgba(75, 192, 192, 1)',
                  borderWidth: 1,
                },
              ],
            },
            options: {
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
              },
            },
          });
        }
      };
  
      const renderPolarAreaChart = () => {
        if (polarAreaChart.value) {
          const ctx = polarAreaChart.value.getContext('2d');
          new Chart(ctx, {
            type: 'polarArea',
            data: {
              labels: ['Rent', 'Food', 'Utilities', 'Entertainment', 'Savings'],
              datasets: [
                {
                  label: 'Expense Distribution',
                  data: [500, 300, 150, 100, 200],
                  backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                  ],
                },
              ],
            },
            options: {
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
              },
            },
          });
        }
      };
  
      onMounted(() => {
        renderLineChart();
        renderBarChart();
        renderPieChart();
        renderRadarChart();
        renderPolarAreaChart();
      });
  
      return {
        lineChart,
        barChart,
        pieChart,
        radarChart,
        polarAreaChart,
      };
    },
  };
  </script>
  
  <style scoped>
  .dashboard {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 16px;
    padding: 16px;
  }
  
  .card {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 16px;
    text-align: center;
  }
  
  canvas {
    max-width: 100%;
    height: auto;
  }
  </style>
  