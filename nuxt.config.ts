// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  app: {
    head: {
      title: 'League of our own',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: '' },
      ],
      link: [
        {
          rel: 'icon',
          type: 'image/png',
          href: '/favicon.png',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300;0,400;0,500;0,700;0,900;1,300;1,400;1,500;1,700;1,900&display=swap',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@100;300;400;700;900&display=swap',
        },
      ],
    },
  },
  ssr: false,
  modules: [
    '@vueuse/nuxt',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    'nuxt-icon',
    '@nuxtjs/fontaine',
    'nuxt-vuefire',
  ],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/assets/components/layout.scss" as *;',
        },
      },
    },
  },
  vuefire: {
    auth: true,
    config: {
      apiKey: 'AIzaSyBMjHznJ_pmwBcn-ys1f-1dFVLzAw6hEeo',
      authDomain: 'league-of-our-own-63fa1.firebaseapp.com',
      projectId: 'league-of-our-own-63fa1',
      storageBucket: 'league-of-our-own-63fa1.appspot.com',
      messagingSenderId: '861637204204',
      appId: '1:861637204204:web:229369b4f531434e9aadc9',
      measurementId: 'G-FWYYJ66CWG',
    },
  },
});
