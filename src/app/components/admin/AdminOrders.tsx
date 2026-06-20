import { useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Loading } from "../../pages/Loading";
import { listOrders, updateOrderStatus } from "../../lib/api";
import {
  ChevronDown, ChevronUp, MapPin, Phone, User, CreditCard, Mail, ArrowRight, Check,
} from "lucide-react";
import type { Order, OrderStatus } from "../types";

const STATUS_FLOW: OrderStatus[] = ["menunggu_konfirmasi", "dalam_proses", "pesanan_siap", "selesai"];

const STATUS_CFG: Record<OrderStatus, { label: string; variant: "default" | "success" | "warning" | "danger" | "brand" | "secondary" }> = {
  menunggu_konfirmasi: { label: "Menunggu Konfirmasi", variant: "warning" },
  dalam_proses: { label: "Dalam Proses", variant: "brand" },
  pesanan_siap: { label: "Pesanan Siap", variant: "success" },
  selesai: { label: "Selesai", variant: "default" },
};

const PAYMENT_LABELS: Record<string, string> = {
  transfer_bca: "Transfer BCA", transfer_mandiri: "Transfer Mandiri",
  gopay: "GoPay", ovo: "OVO", cod: "COD (Bayar di Tempat)",
};

function OrderRow({ order, onChange }: { order: Order; onChange: (o: Order) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const cfg = STATUS_CFG[order.status];
  const size = order.product.sizes.find((s) => s.id === order.customization.sizeId);
  const currentIdx = STATUS_FLOW.indexOf(order.status);
  const nextStatus = currentIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIdx + 1] : null;

  const setStatus = async (status: OrderStatus) => {
    setUpdating(true);
    try {
      const updated = await updateOrderStatus(order.id, status);
      onChange(updated);
    } catch (e) {
      console.error("Failed to update order status:", e);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-surface-bg rounded-corner-lg border border-border-primary overflow-hidden">
      <div className="p-4 flex items-start justify-between gap-2">
        <div className="flex gap-3 min-w-0">
          <div className="rounded-corner-md overflow-hidden flex-shrink-0" style={{ width: "56px", height: "56px" }}>
            <img src={order.product.image} alt={order.product.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-label font-semibold text-text-primary truncate">{order.product.name}</p>
              <Badge label={cfg.label} variant={cfg.variant} />
            </div>
            <p className="text-video-title text-text-tertiary">
              {order.orderNumber} • {new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
            </p>
            <p className="text-label-sm text-text-secondary truncate">{order.customerName} • {order.customerPhone}</p>
            <p className="text-label-sm font-semibold text-brand-primary">Rp {order.totalPrice.toLocaleString("id-ID")}</p>
          </div>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="text-text-tertiary hover:text-text-secondary transition-colors flex-shrink-0">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-border-secondary px-4 pb-4 pt-4 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: <User className="w-4 h-4" />, label: "Pemesan", value: order.customerName },
              { icon: <Mail className="w-4 h-4" />, label: "Email", value: order.customerEmail },
              { icon: <Phone className="w-4 h-4" />, label: "WhatsApp", value: order.customerPhone },
              { icon: <CreditCard className="w-4 h-4" />, label: "Pembayaran", value: order.paymentMethodLabel ?? PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod },
            ].map((row) => (
              <div key={row.label} className="flex items-start gap-1.5">
                <span className="text-text-tertiary mt-1 flex-shrink-0">{row.icon}</span>
                <div className="min-w-0">
                  <p className="text-video-title text-text-tertiary">{row.label}</p>
                  <p className="text-label-sm text-text-primary break-words">{row.value}</p>
                </div>
              </div>
            ))}
            <div className="flex items-start gap-1.5 sm:col-span-2">
              <MapPin className="w-4 h-4 text-text-tertiary mt-1 flex-shrink-0" />
              <div>
                <p className="text-video-title text-text-tertiary">Alamat</p>
                <p className="text-label-sm text-text-primary">{order.customerAddress}</p>
              </div>
            </div>
          </div>

          <div className="bg-bg-faint rounded-corner-md p-3 flex flex-col gap-2">
            <p className="text-label-sm font-semibold text-text-primary">Detail Buket</p>
            <p className="text-label-sm text-text-secondary">Ukuran: {size?.label} — {size?.stems}</p>
            {order.customization.selectedAddonIds.length > 0 && (
              <p className="text-label-sm text-text-secondary">
                Tambahan: {order.customization.selectedAddonIds.map((id) => order.product.addons.find((a) => a.id === id)?.label).filter(Boolean).join(", ")}
              </p>
            )}
            {order.customization.description && (
              <div>
                <p className="text-video-title text-text-tertiary">Permintaan khusus:</p>
                <p className="text-label-sm text-text-primary">{order.customization.description}</p>
              </div>
            )}
            {(order.customization.referenceImagePreview || order.paymentProofPreview) && (
              <div className="flex gap-3 flex-wrap pt-1">
                {order.customization.referenceImagePreview && (
                  <div>
                    <p className="text-video-title text-text-tertiary mb-1">Referensi</p>
                    <a href={order.customization.referenceImagePreview} target="_blank" rel="noreferrer">
                      <img src={order.customization.referenceImagePreview} alt="Referensi" className="rounded-corner-md object-cover" style={{ width: "80px", height: "80px" }} />
                    </a>
                  </div>
                )}
                {order.paymentProofPreview && (
                  <div>
                    <p className="text-video-title text-text-tertiary mb-1">Bukti Bayar</p>
                    <a href={order.paymentProofPreview} target="_blank" rel="noreferrer">
                      <img src={order.paymentProofPreview} alt="Bukti bayar" className="rounded-corner-md object-cover" style={{ width: "80px", height: "80px" }} />
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-label-sm font-semibold text-text-primary">Ubah Status</p>
            <div className="flex flex-wrap items-center gap-2">
              {nextStatus && (
                <Button variant="primary" size="small" iconEnd={<ArrowRight size={14} />} disabled={updating} onClick={() => setStatus(nextStatus)}>
                  {updating ? "Menyimpan…" : `Majukan ke "${STATUS_CFG[nextStatus].label}"`}
                </Button>
              )}
              {STATUS_FLOW.map((s) => (
                <Button
                  key={s}
                  variant={s === order.status ? "neutral" : "subtle"}
                  size="small"
                  disabled={updating || s === order.status}
                  iconStart={s === order.status ? <Check size={14} /> : undefined}
                  onClick={() => setStatus(s)}
                  className={s === order.status ? "text-brand-primary" : ""}
                >
                  {STATUS_CFG[s].label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");

  useEffect(() => {
    let active = true;
    listOrders()
      .then((list) => active && setOrders(list))
      .catch((e) => {
        console.error("Failed to load orders:", e);
        if (active) setError(e instanceof Error ? e.message : "Gagal memuat pesanan");
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const handleChange = (updated: Order) =>
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));

  if (loading) return <Loading label="Memuat pesanan…" />;

  const counts = STATUS_FLOW.reduce(
    (acc, s) => { acc[s] = orders.filter((o) => o.status === s).length; return acc; },
    {} as Record<OrderStatus, number>,
  );
  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-4">
        <h1 className="text-title text-text-primary">Kelola Pesanan</h1>
        <p className="text-label-sm text-text-secondary mt-1">{orders.length} total pesanan</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Button variant={filter === "all" ? "neutral" : "subtle"} size="small" onClick={() => setFilter("all")} className={filter === "all" ? "text-brand-primary" : ""}>
          Semua ({orders.length})
        </Button>
        {STATUS_FLOW.map((s) => (
          <Button key={s} variant={filter === s ? "neutral" : "subtle"} size="small" onClick={() => setFilter(s)} className={filter === s ? "text-brand-primary" : ""}>
            {STATUS_CFG[s].label} ({counts[s]})
          </Button>
        ))}
      </div>

      {error && <p className="text-label-sm text-[var(--status-danger)] mb-3">{error}</p>}

      {filtered.length === 0 ? (
        <div className="bg-surface-bg rounded-corner-lg p-8 text-center">
          <p style={{ fontSize: "40px", lineHeight: "1" }}>📭</p>
          <p className="text-label-sm text-text-secondary mt-2">Belum ada pesanan pada kategori ini.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((order) => (
            <OrderRow key={order.id} order={order} onChange={handleChange} />
          ))}
        </div>
      )}
    </div>
  );
}
