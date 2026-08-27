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
          950: "#070B14",
          900: "#0B1220",
          850: "#0F182B",
          800: "#131F37",
          700: "#1D2D4F",
          600: "#2B3F6C",
          gold: "#D4AF37",
          "gold-light": "#F3E5AB",
          amber: "#F59E0B",
          cyan: "#06B6D4",
          emerald: "#10B981",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Outfit", "Inter", "sans-serif"],
        mono: ["JetBrains Mono", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
}
