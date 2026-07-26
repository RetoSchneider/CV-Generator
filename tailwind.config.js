/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
        display: ["Space Grotesk", "Inter", "sans-serif"],
      },
      colors: {
        ink: {
          50: "#f6f7f9",
          100: "#eceef2",
          200: "#d5dae3",
          300: "#aeb6c4",
          400: "#818ca0",
          500: "#616c81",
          600: "#4d566a",
          700: "#404757",
          800: "#373d4a",
          900: "#0b0d12",
          950: "#05070b",
        },
        accent: {
          DEFAULT: "#22d3ee",
          deep: "#0891b2",
        },
        neon: {
          green: "#34d399",
          purple: "#a78bfa",
          pink: "#f472b6",
        },
      },
      boxShadow: {
        page: "0 30px 80px -30px rgba(2, 6, 23, 0.55), 0 8px 30px -15px rgba(2,6,23,0.35)",
      },
    },
  },
  plugins: [],
};
