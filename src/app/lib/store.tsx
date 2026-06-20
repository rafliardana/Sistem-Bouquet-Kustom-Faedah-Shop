import { createContext, useContext, useState, useCallback } from "react";
import type { Product, Customization } from "../components/types";
import { listProducts } from "./api";

interface StoreContextValue {
  products: Product[];
  productsLoaded: boolean;
  loadProducts: (force?: boolean) => Promise<Product[]>;
  // Customization flow carried between catalog → customize → checkout
  selectedProduct: Product | null;
  pendingCustomization: Customization | null;
  startCustomization: (product: Product) => void;
  setPendingCustomization: (c: Customization) => void;
  clearFlow: () => void;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [pendingCustomization, setPending] = useState<Customization | null>(null);

  const loadProducts = useCallback(async (force = false) => {
    if (productsLoaded && !force) return products;
    const list = await listProducts();
    setProducts(list);
    setProductsLoaded(true);
    return list;
  }, [products, productsLoaded]);

  const startCustomization = useCallback((product: Product) => {
    setSelectedProduct(product);
    setPending(null);
  }, []);

  const setPendingCustomization = useCallback((c: Customization) => setPending(c), []);

  const clearFlow = useCallback(() => {
    setSelectedProduct(null);
    setPending(null);
  }, []);

  return (
    <StoreContext.Provider
      value={{
        products,
        productsLoaded,
        loadProducts,
        selectedProduct,
        pendingCustomization,
        startCustomization,
        setPendingCustomization,
        clearFlow,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
