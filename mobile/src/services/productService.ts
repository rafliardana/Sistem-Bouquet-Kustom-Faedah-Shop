/**
 * services/productService.ts
 * ------------------------------------------------------------------
 * Endpoint terkait produk/katalog buket.
 *   GET /api/products → { products: Product[] }
 */
import { apiRequest } from "./apiClient";
import type { Product } from "../types";

/** Mengambil seluruh produk buket dari backend */
export async function fetchProducts(): Promise<Product[]> {
  const { products } = await apiRequest<{ products: Product[] }>("/products");
  return products;
}
