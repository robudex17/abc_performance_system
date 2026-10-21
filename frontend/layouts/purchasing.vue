
<template>
  <div class="flex">
  <DepartmentSidebarMenu department="purchasing" />
    <div class="flex-1 relative">
      <DepartmentNavigationBar department="purchasing" />
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
// Purchasing uses the same sidebar and navigation bar as the other departments (components/evaluation), with its own menu: config/purchasingMenu.js
import DepartmentNavigationBar from '~/components/evaluation/DepartmentNavigationBar.vue';
import DepartmentSidebarMenu from '~/components/evaluation/DepartmentSidebarMenu.vue';


</script>