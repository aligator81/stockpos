/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb', // blue-600
          hover: '#1d4ed8', // blue-700
        },
        secondary: {
          DEFAULT: '#f97316', // orange-500
          hover: '#ea580c', // orange-600
        }
      }
    },
  },
  plugins: [],
}