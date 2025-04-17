/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#895a2a',
        'primary-dark': '#6b4423',
      },
    },
  },
  plugins: [],
} 