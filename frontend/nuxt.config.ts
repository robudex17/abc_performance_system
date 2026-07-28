// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false, // Disable SSR for static generation
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css', '@fortawesome/fontawesome-svg-core/styles.css'],
  plugins: ["~/plugins/fontawesome.js", "~/plugins/socket.client.js"],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  modules: ['@pinia/nuxt'],

   // Add this part for setting the base URL
   app: {
    baseURL: '/abc_performance_management_system/', // Make sure this matches your Nginx location
  },

    nitro: {
    port: parseInt(process.env.NITRO_PORT || '3000')
  },

  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL,
      socketUrl: process.env.NUXT_PUBLIC_SOCKET_IO_URL,
      imageBaseUrl: process.env.NUXT_IMAGE_BASE_URL,
      soundsUrl: process.env.NUXT_SOUNDS_BASE_URL,
    },
   
  }
  
})
