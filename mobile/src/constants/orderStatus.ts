/**
 * constants/orderStatus.ts
 * ------------------------------------------------------------------
 * Metadata alur status pesanan (4 tahap) yang dipakai bersama oleh
 * halaman Lacak Pesanan (Pelanggan) dan Dashboard Admin.
 */
import type { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import type { OrderStatus } from "../types";

export interface OrderStatusMeta {
  id: OrderStatus;
  label: string;
  shortLabel: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  fg: string;
  bg: string;
}

/** Urutan resmi status pesanan sesuai backend server/server.js */
export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "menunggu_konfirmasi",
  "dalam_proses",
  "pesanan_siap",
  "selesai",
];

export const ORDER_STATUS_META: Record<OrderStatus, OrderStatusMeta> = {
  menunggu_konfirmasi: {
    id: "menunggu_konfirmasi",
    label: "Menunggu Konfirmasi",
    shortLabel: "Menunggu",
    description: "Pesananmu sedang ditinjau & dikonfirmasi oleh tim Faedah Shop.",
    icon: "time-outline",
    fg: colors.warning,
    bg: colors.warningBg,
  },
  dalam_proses: {
    id: "dalam_proses",
    label: "Dalam Proses",
    shortLabel: "Diproses",
    description: "Florist kami sedang merangkai buket kustommu dengan penuh cinta.",
    icon: "flower-outline",
    fg: colors.brand,
    bg: colors.brandTertiary,
  },
  pesanan_siap: {
    id: "pesanan_siap",
    label: "Pesanan Siap",
    shortLabel: "Siap",
    description: "Buketmu sudah siap untuk pengiriman atau pengambilan di toko.",
    icon: "checkmark-circle-outline",
    fg: colors.success,
    bg: colors.successBg,
  },
  selesai: {
    id: "selesai",
    label: "Selesai",
    shortLabel: "Selesai",
    description: "Pesanan telah selesai. Terima kasih telah memesan di Faedah Shop!",
    icon: "star-outline",
    fg: colors.textSecondary,
    bg: colors.surfaceSecondary,
  },
};

/** Mendapatkan status berikutnya dalam alur, atau null jika sudah selesai */
export function getNextOrderStatus(current: OrderStatus): OrderStatus | null {
  const idx = ORDER_STATUS_FLOW.indexOf(current);
  if (idx < 0 || idx >= ORDER_STATUS_FLOW.length - 1) return null;
  return ORDER_STATUS_FLOW[idx + 1];
}
