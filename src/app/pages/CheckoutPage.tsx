import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Checkout, type CheckoutPayload } from "../components/Checkout";
import { Loading } from "./Loading";
import { useStore } from "../lib/store";
import { useAuth } from "../lib/auth";
import { createOrder, listPaymentMethods } from "../lib/api";
import type { PaymentMethod } from "../components/types";

export function CheckoutPage() {
  const { selectedProduct, pendingCustomization, clearFlow } = useStore();
  const { profile, loading } = useAuth();
  const navigate = useNavigate();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[] | null>(null);

  useEffect(() => {
    let active = true;
    listPaymentMethods()
      .then((m) => active && setPaymentMethods(m))
      .catch((e) => {
        console.error("Failed to load payment methods:", e);
        if (active) setPaymentMethods([]);
      });
    return () => { active = false; };
  }, []);

  // Need an active customization flow to check out.
  useEffect(() => {
    if (!selectedProduct || !pendingCustomization) {
      navigate("/", { replace: true });
    }
  }, [selectedProduct, pendingCustomization, navigate]);

  // Checkout requires login — send guests to login then back here.
  useEffect(() => {
    if (!loading && !profile) {
      navigate("/login?redirect=/checkout", { replace: true });
    }
  }, [loading, profile, navigate]);

  if (loading || paymentMethods === null) return <Loading label="Memuat…" />;
  if (!selectedProduct || !pendingCustomization || !profile) return <Loading label="Mengarahkan…" />;

  const onPlaceOrder = async (payload: CheckoutPayload) => {
    const order = await createOrder({
      productId: selectedProduct.id,
      sizeId: pendingCustomization.sizeId,
      description: pendingCustomization.description,
      selectedAddonIds: pendingCustomization.selectedAddonIds,
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      customerAddress: payload.customerAddress,
      paymentMethod: payload.paymentMethod,
      referenceImageBase64: pendingCustomization.referenceImagePreview,
      paymentProofBase64: payload.paymentProofBase64,
    });
    clearFlow();
    navigate("/pesanan-saya", { state: { newOrderId: order.id } });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Checkout
      product={selectedProduct}
      customization={pendingCustomization}
      paymentMethods={paymentMethods}
      onBack={() => navigate(`/product/${selectedProduct.id}`)}
      onPlaceOrder={onPlaceOrder}
      defaultName={profile.name}
    />
  );
}
