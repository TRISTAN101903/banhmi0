/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#C83214',
          'red-dark': '#A3240D',
          'red-light': '#FBEAE7',
          cream: '#FBF7EE',
          'cream-dark': '#EFE6D5',
          brown: '#5C3A21',
          'brown-light': '#8D5B36',
          'brown-dark': '#382011',
          green: '#2D6A4F',
          'green-light': '#E8F3EE',
          ivory: '#F4EFEA',
        }
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'warm': '0 10px 30px -5px rgba(92, 58, 33, 0.08), 0 4px 6px -2px rgba(92, 58, 33, 0.04)',
        'warm-lg': '0 20px 40px -10px rgba(92, 58, 33, 0.12), 0 8px 12px -4px rgba(92, 58, 33, 0.06)',
      }
    },
  },
  plugins: [],
};
