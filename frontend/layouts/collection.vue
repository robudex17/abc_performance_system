
<template>
  <div class="flex">
  <DepartmentSidebarMenu department="collection" />
    <div class="flex-1 relative">
      <DepartmentNavigationBar department="collection" />
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
// Collection uses the same sidebar and navigation bar as the other departments (components/evaluation), with its own menu: config/collectionMenu.js
import DepartmentNavigationBar from '~/components/evaluation/DepartmentNavigationBar.vue';
import DepartmentSidebarMenu from '~/components/evaluation/DepartmentSidebarMenu.vue';


</script>