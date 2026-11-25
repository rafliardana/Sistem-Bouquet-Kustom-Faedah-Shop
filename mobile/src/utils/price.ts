// Kalkulasi harga real-time di customizer.
// Rumus HARUS identik dengan computeTotal() di server/server.js:
//   harga bunga = round(basePrice x priceMultiplier ukuran)
//   total       = harga bunga + jumlah harga addon terpilih
// Server tetap menghitung ulang total, jadi nilai ini hanya untuk tampilan.
import type { Product } from "@/types";

export interface PriceBreakdown {
  flowerPrice: number;
  addonTotal: number;
  total: number;
}

export function calculatePrice(product: Product, sizeId: string, addonIds: string[]): PriceBreakdown {
  const size = product.sizes.find((s) => s.id === sizeId);
  const flowerPrice = Math.round(product.basePrice * (size?.priceMultiplier ?? 1));
  const addonTotal = addonIds.reduce(
    (sum, id) => sum + (product.addons.find((a) => a.id === id)?.price ?? 0),
    0,
  );
  return { flowerPrice, addonTotal, total: flowerPrice + addonTotal };
}
