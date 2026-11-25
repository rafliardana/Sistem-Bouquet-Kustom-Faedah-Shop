/**
 * tailwind.config.js
 * ------------------------------------------------------------------
 * Konfigurasi Tailwind CSS (v3) untuk NativeWind.
 * Token warna disalin dari versi web (src/styles/globals.css — Astra UI)
 * agar identitas visual Faedah Shop konsisten di Web, Android, dan iOS.
 * Nilai yang sama juga diekspor di src/theme/colors.ts untuk komponen
 * yang membutuhkan warna dalam bentuk JS (mis. ikon & tab bar).
 */
const { palette } = require("./src/theme/palette");

/** @type {import('tailwindcss').Config} */
module.exports = {
  // Semua file yang memakai className harus terdaftar di sini
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: palette.brand,
          hover: palette.brandHover,
          dark: palette.brandDark,
          secondary: palette.brandSecondary,
          tertiary: palette.brandTertiary,
          muted: palette.brandMuted,
        },
        surface: {
          DEFAULT: palette.surface,
          secondary: palette.surfaceSecondary,
        },
        ink: {
          DEFAULT: palette.textPrimary,
          secondary: palette.textSecondary,
          tertiary: palette.textTertiary,
        },
        line: {
          DEFAULT: palette.border,
          subtle: palette.borderSubtle,
        },
        success: { DEFAULT: palette.success, bg: palette.successBg },
        warning: { DEFAULT: palette.warning, bg: palette.warningBg },
        danger: { DEFAULT: palette.danger, bg: palette.dangerBg },
      },
      borderRadius: {
        card: "16px",
        chip: "999px",
      },
    },
  },
  plugins: [],
};
