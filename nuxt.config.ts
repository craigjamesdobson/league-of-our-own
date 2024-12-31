export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    'nuxt-icon',
    '@nuxtjs/supabase',
    '@nuxt/devtools',
    '@primevue/nuxt-module',
    'nuxt-gtag',
    '@zadigetvoltaire/nuxt-gtm',
    'nuxt-module-hotjar',
    '@nuxt/eslint',
    '@nuxtjs/color-mode',
  ],

  ssr: false,

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

  css: ['@/assets/styles/base.css'],

  colorMode: {
    preference: 'light',
  },

  runtimeConfig: {
    public: {
      SITE_URL: process.env.SITE_URL,
      ACTIVE_SEASON: process.env.ACTIVE_SEASON,
    },
  },

  compatibilityDate: '2024-12-17',

  gtag: {
    id: 'G-FWYYJ66CWG',
  },

  gtm: {
    id: 'GTM-N3HLZXHC',
  },

  hotjar: {
    hotjarId: 5090647,
  },

  primevue: {
    options: {
      theme: 'none',
    },
  },

  supabase: {
    redirect: false,
  },
});
