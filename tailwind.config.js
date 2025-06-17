/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef6f0',
          100: '#fcead9',
          200: '#f8d0b3',
          300: '#f4ae82',
          400: '#ee814f',
          500: '#df6d14',
          600: '#d15a09',
          700: '#ae460a',
          800: '#8b3810',
          900: '#712f10',
          950: '#3d1506',
        },
      },
    },
  },
  plugins: [],
};
