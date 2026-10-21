<template>
  <td class="relative group py-0.5 px-4 text-center text-lg font-medium border">

    <!-- Main value -->
    <slot />

    <!-- Tooltip -->
    <div
      class="absolute hidden group-hover:block z-50 bg-gray-900 text-white text-xs rounded px-3 py-2 whitespace-nowrap shadow-lg bottom-full left-1/2 -translate-x-1/2 mb-2"
    >
      <div class="font-bold">{{ title }}</div>
      
    </div>

  </td>
</template>

<script setup>
defineProps({
  title: String,

})
</script>