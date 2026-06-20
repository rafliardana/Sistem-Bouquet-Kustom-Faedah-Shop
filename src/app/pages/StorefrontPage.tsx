import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Catalog } from "../components/Catalog";
import { Loading } from "./Loading";
import { useStore } from "../lib/store";
import type { Product } from "../components/types";

export function StorefrontPage() {
  const { products, productsLoaded, loadProducts, startCustomization } = useStore();
  const [loading, setLoading] = useState(!productsLoaded);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    loadProducts()
      .catch((e) => {
        console.error("Failed to load products:", e);
        if (active) setError(e instanceof Error ? e.message : "Gagal memuat produk");
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [loadProducts]);

  const onSelect = (product: Product) => {
    startCustomization(product);
    navigate(`/product/${product.id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) return <Loading label="Memuat katalog…" />;
  if (error) {
    return (
      <div className="min-h-screen bg-brand-tertiary font-sans flex items-center justify-center p-6">
        <div className="bg-surface-bg rounded-corner-lg p-6 text-center max-w-sm">
          <p style={{ fontSize: "40px", lineHeight: "1" }}>🥀</p>
          <h2 className="text-heading text-text-primary mt-3 mb-1">Gagal Memuat Katalog</h2>
          <p className="text-label-sm text-text-secondary">{error}</p>
        </div>
      </div>
    );
  }
  return <Catalog products={products} onSelect={onSelect} />;
}
