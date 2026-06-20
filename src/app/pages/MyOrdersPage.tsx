import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { OrderTracker } from "../components/OrderTracker";
import { Loading } from "./Loading";
import { useAuth } from "../lib/auth";
import { listOrders } from "../lib/api";
import type { Order } from "../components/types";

export function MyOrdersPage() {
  const { profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const newOrderId = (location.state as { newOrderId?: string } | null)?.newOrderId ?? null;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Require login.
  useEffect(() => {
    if (!authLoading && !profile) {
      navigate("/login?redirect=/pesanan-saya", { replace: true });
    }
  }, [authLoading, profile, navigate]);

  useEffect(() => {
    if (authLoading || !profile) return;
    let active = true;
    listOrders()
      .then((list) => active && setOrders(list))
      .catch((e) => {
        console.error("Failed to load orders:", e);
        if (active) setError(e instanceof Error ? e.message : "Gagal memuat pesanan");
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [authLoading, profile]);

  if (authLoading || loading) return <Loading label="Memuat pesanan…" />;
  if (error) {
    return (
      <div className="min-h-screen bg-brand-tertiary font-sans flex items-center justify-center p-6">
        <div className="bg-surface-bg rounded-corner-lg p-6 text-center max-w-sm">
          <p style={{ fontSize: "40px", lineHeight: "1" }}>🥀</p>
          <h2 className="text-heading text-text-primary mt-3 mb-1">Gagal Memuat Pesanan</h2>
          <p className="text-label-sm text-text-secondary">{error}</p>
        </div>
      </div>
    );
  }

  return <OrderTracker orders={orders} newOrderId={newOrderId} />;
}
