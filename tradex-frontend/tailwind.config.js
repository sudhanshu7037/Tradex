/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        trade: {
          primary: '#1D9E75',
          green: '#1D9E75',
          greenBg: '#E1F5EE',
          red: '#E24B4A',
          redBg: '#FCEBEB',
          bg: '#f8f8f6',
          card: '#ffffff',
          text: '#1a1a1a',
          muted: '#888888',
          border: '#eeeeee',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
