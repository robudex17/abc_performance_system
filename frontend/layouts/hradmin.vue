
<template>
  <div class="flex">
  <DepartmentSidebarMenu department="hradmin" />
    <div class="flex-1 relative">
      <DepartmentNavigationBar department="hradmin" />
      <NuxtPage />

      <!-- 🚀 Global ShipOK Notification Component -->
      <ShipokNotificationCard
        v-for="(notif, index) in notifications"
        :key="index"
        :notification="notif"
      />
    </div>
  </div>
</template>

<script setup>
// HR & Admin uses the same sidebar and navigation bar as the other departments (components/evaluation), with its own menu: config/hrMenu.js
import DepartmentNavigationBar from '~/components/evaluation/DepartmentNavigationBar.vue';
import DepartmentSidebarMenu from '~/components/evaluation/DepartmentSidebarMenu.vue';


</script>