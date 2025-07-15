import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

const AuraCustom = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#e6e6f2',
      100: '#c8c9e6',
      200: '#a4a5d4',
      300: '#7e80c1',
      400: '#5558a3',
      500: '#0b0c3d',
      600: '#090a32',
      700: '#070827',
      800: '#05061d',
      900: '#030414',
      950: '#01010a',
    },
  },
});

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
    autoImport: true,
    components: {
      exclude: [
        'Form',
        'FormField',
        'Editor',
        'Chart',
      ],
    },
    options: {
      ripple: true,
      inputVariant: 'filled',
      theme: {
        preset: AuraCustom,
        options: {
          prefix: 'p',
          darkModeSelector: false,
          cssLayer: false,
        },
      },
    },
  },

  supabase: {
    redirect: false,
  },
});
