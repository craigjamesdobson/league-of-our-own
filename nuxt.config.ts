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
  components: {
    tooltip: {
      root: {
        maxWidth: '15rem',
      },
    },
  },
});

export default defineNuxtConfig({
  modules: [
    // Core framework modules
    '@pinia/nuxt',
    '@nuxtjs/supabase',

    // UI and styling modules
    '@nuxtjs/tailwindcss',
    '@primevue/nuxt-module',
    '@nuxt/icon',
    '@nuxtjs/color-mode',

    // Analytics and tracking
    '@nuxt/scripts',
    'nuxt-module-hotjar',
    '@nuxtjs/turnstile',

    // Development and tooling
    '@nuxt/devtools',
    '@nuxt/eslint',
  ],

  ssr: false,

  // Modern Nuxt 4 app configuration
  app: {
    head: {
      title: 'League of our own',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'A fantasy football league management platform for friends and family' },
        { name: 'theme-color', content: '#0b0c3d' },
        { property: 'og:title', content: 'League of our own' },
        { property: 'og:description', content: 'A fantasy football league management platform for friends and family' },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'League of our own' },
        { name: 'twitter:description', content: 'A fantasy football league management platform for friends and family' },
      ],
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'icon',
          type: 'image/png',
          href: '/favicon.png',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300..900;1,300..900&display=swap',
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
    preference: 'system', // Respects user's system preference
    fallback: 'light', // Fallback when system preference can't be determined
  },

  runtimeConfig: {
    turnstile: {
      secretKey: process.env.TURNSTILE_SECRET_KEY,
    },
    public: {
      SITE_URL: process.env.SITE_URL,
      ACTIVE_SEASON: process.env.ACTIVE_SEASON,
      SITE_OPEN: process.env.SITE_OPEN === 'true',
      nodeEnv: process.env.NODE_ENV || 'development',
      turnstile: {
        siteKey: process.env.TURNSTILE_SITE_KEY,
      },
    },
  },

  compatibilityDate: '2024-12-17',

  nitro: {
    externals: {
      inline: ['resend'],
    },
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

  scripts: {
    registry: {
      googleTagManager: {
        id: 'GTM-N3HLZXHC',
      },
    },
  },

  supabase: {
    redirect: false,
  },

  turnstile: {
    addValidateEndpoint: true,
  },
});
