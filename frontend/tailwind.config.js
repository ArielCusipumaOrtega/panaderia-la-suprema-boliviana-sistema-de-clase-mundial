/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bakery: {
          50: '#FDF8F3',
          100: '#FBF0E4',
          200: '#F5DCBF',
          300: '#ECC493',
          400: '#E1A462',
          500: '#D58235',
          600: '#C16625',
          700: '#9E4C1E',
          800: '#7F3D1C',
          900: '#673319',
          950: '#38180A',
        },
        bolivia: {
          red: '#D52B1E',
          yellow: '#F9E300',
          green: '#007A3D',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
