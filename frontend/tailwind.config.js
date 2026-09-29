/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#0E0D0C',
          900: '#171514',
          850: '#1F1C1A',
          800: '#2A2623',
          700: '#3D3833',
        },
        gold: {
          100: '#FDF7E7',
          200: '#F7E7BE',
          300: '#EDD38E',
          400: '#DEC065',
          500: '#C5A03A',
          600: '#A98322',
          700: '#876412',
          800: '#684B0A',
        },
        sourdough: {
          50: '#FAF8F5',
          100: '#F5F1EB',
          200: '#EBE4D8',
          300: '#DDD2BF',
          400: '#C8B99F',
          500: '#AD9A7B',
        },
        bakery: {
          50: '#FAF8F5',
          100: '#F5F1EB',
          200: '#EAE2D5',
          300: '#DCCFBD',
          400: '#C8B49B',
          500: '#B09475',
          600: '#8F7151',
          700: '#715538',
          800: '#523C26',
          900: '#382819',
          950: '#1F150C',
        },
        bolivia: {
          red: '#B82924',
          yellow: '#D4AF37',
          green: '#1B5E38',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        display: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
