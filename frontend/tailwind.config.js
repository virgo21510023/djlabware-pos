// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Aktifkan mode gelap berbasis kelas
  theme: {
    extend: {
      colors: {
        // Light Mode
        'background': '#f0f4f9',
        'surface': '#ffffff',
        'primary': '#1967d2',
        'secondary': '#5f6368',
        'on-surface': '#1f1f1f',

        // Dark Mode
        'dark-background': '#131314',
        'dark-surface': '#1e1f20',
        'dark-primary': '#8ab4f8',
        'dark-secondary': '#9aa0a6',
        'dark-on-surface': '#e8eaed',
      },
      fontFamily: {
        sans: ['"Google Sans"', 'Roboto', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}