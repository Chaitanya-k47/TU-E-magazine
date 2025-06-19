/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", // Vite's main HTML file
    "./src/**/*.{js,ts,jsx,tsx}", // All JS, TS, JSX, TSX files in the src folder
  ],
  theme: {
    extend: {},
  },
  plugins: [
     require('@headlessui/tailwindcss') 
  ],
}

