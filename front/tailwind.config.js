// tailwind.config.js
module.exports = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4f46e5", // 👈 your main color
          dark: "#4338ca",
          light: "#6366f1",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
