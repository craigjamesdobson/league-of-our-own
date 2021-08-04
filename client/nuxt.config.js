export default {
  // Global page headers (https://go.nuxtjs.dev/config-head)
  head: {
    title: 'League of our own',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Source+Sans+Pro:ital,wght@0,200;0,300;0,400;0,600;0,700;0,900;1,200;1,300;1,400;1,600;1,700;1,900&display=swap',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Karla:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,200;1,300;1,400;1,500;1,600;1,700;1,800&display=swap',
      },
    ],
  },
  ssr: false,

  // Global CSS (https://go.nuxtjs.dev/config-css)
  css: [],

  // Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
  plugins: ['~/plugins/vee-validate.js'],

  // Auto import components (https://go.nuxtjs.dev/config-components)
  components: true,

  // Modules for dev and build (recommended) (https://go.nuxtjs.dev/config-modules)
  buildModules: [
    '@nuxt/postcss8',
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
    // https://go.nuxtjs.dev/tailwindcss
    '@nuxtjs/tailwindcss',
    '@nuxtjs/composition-api/module',
    '@nuxtjs/fontawesome',
    '@nuxtjs/svg-sprite',
  ],

  tailwindcss: {
    cssPath: '~/assets/tailwind.css',
  },

  fontawesome: {
    icons: {
      solid: [
        'faUsers',
        'faListOl',
        'faChartArea',
        'faUserAlt',
        'faChevronDown',
        'faSearch',
        'faInfo',
        'faSignInAlt',
        'faExclamationCircle',
        'faCheckCircle',
        'faUserCircle',
        'faTimes',
        'faRedo',
        'faCalendarAlt',
      ],
      regular: ['faCaretSquareDown'],
    },
  },

  // Modules (https://go.nuxtjs.dev/config-modules)
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',
    '@nuxtjs/style-resources',
    'portal-vue/nuxt',
  ],
  styleResources: {
    scss: ['./assets/scss/*.scss'],
  },

  // Axios module configuration (https://go.nuxtjs.dev/config-axios)
  axios: {},

  // Build Configuration (https://go.nuxtjs.dev/config-build)
  build: {
    transpile: ['vee-validate/dist/rules'],
  },
  server: {
    port: 3000, // default: 3000
    host: '0.0.0.0', // default: localhost
  }, // other configs
}
