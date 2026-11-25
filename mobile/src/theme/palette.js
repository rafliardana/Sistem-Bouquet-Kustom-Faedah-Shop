/**
 * palette.js
 * ------------------------------------------------------------------
 * Sumber tunggal (single source of truth) warna aplikasi.
 * Ditulis dalam CommonJS agar bisa di-require oleh tailwind.config.js
 * sekaligus di-import oleh kode TypeScript (lihat colors.ts).
 * Warna diambil dari design system versi web (Astra UI).
 * Catatan: warna teks/border memakai hex solid (bukan rgba) agar
 * tampil identik di Android & iOS.
 */
const palette = {
  // Brand (ungu-indigo khas Faedah Shop)
  brand: "#5250F3",
  brandHover: "#4240D4",
  brandDark: "#3230B5",
  brandSecondary: "#D4D4FC",
  brandTertiary: "#EAEAFF",
  brandMuted: "#F0F0FF",

  // Permukaan
  surface: "#FFFFFF",
  surfaceSecondary: "#F5F5F8",

  // Teks (setara rgba(0,0,0,.85/.55/.35) di atas putih)
  textPrimary: "#262626",
  textSecondary: "#737373",
  textTertiary: "#A6A6A6",

  // Garis / border
  border: "#E5E5E5",
  borderSubtle: "#F0F0F0",

  // Status pesanan
  success: "#16A34A",
  successBg: "#DCFCE7",
  warning: "#D97706",
  warningBg: "#FEF3C7",
  danger: "#DC2626",
  dangerBg: "#FEE2E2",

  white: "#FFFFFF",
};

module.exports = { palette };
