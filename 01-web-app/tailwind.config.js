/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        alba: {
          black: "#0a0a0a",
          charcoal: "#141414",
          graphite: "#1c1c1c",
          steel: "#2a2a2a",
          silver: "#a3a3a3",
          mist: "#e5e5e5",
          white: "#fafafa",
          accent: "#c4a35a",
          accentSoft: "#d4b96a",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
