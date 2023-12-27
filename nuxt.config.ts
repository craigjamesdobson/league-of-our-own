import path from 'path';

export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    'nuxt-icon',
    '@nuxtjs/supabase',
    '@nuxt/devtools',
    'nuxt-primevue',
  ],
  primevue: {
    options: { unstyled: true },
    importPT: {
      as: 'Lara',
      from: path.resolve(__dirname, '/presets/lara'),
    },
    components: {
      exclude: ['Editor', 'Chart'],
    },
  },
  tailwindcss: {
    config: {
      content: ['presets/**/*.{js,vue,ts}'],
      theme: {
        extend: {
          fontFamily: {
            display: '"Rubik", sans-serif',
            sans: '"Inter", "sans-serif"',
          },
          spacing: {
            sidebar: '18rem',
          },
          zIndex: {
            '-1': '-1',
          },
          colors: {
            primary: '#02033c',
            offWhite: '#F0F3FA',
            'primary-50': 'rgb(var(--primary-50))',
            'primary-100': 'rgb(var(--primary-100))',
            'primary-200': 'rgb(var(--primary-200))',
            'primary-300': 'rgb(var(--primary-300))',
            'primary-400': 'rgb(var(--primary-400))',
            'primary-500': 'rgb(var(--primary-500))',
            'primary-600': 'rgb(var(--primary-600))',
            'primary-700': 'rgb(var(--primary-700))',
            'primary-800': 'rgb(var(--primary-800))',
            'primary-900': 'rgb(var(--primary-900))',
            'primary-950': 'rgb(var(--primary-950))',
            'surface-0': 'rgb(var(--surface-0))',
            'surface-50': 'rgb(var(--surface-50))',
            'surface-100': 'rgb(var(--surface-100))',
            'surface-200': 'rgb(var(--surface-200))',
            'surface-300': 'rgb(var(--surface-300))',
            'surface-400': 'rgb(var(--surface-400))',
            'surface-500': 'rgb(var(--surface-500))',
            'surface-600': 'rgb(var(--surface-600))',
            'surface-700': 'rgb(var(--surface-700))',
            'surface-800': 'rgb(var(--surface-800))',
            'surface-900': 'rgb(var(--surface-900))',
            'surface-950': 'rgb(var(--surface-950))',
          },
        },
      },
    },
  },
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
  runtimeConfig: {
    public: {
      gtagId: 'G-YL6X3M2488',
    },
  },
  ssr: false,
  supabase: {
    redirect: false,
  },
});
