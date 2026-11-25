// Konstanta warna untuk prop yang tidak bisa memakai className
// (warna ikon, tab bar, ActivityIndicator, RefreshControl).
// Nilainya identik dengan tailwind.config.js.
export const colors = {
  brand: "#5250f3",
  brandDark: "#3230b5",
  brandTertiary: "#eaeaff",
  surface: "#ffffff",
  surfaceSecondary: "#f5f5f8",
  ink: "#16161d",
  inkSecondary: "#4b4b5c",
  inkTertiary: "#8a8a9a",
  line: "#e4e4ec",
  success: "#16a34a",
  warning: "#d97706",
  danger: "#dc2626",
} as const;
