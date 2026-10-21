<template>
  <div class="bg-gray-800 text-white border rounded-lg shadow-lg overflow-hidden">
    <div class="flex flex-col items-center p-4">
      <img
        v-if="agent.image_link"
        :src="imageUrl(agent.image_link)"
        alt="Agent Image"
        class="w-20 h-20 rounded-full object-cover mb-4"
      />
      <div v-else class="w-20 h-20 bg-gray-300 rounded-full mb-4 flex items-center justify-center text-white">
        <span class="text-xl">{{ agent.db_name }}</span>
      </div>

      <div class="text-center">
        <h3 class="text-lg font-semibold">{{ agent.db_name }}</h3>
        <p class="text-sm font-bold" :class="csdRatingClass(agent.ratings_name) || setRatingNameColor(agent)">{{ agent.ratings_name }}</p>

        <div class="flex items-center justify-center mt-2">
          <template v-for="i in 5" :key="i">
            <svg xmlns="http://www.w3.org/2000/svg" :class="getStarClass(agent.final_ratings, i)" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
          </template>
        </div>

        <p class="text-xl font-bold mt-2">{{ agent.final_ratings }}</p>
        <p class="text-xl font-bold mt-2" v-if="agent.month">{{ agent.month }}</p>
        <p class="text-xl font-bold mt-2">{{ agent.year }}</p>
      </div>

      <button
        @click="$emit('details', agent)"
        class="text-green-300 hover:text-green-500 font-semibold hover:underline hover:scale-105 transition duration-300"
      >
        Performance Details
      </button>
    </div>
  </div>
</template>

<script setup>
import { getStarClass } from '@/utils/constants'

defineProps({ agent: { type: Object, required: true } })
defineEmits(['details'])

const config = useRuntimeConfig()
const { setRatingNameColor } = useRatingColor()

// the images are served by the backend by filename
const imageUrl = (imageLink) => {
  if (!imageLink) return ''
  if (imageLink.startsWith('data:image') || /^https?:\/\//.test(imageLink)) return imageLink
  return `${config.public.imageBaseUrl}${imageLink.split('/').pop()}`
}
</script>
