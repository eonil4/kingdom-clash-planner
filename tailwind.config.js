/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'rarity-common': '#808080',
        'rarity-rare': '#4A90E2',
        'rarity-epic': '#9B59B6',
        'rarity-legendary': '#F5A623',
      },
    },
  },
  plugins: [],
}

