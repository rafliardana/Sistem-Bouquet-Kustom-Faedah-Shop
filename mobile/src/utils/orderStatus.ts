// Metadata status pesanan: label, deskripsi, ikon, dan warna badge.
// Urutan STATUS_FLOW sama dengan STATUS_ORDER di server.
import type { OrderStatus } from "@/types";
import type { BadgeVariant } from "@/components/ui/Badge";

export const STATUS_FLOW: OrderStatus[] = ["menunggu_konfirmasi", "dalam_proses", "pesanan_siap", "selesai"];

export const STATUS_META: Record<
  OrderStatus,
  { label: string; short: string; description: string; icon: string; variant: BadgeVariant }
> = {
  menunggu_konfirmasi: {
    label: "Menunggu Konfirmasi",
    short: "Menunggu",
    description: "Pesananmu sedang ditinjau oleh tim kami",
    icon: "time-outline",
    variant: "warning",
  },
  dalam_proses: {
    label: "Dalam Proses",
    short: "Diproses",
    description: "Florist kami sedang merangkai buketmu dengan penuh cinta",
    icon: "cube-outline",
    variant: "brand",
  },
  pesanan_siap: {
    label: "Pesanan Siap",
    short: "Siap",
    description: "Buketmu sudah siap, menunggu pengiriman atau pengambilan",
    icon: "checkmark-circle-outline",
    variant: "success",
  },
  selesai: {
    label: "Selesai",
    short: "Selesai",
    description: "Pesanan telah selesai. Terima kasih sudah memesan! 🌸",
    icon: "star-outline",
    variant: "default",
  },
};

export function statusIndex(status: OrderStatus): number {
  return STATUS_FLOW.indexOf(status);
}

// Status berikutnya, atau null jika sudah "selesai".
export function nextStatus(status: OrderStatus): OrderStatus | null {
  const i = statusIndex(status);
  return i >= 0 && i < STATUS_FLOW.length - 1 ? STATUS_FLOW[i + 1] : null;
}
