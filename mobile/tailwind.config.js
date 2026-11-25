// Token desain Faedah Shop, disalin dari src/styles/globals.css versi web
// agar tampilan mobile konsisten dengan web (CPMK110).
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#5250f3",
          hover: "#4240d4",
          dark: "#3230b5",
          secondary: "#d4d4fc",
          tertiary: "#eaeaff",
          muted: "#f0f0ff",
        },
        surface: { DEFAULT: "#ffffff", secondary: "#f5f5f8" },
        ink: { DEFAULT: "#16161d", secondary: "#4b4b5c", tertiary: "#8a8a9a" },
        line: "#e4e4ec",
        success: { DEFAULT: "#16a34a", soft: "#dcfce7" },
        warning: { DEFAULT: "#d97706", soft: "#fef3c7" },
        danger: { DEFAULT: "#dc2626", soft: "#fee2e2" },
      },
      borderRadius: { xl: "14px", "2xl": "20px" },
    },
  },
  plugins: [],
};
