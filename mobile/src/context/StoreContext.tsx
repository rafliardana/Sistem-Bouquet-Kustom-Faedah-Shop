// Context toko: cache daftar produk dan "draft" kustomisasi yang dibawa
// dari layar Kustomisasi ke layar Checkout (pengganti store.tsx versi web).
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { listProducts } from "@/api/services";
import type { PickedImage, Product } from "@/types";

// Hasil kustomisasi yang belum dikirim ke server.
export interface DraftOrder {
  product: Product;
  sizeId: string;
  selectedAddonIds: string[];
  description: string;
  referenceImage: PickedImage | null;
}

interface StoreContextValue {
  products: Product[];
  loading: boolean;
  error: string | null;
  loadProducts: (force?: boolean) => Promise<void>;
  draft: DraftOrder | null;
  setDraft: (draft: DraftOrder | null) => void;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftOrder | null>(null);
  const loaded = useRef(false);

  // force=true dipakai pull-to-refresh; selain itu memakai cache.
  const loadProducts = useCallback(async (force = false) => {
    if (loaded.current && !force) return;
    setLoading(true);
    setError(null);
    try {
      setProducts(await listProducts());
      loaded.current = true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat produk");
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({ products, loading, error, loadProducts, draft, setDraft }),
    [products, loading, error, loadProducts, draft],
  );
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore harus dipakai di dalam StoreProvider");
  return ctx;
}
