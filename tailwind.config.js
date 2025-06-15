/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      colors: {
        typing: {
          correct: "#4ade80", // green-400
          incorrect: "#ef4444", // red-500
          current: "#3b82f6", // blue-500
          untyped: "#6b7280", // gray-500
        },
      },
    },
  },
  plugins: [],
  darkMode: "class",
};
