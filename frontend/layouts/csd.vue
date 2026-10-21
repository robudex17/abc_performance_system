
<template>
  <div class="flex">
  <DepartmentSidebarMenu department="csd" />
    <div class="flex-1 relative">
      <DepartmentNavigationBar department="csd" />
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
import DepartmentNavigationBar from '~/components/evaluation/DepartmentNavigationBar.vue';
import DepartmentSidebarMenu from '~/components/evaluation/DepartmentSidebarMenu.vue';


</script>