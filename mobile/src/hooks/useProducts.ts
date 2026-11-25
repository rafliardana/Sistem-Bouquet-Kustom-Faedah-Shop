/**
 * hooks/useProducts.ts
 * ------------------------------------------------------------------
 * Custom hook untuk memuat katalog produk dengan:
 *   - Cache di memori (5 menit) → berpindah tab tidak memicu request ulang
 *   - Status loading, refreshing (pull-to-refresh), dan error
 *   - Pencegahan update state setelah komponen di-unmount
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { fetchProducts } from "../services/productService";
import type { Product } from "../types";

const CACHE_TTL_MS = 5 * 60 * 1000;
let cache: { data: Product[]; fetchedAt: number } | null = null;

export function useProducts() {
  const isFresh = cache !== null && Date.now() - cache.fetchedAt < CACHE_TTL_MS;

  const [products, setProducts] = useState<Product[]>(cache?.data ?? []);
  const [loading, setLoading] = useState(!isFresh);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const load = useCallback(async (mode: "initial" | "refresh") => {
    if (mode === "refresh") setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts();
      cache = { data, fetchedAt: Date.now() };
      if (mounted.current) setProducts(data);
    } catch (err) {
      if (mounted.current) setError(err instanceof Error ? err.message : "Gagal memuat produk");
    } finally {
      if (mounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    if (!isFresh) load("initial");
    return () => {
      mounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    products,
    loading,
    refreshing,
    error,
    refresh: () => load("refresh"),
    retry: () => load("initial"),
  };
}

/** Ambil satu produk dari cache (dipakai halaman Kustomisasi) */
export function getCachedProduct(id: string): Product | undefined {
  return cache?.data.find((p) => p.id === id);
}
