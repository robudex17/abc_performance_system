<template>
  <li
    class="p-2 hover:bg-gray-700 cursor-pointer rounded-md"
    :class="{ 'bg-blue-600': isActive }"
  >
    <div
      class="flex items-center justify-between"
      @click="handleClick"
    >
      <div class="flex items-center space-x-2">
        <font-awesome-icon :icon="item.icon" />
        <span v-if="!isCollapsed">{{ item.name }}</span>
      </div>
      <font-awesome-icon
        v-if="hasChildren"
        :icon="['fas', submenuStates[item.name] ? 'chevron-up' : 'chevron-down']"
      />
    </div>

    <!-- Submenu -->
    <transition name="fade">
      <ul
        v-if="hasChildren && submenuStates[item.name]"
        class="ml-4 mt-2 space-y-1"
      >
        <SidebarMenuItem
          v-for="child in item.subMenu"
          :key="child.name"
          :item="child"
          :activeMenu="activeMenu"
          :isCollapsed="isCollapsed"
          :submenuStates="submenuStates"
          @activateMenu="$emit('activateMenu', $event)"
        />
      </ul>
    </transition>
  </li>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import SidebarMenuItem from './SidebarMenuItem.vue' // recursive import

const props = defineProps({
  item: Object,
  activeMenu: String,
  isCollapsed: Boolean,
  submenuStates: Object,
})

const emit = defineEmits(['activateMenu'])

const router = useRouter()

const hasChildren = computed(() => props.item.subMenu && props.item.subMenu.length)
const isActive = computed(() => props.activeMenu === props.item.name)

const handleClick = () => {
  if (hasChildren.value) {
    props.submenuStates[props.item.name] = !props.submenuStates[props.item.name]
  } else if (props.item.route) {
    emit('activateMenu', props.item)
    router.push(props.item.route)
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
