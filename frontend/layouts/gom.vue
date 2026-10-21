<template>
  <div class="flex">
  <DepartmentSidebarMenu department="gom" />
    <div class="flex-1 relative">
      <DepartmentNavigationBar department="gom" />
      <NuxtPage />
    </div>
  </div>
</template>

<script setup>
// The GOM's own place: the same sidebar and navigation bar as the departments (components/evaluation), with his own menu: config/gomMenu.js
import DepartmentNavigationBar from '~/components/evaluation/DepartmentNavigationBar.vue';
import DepartmentSidebarMenu from '~/components/evaluation/DepartmentSidebarMenu.vue';
</script>
