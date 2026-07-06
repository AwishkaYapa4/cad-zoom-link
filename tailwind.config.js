/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fef2f2',
          100: '#fde3e3',
          200: '#fbc9c9',
          300: '#f7a3a3',
          400: '#f06e6e',
          500: '#e33a3a',
          600: '#cc1414',
          700: '#a90f0f',
          800: '#8c1212',
          900: '#751414',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 10px -2px rgba(16, 24, 40, 0.06), 0 8px 24px -8px rgba(16, 24, 40, 0.10)',
        card: '0 1px 2px rgba(16, 24, 40, 0.06), 0 1px 3px rgba(16, 24, 40, 0.10)',
      },
    },
  },
  plugins: [],
}
