
<template>
  <div class="flex">
  <SidebarMenuCsd department="collection" />
    <div class="flex-1 relative">
      <NavigationBarCsd department="collection" />
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
// Collection uses the same sidebar and navigation bar as CSD (components/csd), with its own menu: config/collectionMenu.js
import NavigationBarCsd from '~/components/csd/NavigationBarCsd.vue';
import SidebarMenuCsd from '~/components/csd/SidebarMenuCsd.vue';


</script>