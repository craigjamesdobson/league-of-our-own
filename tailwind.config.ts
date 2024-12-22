/** @type {import('tailwindcss').Config} */

module.exports = {
  plugins: [require('tailwindcss-primeui')],
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
      gridTemplateColumns: {
        19: 'repeat(19, minmax(0, 1fr))',
      },
    },
  },
};
