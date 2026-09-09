/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aviation: {
          950: "#FAFBFC",
          900: "#FFFFFF",
          850: "#F1F5F9",
          800: "#E2E8F0",
          700: "#CBD5E1",
          600: "#94A3B8",
          gold: "#65A30D",
          "gold-light": "#84CC16",
          amber: "#EA580C",
          cyan: "#0EA5E9",
          emerald: "#16A34A",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
}
