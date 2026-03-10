/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        game: ['Nunito', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
