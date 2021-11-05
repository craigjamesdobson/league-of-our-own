module.exports = {
  mode: 'jit',
  theme: {
    extend: {
      fontFamily: {
        display: 'Bebas Neue, cursive',
        sans: '"Karla", sans-serif'
      },
      colors: {
        primary: '#03044A',
        offWhite: '#F0F3FA'
      },
      spacing: {
        sidebar: '18rem'
      },
      zIndex: {
        '-1': '-1'
      }
    }
  },
  variants: {
    extend: {
      opacity: ['disabled'],
      border: ['last'],
      margin: ['last']
    }
  },
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
      'nuxt.config.ts'
    ]
  },
  future: {
    purgeLayersByDefault: true
  }
}
