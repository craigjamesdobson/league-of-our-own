module.exports = {
  mode: "jit",
  theme: {
    extend: {
      fontFamily: {
        display: '"Rubik", sans-serif',
        sans: '"Inter", "sans-serif"',
      },
      colors: {
        primary: "#03044A",
        offWhite: "#F0F3FA",
      },
      spacing: {
        sidebar: "18rem",
      },
      zIndex: {
        "-1": "-1",
      },
    },
  },
  variants: {
    extend: {
      opacity: ["disabled"],
      border: ["last"],
      margin: ["last"],
    },
  },
  plugins: [],
};
