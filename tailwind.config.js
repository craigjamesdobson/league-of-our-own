module.exports = {
  theme: {
    extend: {
      fontFamily: {
        display: 'Bebas Neue, cursive',
        sans: '"Source Sans Pro", sans-serif',
      },
      colors: {
        primary: '#03044A',
        offWhite: '#F0F3FA',
      },
      spacing: {
        sidebar: '18rem',
      },
    },
  },
  variants: {},
  plugins: [],
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: [
      'components/**/*.vue',
      'layouts/**/*.vue',
      'pages/**/*.vue',
      'plugins/**/*.js',
      'nuxt.config.js',
      // TypeScript
      'plugins/**/*.ts',
      'nuxt.config.ts',
    ],
  },
}
