/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-main': '#0b0e14',
        'bg-card': '#131924',
        'bg-sidebar': '#0f141e',
      }
    },
  },
  plugins: [],
}
