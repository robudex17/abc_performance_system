<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div class="bg-gray-800 text-white p-8 rounded-2xl w-full md:w-2/3 lg:w-1/2 max-h-[90vh] overflow-y-auto shadow-2xl">
      <div class="flex flex-col items-center text-center">
        <img
          v-if="team.team_image"
          :src="imageUrl(team.team_image)"
          alt="Team Image"
          class="w-40 h-40 rounded-full object-cover mb-4 border-4 border-gray-700 shadow-md"
        />
        <div v-else class="w-40 h-40 bg-gray-600 rounded-full mb-4 flex items-center justify-center text-white shadow-md">
          <span class="text-4xl font-bold">{{ team.team_name }}</span>
        </div>

        <div class="flex flex-col items-center">
          <h3 class="text-3xl font-semibold mb-2">{{ team.team_name }}</h3>
          <p class="text-sm text-gray-400">Team Leader: {{ team.team_leader_name }}</p>
          <p class="text-lg font-bold mb-2" :class="csdRatingClass(team.ratings_name) || setRatingNameColor(team)">{{ team.ratings_name }}</p>

          <div class="flex items-center justify-center mt-2 mb-3">
            <template v-for="i in 5" :key="i">
              <svg xmlns="http://www.w3.org/2000/svg" :class="getStarClass(team.final_ratings, i)" width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
            </template>
          </div>

          <p class="text-3xl font-bold mt-1">{{ team.final_ratings }}</p>
          <p class="text-lg font-semibold mt-3" v-if="team.month">Month Of: <span class="font-normal">{{ team.month }}</span></p>
          <p class="text-lg font-semibold">Year: <span class="font-normal">{{ team.year }}</span></p>
        </div>

        <!-- the members and their rating -->
        <div class="mt-6 w-full overflow-x-auto">
          <table class="min-w-full table-auto border-collapse border border-gray-700 text-center">
            <thead>
              <tr class="bg-gray-700">
                <th class="px-4 py-2 border border-gray-600">Team Members</th>
                <th class="px-4 py-2 border border-gray-600">Position</th>
                <th class="px-4 py-2 border border-gray-600">Rating</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="member in team.teams" :key="member.id" class="bg-gray-900 hover:bg-gray-700 transition">
                <td class="border border-gray-700 px-2 py-2">
                  <div class="flex items-center space-x-2">
                    <img
                      v-if="member.image_link"
                      :src="imageUrl(member.image_link)"
                      alt="Agent Image"
                      class="w-10 h-10 rounded-full object-cover border border-gray-600"
                    />
                    <span class="font-medium">{{ member.db_name }}</span>
                    <span v-if="member.id == team.team_leader_id" class="text-blue-400 font-bold">- TL</span>
                  </div>
                </td>
                <td class="px-4 py-2 border border-gray-700 font-semibold">{{ member.position_name }}</td>
                <td class="px-4 py-2 border border-gray-700 font-semibold" :class="csdRatingClass(member.ratings_name) || setRatingNameColor(member)">
                  {{ member.final_ratings }}
                  <span v-if="member.submitted === 0" class="block text-xs">INCOMPLETE</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <button
          @click="$emit('close')"
          class="mt-6 text-blue-300 hover:text-blue-500 font-semibold hover:underline hover:scale-105 transition duration-300"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getStarClass } from '@/utils/constants'

// The details of a team (CSD Team Monthly / Team Yearly): the rating of the team and of each member.
defineProps({
  show: { type: Boolean, default: false },
  team: { type: Object, default: () => ({}) },
})
defineEmits(['close'])

const config = useRuntimeConfig()
const { setRatingNameColor } = useRatingColor()

const imageUrl = (imageLink) => {
  if (!imageLink) return ''
  if (imageLink.startsWith('data:image') || /^https?:\/\//.test(imageLink)) return imageLink
  return `${config.public.imageBaseUrl}${imageLink.split('/').pop()}`
}
</script>

<style scoped>
.bg-gray-800 {
  max-height: 80vh;
  overflow-y: auto;
}
</style>
