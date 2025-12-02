// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2024-12-01',
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
})
