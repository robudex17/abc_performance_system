
<template>
  <div class="flex">
  <SidebarMenuCsd />
    <div class="flex-1 relative">
      <NavigationBarCsd />
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
import NavigationBarCsd from '~/components/csd/NavigationBarCsd.vue';
import SidebarMenuCsd from '~/components/csd/SidebarMenuCsd.vue';


</script>