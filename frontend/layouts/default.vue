<!-- <template>
  <div class="flex">
    <SidebarMenu />
    <div class="flex-1">
      <NavigationBar />
       <NuxtPage />
    </div>
  </div>
</template>
 -->

<template>
  <div class="flex">
    <SidebarMenu />
    <div class="flex-1 relative">
      <NavigationBar />
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
import { ref, onMounted } from 'vue'
import { useShipokNotification } from '~/composables/useShipokNotification'
import ShipokNotificationCard from '~/components/ShipokNotificationCard.vue'

import { useAudioUnlock } from '~/composables/useAudioUnlock'
useAudioUnlock()

// ✅ Reactive array for multiple notifications
const notifications = ref([])

// ✅ Use the composable to listen for notifications
const { latestNotification } = useShipokNotification()

// 🔔 Watch for new notifications
onMounted(() => {
  watch(
    latestNotification,
    (newNotif) => {
      if (newNotif) {
        notifications.value.push(newNotif)

        // Optional: auto-remove notification after 6 seconds
        setTimeout(() => {
          notifications.value.shift()
        }, 6000)
      }
    },
    { immediate: true }
  )
})
</script>

<style scoped>
/* Make sure notifications appear above page content */
.relative {
  position: relative;
}
</style>



