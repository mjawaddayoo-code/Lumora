/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#10201a',
        sand: '#faf8f4',
        brand: { 50: '#effaf5', 100: '#d8f5e9', 200: '#b0ead3', 300: '#7ddbb8', 400: '#3fc496', 500: '#17ab7d', 600: '#0b8a5e', 700: '#086f4c', 800: '#07583e', 900: '#064e3b' },
        peach: { 50: '#fff5ef', 100: '#ffe6d8', 400: '#ffb996', 500: '#ffa07a', 600: '#e8693a' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'], display: ['Fraunces', 'Georgia', 'serif'] },
      boxShadow: { soft: '0 8px 30px -12px rgba(16,32,26,.18)', lift: '0 18px 40px -16px rgba(11,138,94,.35)' },
    },
  },
  plugins: [],
};
