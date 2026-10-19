<template>
  <div class="flex">
  <SidebarMenuCsd department="gom" />
    <div class="flex-1 relative">
      <NavigationBarCsd department="gom" />
      <NuxtPage />
    </div>
  </div>
</template>

<script setup>
// The GOM's own place: the same sidebar and navigation bar as the departments (components/csd), with his own menu: config/gomMenu.js
import NavigationBarCsd from '~/components/csd/NavigationBarCsd.vue';
import SidebarMenuCsd from '~/components/csd/SidebarMenuCsd.vue';
</script>
