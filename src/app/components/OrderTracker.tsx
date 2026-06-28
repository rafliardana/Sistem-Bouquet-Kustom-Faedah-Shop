import { useState } from "react";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { Clock, Package, CheckCircle, Star, ChevronDown, ChevronUp, MapPin, Phone, User, CreditCard, FlaskConical } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { Order, OrderStatus } from "./types";

const STATUS_STEPS: { id: OrderStatus; label: string; description: string; icon: React.ReactNode }[] = [
  { id: 'menunggu_konfirmasi', label: 'Menunggu Konfirmasi', description: 'Pesananmu sedang ditinjau oleh tim kami', icon: <Clock className="w-3.5 h-3.5" /> },
  { id: 'dalam_proses',        label: 'Dalam Proses',        description: 'Florist kami sedang merangkai buketmu dengan penuh cinta', icon: <Package className="w-3.5 h-3.5" /> },
  { id: 'pesanan_siap',        label: 'Pesanan Siap',        description: 'Buketmu sudah siap — menunggu pengiriman atau pengambilan', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  { id: 'selesai',             label: 'Selesai',             description: 'Pesanan telah selesai. Terima kasih sudah memesan! 🌸', icon: <Star className="w-3.5 h-3.5" /> },
];

const STATUS_BADGE: Record<OrderStatus, { variant: "default" | "success" | "warning" | "danger" | "brand" | "secondary"; label: string }> = {
  menunggu_konfirmasi: { variant: 'warning', label: 'Menunggu Konfirmasi' },
  dalam_proses:        { variant: 'brand',   label: 'Dalam Proses' },
  pesanan_siap:        { variant: 'success', label: 'Pesanan Siap' },
  selesai:             { variant: 'default', label: 'Selesai' },
};

const PAYMENT_LABELS: Record<string, string> = {
  transfer_bca: 'Transfer BCA', transfer_mandiri: 'Transfer Mandiri',
  gopay: 'GoPay', ovo: 'OVO', cod: 'COD (Bayar di Tempat)',
};

function getStatusIndex(status: OrderStatus) {
  return STATUS_STEPS.findIndex((s) => s.id === status);
}

function OrderCard({ order, isNew, onAdvanceStatus }: { order: Order; isNew?: boolean; onAdvanceStatus?: (id: string) => void }) {
  const [expanded, setExpanded] = useState(isNew ?? false);
  const currentIndex = getStatusIndex(order.status);
  const statusCfg = STATUS_BADGE[order.status];
  const selectedSize = order.product.sizes.find((s) => s.id === order.customization.sizeId);

  return (
    <motion.div 
      layout
      className={`bg-surface-bg rounded-corner-lg overflow-hidden shadow-sm border border-border-secondary ${isNew ? 'border-2 border-brand-primary' : ''}`}
    >
      {isNew && (
        <div className="bg-brand-primary px-4 py-1.5 text-center">
          <p className="text-label-sm text-on-brand">🎉 Pesanan berhasil dibuat! Tim kami akan segera menghubungimu.</p>
        </div>
      )}

      <div className="p-4 flex items-start justify-between gap-2">
        <div className="flex gap-2">
          <div className="rounded-corner-md overflow-hidden flex-shrink-0" style={{ width: '60px', height: '60px' }}>
            <img src={order.product.image} alt={order.product.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-label font-semibold text-text-primary">{order.product.name}</p>
              <Badge label={statusCfg.label} variant={statusCfg.variant} />
            </div>
            <p className="text-video-title text-text-tertiary">
              {order.orderNumber}  •  {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <p className="text-label-sm font-semibold text-brand-primary">Rp {order.totalPrice.toLocaleString('id-ID')}</p>
          </div>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="text-text-tertiary hover:text-text-secondary transition-colors flex-shrink-0 p-1 cursor-pointer">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 16 }}
            className="border-t border-border-secondary px-4 pb-4 flex flex-col gap-4 overflow-hidden"
          >
            {/* Timeline */}
            <div className="pt-4">
              <p className="text-label-sm font-semibold text-text-primary mb-3">Status Pesanan</p>
              <div className="relative pl-8">
                {/* Background timeline line */}
                <div className="absolute left-3 top-2 bottom-2 w-px bg-border-primary" />
                
                {/* Animated progress timeline line */}
                <motion.div
                  className="absolute left-3 top-2 w-px bg-brand-primary"
                  initial={{ height: "0%" }}
                  animate={{ height: currentIndex === 0 ? "0%" : `${(currentIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                />
                
                <div className="flex flex-col gap-3">
                  {STATUS_STEPS.map((step, i) => {
                    const isDone = i <= currentIndex;
                    const isCurrent = i === currentIndex;
                    return (
                      <div key={step.id} className="flex items-start gap-2 relative">
                        <motion.div
                          className="w-6 h-6 rounded-corner-full flex items-center justify-center flex-shrink-0 absolute -left-8 transition-colors duration-300"
                          initial={{ scale: 0.8 }}
                          animate={{
                            scale: isCurrent ? [1, 1.15, 1] : 1,
                            backgroundColor: isDone ? 'var(--brand-primary)' : 'var(--bg-faint)',
                            color: isDone ? 'var(--on-brand)' : 'var(--text-tertiary)',
                            boxShadow: isCurrent ? '0 0 0 3px var(--brand-muted)' : 'none',
                          }}
                          transition={{
                            scale: isCurrent ? { repeat: Infinity, duration: 2.5, ease: "easeInOut" } : { duration: 0.3 }
                          }}
                        >
                          {step.icon}
                        </motion.div>
                        <div>
                          <p className={`text-label-sm ${isCurrent ? 'font-semibold text-text-primary' : isDone ? 'text-text-secondary' : 'text-text-tertiary'}`}>
                            {step.label}
                          </p>
                          <AnimatePresence>
                            {isCurrent && (
                              <motion.p 
                                initial={{ opacity: 0, y: -2 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="text-video-title text-text-tertiary mt-1"
                              >
                                {step.description}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="bg-bg-faint rounded-corner-md p-3 flex flex-col gap-3 border border-border-secondary/40">
              <p className="text-label-sm font-semibold text-text-primary">Detail Pesanan</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: <User className="w-4 h-4" />, label: 'Pemesan', value: order.customerName },
                  { icon: <Phone className="w-4 h-4" />, label: 'WhatsApp', value: order.customerPhone },
                ].map((row) => (
                  <div key={row.label} className="flex items-start gap-1.5">
                    <span className="text-text-tertiary mt-1 flex-shrink-0">{row.icon}</span>
                    <div>
                      <p className="text-video-title text-text-tertiary">{row.label}</p>
                      <p className="text-label-sm text-text-primary">{row.value}</p>
                    </div>
                  </div>
                ))}
                <div className="flex items-start gap-1.5 sm:col-span-2">
                  <MapPin className="w-4 h-4 text-text-tertiary mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-video-title text-text-tertiary">Alamat Pengiriman</p>
                    <p className="text-label-sm text-text-primary">{order.customerAddress}</p>
                  </div>
                </div>
                <div className="flex items-start gap-1.5">
                  <Package className="w-4 h-4 text-text-tertiary mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-video-title text-text-tertiary">Ukuran</p>
                    <p className="text-label-sm text-text-primary">{selectedSize?.label} — {selectedSize?.stems}</p>
                  </div>
                </div>
                <div className="flex items-start gap-1.5">
                  <CreditCard className="w-4 h-4 text-text-tertiary mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-video-title text-text-tertiary">Pembayaran</p>
                    <p className="text-label-sm text-text-primary">{order.paymentMethodLabel ?? PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</p>
                  </div>
                </div>
                {order.customization.selectedAddonIds.length > 0 && (
                  <div className="flex items-start gap-1.5 sm:col-span-2">
                    <Star className="w-4 h-4 text-text-tertiary mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-video-title text-text-tertiary">Tambahan</p>
                      <p className="text-label-sm text-text-primary">
                        {order.customization.selectedAddonIds.map((id) => order.product.addons.find((a) => a.id === id)?.label).filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {order.customization.description && (
                <div className="border-t border-border-secondary pt-3">
                  <p className="text-video-title text-text-tertiary mb-1">Permintaan Khusus</p>
                  <p className="text-label-sm text-text-primary whitespace-pre-wrap leading-tight">{order.customization.description}</p>
                </div>
              )}
              {(order.customization.referenceImagePreview || order.paymentProofPreview) && (
                <div className="flex gap-2 flex-wrap border-t border-border-secondary pt-3">
                  {order.customization.referenceImagePreview && (
                    <div>
                      <p className="text-video-title text-text-tertiary mb-1">Referensi</p>
                      <div className="rounded-corner-md overflow-hidden shadow-sm" style={{ width: '72px', height: '72px' }}>
                        <img src={order.customization.referenceImagePreview} alt="Referensi" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                  {order.paymentProofPreview && (
                    <div>
                      <p className="text-video-title text-text-tertiary mb-1">Bukti Bayar</p>
                      <div className="rounded-corner-md overflow-hidden shadow-sm" style={{ width: '72px', height: '72px' }}>
                        <img src={order.paymentProofPreview} alt="Bukti bayar" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {order.status !== 'selesai' && onAdvanceStatus && (
              <Button variant="subtle" size="small" iconStart={<FlaskConical size={14} />} onClick={() => onAdvanceStatus(order.id)}>
                [Demo] Simulasi Perubahan Status
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface OrderTrackerProps {
  orders: Order[];
  newOrderId?: string | null;
  onAdvanceStatus?: (id: string) => void;
}

export function OrderTracker({ orders, newOrderId, onAdvanceStatus }: OrderTrackerProps) {
  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-brand-tertiary font-sans flex items-center justify-center">
        <div className="bg-surface-bg rounded-corner-lg p-6 text-center max-w-sm w-full">
          <p style={{ fontSize: '48px', lineHeight: '1' }}>🌸</p>
          <h2 className="text-heading text-text-primary mt-3 mb-1">Belum Ada Pesanan</h2>
          <p className="text-label-sm text-text-secondary">
            Pesanan yang kamu buat akan muncul di sini beserta status terkininya.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-tertiary font-sans">
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-4">
          <h1 className="text-title text-text-primary">Pesanan Saya</h1>
          <p className="text-label-sm text-text-secondary mt-1">{orders.length} pesanan aktif</p>
        </div>
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} isNew={order.id === newOrderId} onAdvanceStatus={onAdvanceStatus} />
          ))}
        </div>
      </div>
    </div>
  );
}
