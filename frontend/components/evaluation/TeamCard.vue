<template>
  <div class="bg-gray-800 text-white border rounded-lg shadow-lg overflow-hidden">
    <div class="flex flex-col items-center justify-center text-center p-4">
      <div
        class="px-3 py-1 m-2 text-xl font-semibold"
        :class="team.tag ? 'px-4 py-1 text-sm font-bold uppercase tracking-widest bg-purple-600/20 text-purple-400 rounded-full border border-purple-500' : 'py-5'"
      >
        {{ team.tag }}
      </div>

      <img
        v-if="team.team_image"
        :src="imageUrl(team.team_image)"
        alt="Team Image"
        class="w-20 h-20 rounded-full object-cover mb-4"
      />
      <div v-else class="w-20 h-20 bg-gray-300 rounded-full mb-4 flex items-center justify-center text-white">
        <span class="text-lg pb-2">{{ team.team_name || '' }}</span>
      </div>

      <div class="text-center flex flex-col items-center">
        <h2 class="text-lg font-semibold">{{ team.team_name }}</h2>
        <p class="text-sm text-gray-400">Team Leader: {{ team.team_leader_name }}</p>
        <p class="text-sm font-bold p-2" :class="csdRatingClass(team.ratings_name) || setRatingNameColor(team)">{{ team.ratings_name }}</p>

        <div class="flex items-center justify-center mt-1">
          <template v-for="i in 5" :key="i">
            <svg xmlns="http://www.w3.org/2000/svg" :class="getStarClass(team.final_ratings, i)" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
          </template>
        </div>

        <p class="text-xl font-bold mt-2">{{ team.final_ratings }}</p>
        <p class="text-xl font-bold mt-2" v-if="team.month">{{ team.month }}</p>
        <p class="text-xl font-bold mt-2">{{ team.year }}</p>
      </div>

      <button
        @click="$emit('details', team)"
        class="mt-3 text-green-300 hover:text-green-500 font-semibold hover:underline hover:scale-105 transition duration-300"
      >
        Performance Details
      </button>
    </div>
  </div>
</template>

<script setup>
import { getStarClass } from '@/utils/constants'

defineProps({ team: { type: Object, required: true } })
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
