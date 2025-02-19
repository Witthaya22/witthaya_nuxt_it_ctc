// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: [
    '@nuxt/icon',
    '@pinia/nuxt',

  ],

  css: ['@/assets/css/main.css',
       '@/assets/css/font.css',
       '~/assets/css/styles.css',

       ],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  vite: {
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:4000/',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    }
  },

  compatibilityDate: '2024-08-16',
  pages: true,
})
