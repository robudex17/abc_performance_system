
<template>
  <div class="flex">
  <CollectionSidebarMenuCollection />
    <div class="flex-1 relative">
      <NavigationBarCollection />
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
import NavigationBarCollection from '~/components/collection/NavigationBarCollection.vue';
import CollectionSidebarMenuCollection from '~/components/collection/SidebarMenuCollection.vue';


</script>