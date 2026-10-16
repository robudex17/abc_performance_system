
<template>
  <div class="flex">
  <SidebarMenuCsd department="purchasing" />
    <div class="flex-1 relative">
      <NavigationBarCsd department="purchasing" />
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
// Purchasing uses the same sidebar and navigation bar as CSD (components/csd), with its own menu: config/purchasingMenu.js
import NavigationBarCsd from '~/components/csd/NavigationBarCsd.vue';
import SidebarMenuCsd from '~/components/csd/SidebarMenuCsd.vue';


</script>