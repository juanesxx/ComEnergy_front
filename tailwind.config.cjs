/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#07a68a",   // Verde corporativo ComEnergia
        accent: "#00d4ff",  // Azul acento
        dark: "#0f172a",    // Texto oscuro
        soft: "#f5fdfb",    // Fondo claro
      },
      fontFamily: {
        sans: ["Poppins", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};
