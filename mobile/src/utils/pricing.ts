/**
 * utils/pricing.ts
 * ------------------------------------------------------------------
 * Kalkulasi harga kustomisasi buket secara real-time di sisi klien.
 * Rumus dibuat identik dengan fungsi `computeTotal` pada server/server.js
 * agar estimasi di layar selalu cocok dengan total yang dicatat server.
 */
import type { Product } from "../types";

export interface PriceBreakdown {
  flowerPrice: number;
  addonTotal: number;
  totalPrice: number;
}

export function computeOrderPrice(
  product: Product,
  sizeId: string,
  selectedAddonIds: string[],
): PriceBreakdown {
  const size = product.sizes.find((s) => s.id === sizeId);
  const multiplier = size?.priceMultiplier ?? 1;
  const flowerPrice = Math.round(product.basePrice * multiplier);

  const addonTotal = selectedAddonIds.reduce((sum, id) => {
    const addon = product.addons.find((a) => a.id === id);
    return sum + (addon?.price ?? 0);
  }, 0);

  return {
    flowerPrice,
    addonTotal,
    totalPrice: flowerPrice + addonTotal,
  };
}
