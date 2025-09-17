/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        blueBackground: "#4361ee",
        cyanBackground: "#4cc9f0",
      },
    },
  },
  plugins: [],
};
