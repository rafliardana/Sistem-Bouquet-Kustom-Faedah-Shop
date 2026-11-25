/**
 * constants/catalog.ts
 * ------------------------------------------------------------------
 * Konstanta tampilan katalog: warna badge per kategori (mengikuti
 * CATEGORY_VARIANTS versi web) dan daftar keunggulan toko.
 */
import { colors } from "../theme/colors";

export const ALL_CATEGORIES = "Semua";

/** Warna badge kategori: [warna teks, warna latar] */
export const CATEGORY_COLORS: Record<string, { fg: string; bg: string }> = {
  Mawar: { fg: colors.brand, bg: colors.brandTertiary },
  Tulip: { fg: colors.brand, bg: colors.brandTertiary },
  "Bunga Matahari": { fg: colors.warning, bg: colors.warningBg },
  "Bunga Kering": { fg: colors.textSecondary, bg: colors.surfaceSecondary },
  Campur: { fg: colors.success, bg: colors.successBg },
};

export const DEFAULT_CATEGORY_COLOR = { fg: colors.textSecondary, bg: colors.surfaceSecondary };

/** Keunggulan toko yang ditampilkan di banner katalog */
export const SHOP_HIGHLIGHTS = [
  { icon: "🎨", label: "Kustomisasi Bebas" },
  { icon: "💐", label: "Bunga Segar" },
  { icon: "🚀", label: "Pengiriman Cepat" },
  { icon: "⭐", label: "Kualitas Premium" },
] as const;
