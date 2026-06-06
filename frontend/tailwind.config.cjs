/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        display: ['Instrument Serif', 'serif'],
        syne: ['Syne', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
