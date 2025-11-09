/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
        fontFamily: {
            sans: ['Poppins', 'sans-serif'],
            handwriting: ['Kalam', 'cursive'],
        },
    },
  },
  plugins: [],
}