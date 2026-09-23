/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        loot: {
          orange: "#F5940C",
          teal: "#1ABC9C",
          black: "#0B0B0B",
        },
      },
      borderRadius: {
        pill: "999px",
      },
    },
  },
  plugins: [],
};
