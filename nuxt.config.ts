export default defineNuxtConfig({
  css: ['~/assets/styles/main.scss'],
  modules: ['@pinia/nuxt'],

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/styles/_variables.scss" as *;'
        }
      }
    }
  },

  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap'
        }
      ]
    }
  },

  compatibilityDate: '2025-04-11'
})