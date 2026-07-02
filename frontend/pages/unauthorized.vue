<template>
    <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 class="text-4xl font-bold text-red-600 mb-4">Access Denied</h1>
      <p class="text-lg text-gray-700 mb-6">
        You do not have permission to view this page.
      </p>
      <!-- <NuxtLink
        to="/"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        Return to Home
      </NuxtLink> -->
    </div>
  </template>
  
  <script setup>
  // No additional script is needed for this simple page
  definePageMeta({
        layout: 'custom' // This tells Nuxt to use the 'custom' layout for this page
    })

  </script>
  
  <style scoped>
  /* Add any additional styles if necessary */
  </style>
  