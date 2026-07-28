<template>
    <div  class="p-4 mt-20">
      <!-- Dashboard Section -->
      <section>
        <h1>Dashboard</h1>
        <!-- Sales Line Chart -->
        <canvas id="salesLineChart"></canvas>
        <!-- Top Products Bar Chart -->
        <canvas id="topProductsBarChart"></canvas>
      </section>
  
      <hr />
  
      <!-- Analytics Section -->
      <section>
        <h1>Analytics</h1>
        <!-- Sales by Region Pie Chart -->
        <canvas id="salesPieChart"></canvas>
        <!-- Conversion Funnel Doughnut Chart -->
        <canvas id="conversionFunnelChart"></canvas>
      </section>
    </div>
  </template>
  
  <script setup>
  import { onMounted } from "vue";
  import {
    Chart,
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    Title,
    CategoryScale,
    BarController,
    BarElement,
    ArcElement,
    DoughnutController,
    PieController, // Register PieController
  } from "chart.js";
  
  // Register all necessary Chart.js components
  Chart.register(
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    Title,
    CategoryScale,
    BarController,
    BarElement,
    ArcElement,
    DoughnutController,
    PieController // Register PieController
  );
  
  const renderSalesLineChart = () => {
    const ctx = document.getElementById("salesLineChart").getContext("2d");
    new Chart(ctx, {
      type: "line",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "Total Sales ($)",
            data: [1200, 1500, 1800, 2200, 2500, 2700, 3000],
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
      },
    });
  };
  
  const renderTopProductsBarChart = () => {
    const ctx = document.getElementById("topProductsBarChart").getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Product A", "Product B", "Product C", "Product D", "Product E"],
        datasets: [
          {
            label: "Units Sold",
            data: [500, 450, 400, 300, 250],
            backgroundColor: [
              "rgba(255, 99, 132, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(255, 206, 86, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(153, 102, 255, 0.2)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(153, 102, 255, 1)",
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
      },
    });
  };
  
  const renderSalesPieChart = () => {
    const ctx = document.getElementById("salesPieChart").getContext("2d");
    new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["North", "South", "East", "West"],
        datasets: [
          {
            data: [30, 20, 25, 25],
            backgroundColor: [
              "rgba(255, 99, 132, 0.5)",
              "rgba(54, 162, 235, 0.5)",
              "rgba(255, 206, 86, 0.5)",
              "rgba(75, 192, 192, 0.5)",
            ],
          },
        ],
      },
      options: {
        responsive: true,
      },
    });
  };
  
  const renderConversionFunnelChart = () => {
    const ctx = document.getElementById("conversionFunnelChart").getContext("2d");
    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Leads", "Opportunities", "Proposals", "Closed Deals"],
        datasets: [
          {
            data: [1000, 750, 500, 300],
            backgroundColor: [
              "rgba(54, 162, 235, 0.5)",
              "rgba(75, 192, 192, 0.5)",
              "rgba(255, 206, 86, 0.5)",
              "rgba(255, 99, 132, 0.5)",
            ],
          },
        ],
      },
      options: {
        responsive: true,
      },
    });
  };
  
  onMounted(() => {
    renderSalesLineChart();
    renderTopProductsBarChart();
    renderSalesPieChart();
    renderConversionFunnelChart();
  });
  </script>
  
  <style>
  section {
    margin-bottom: 30px;
  }
  
  canvas {
    display: block;
    margin: 20px auto;
    max-width: 600px;
  }
  </style>
  