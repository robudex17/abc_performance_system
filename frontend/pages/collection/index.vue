<template>
  <div class="p-4 mt-20">
    <h1>This is collection department</h1>
 
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'collection', // This tells Nuxt to use the 'otherDepartment' layout for this page
  middleware: ['auth'] // This applies the 'auth' middleware to this page
})  
</script>