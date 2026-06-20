import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ProductCustomizer } from "../components/ProductCustomizer";
import { Loading } from "./Loading";
import { useStore } from "../lib/store";
import type { Product, Customization } from "../components/types";

export function CustomizePage() {
  const { id } = useParams();
  const { selectedProduct, loadProducts, startCustomization, setPendingCustomization } = useStore();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(
    selectedProduct?.id === id ? selectedProduct : null,
  );
  const [loading, setLoading] = useState(product === null);

  useEffect(() => {
    if (product) return;
    let active = true;
    loadProducts()
      .then((list) => {
        if (!active) return;
        const found = list.find((p) => p.id === id);
        if (found) {
          startCustomization(found);
          setProduct(found);
        } else {
          navigate("/", { replace: true });
        }
      })
      .catch((e) => {
        console.error("Failed to load product for customization:", e);
        navigate("/", { replace: true });
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id, product, loadProducts, startCustomization, navigate]);

  if (loading || !product) return <Loading label="Memuat produk…" />;

  const onNext = (customization: Customization) => {
    setPendingCustomization(customization);
    navigate("/checkout");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <ProductCustomizer
      product={product}
      onBack={() => navigate("/")}
      onNext={onNext}
    />
  );
}
