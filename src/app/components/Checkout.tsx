import { useState, useRef } from "react";
import { Button } from "./ui/Button";
import { InputField } from "./ui/InputField";
import { TextareaField } from "./ui/TextareaField";
import { RadioGroup } from "./ui/RadioGroup";
import { ArrowLeft, Upload, X, Shield, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import type { Product, Customization, PaymentMethod } from "./types";

export interface CheckoutPayload {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  paymentMethod: string;
  paymentProofBase64: string | null;
}

interface CheckoutProps {
  product: Product;
  customization: Customization;
  paymentMethods: PaymentMethod[];
  onBack: () => void;
  onPlaceOrder: (payload: CheckoutPayload) => Promise<void>;
  defaultName?: string;
}

export function Checkout({ product, customization, paymentMethods, onBack, onPlaceOrder, defaultName }: CheckoutProps) {
  const PAYMENT_OPTIONS = paymentMethods.map((m) => ({ value: m.id, label: m.label, description: m.detail }));
  const [name, setName] = useState(defaultName ?? '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedSize = product.sizes.find((s) => s.id === customization.sizeId)!;
  const addonTotal = customization.selectedAddonIds.reduce((sum, id) => {
    const addon = product.addons.find((a) => a.id === id);
    return sum + (addon?.price ?? 0);
  }, 0);
  const flowerPrice = Math.round(product.basePrice * selectedSize.priceMultiplier);
  const totalPrice = flowerPrice + addonTotal;

  const selectedPayment = paymentMethods.find((m) => m.id === paymentMethodId);
  const needsProof = selectedPayment?.needsProof ?? false;
  const isValid = name.trim() && phone.trim() && address.trim() && paymentMethodId && (!needsProof || paymentProofPreview);

  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPaymentProofPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleCopy = () => {
    if (!selectedPayment) return;
    // Ambil nomor rekening dari detail (misal: "BCA 123456789 a/n Faedah Shop")
    // Bersihkan untuk mendapatkan angkanya saja atau salin teks penuh
    const textToCopy = selectedPayment.detail;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSubmit = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await onPlaceOrder({
        customerName: name.trim(),
        customerPhone: phone.trim(),
        customerAddress: address.trim(),
        paymentMethod: paymentMethodId,
        paymentProofBase64: paymentProofPreview,
      });
      // Pemicu konfeti selebrasi sukses memesan!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.5 },
      });
    } catch (e) {
      console.error('Failed to place order:', e);
      setError(e instanceof Error ? e.message : 'Gagal membuat pesanan. Coba lagi.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-tertiary font-sans pb-12">
      <div className="max-w-4xl mx-auto p-6">
        <Button variant="subtle" iconStart={<ArrowLeft size={16} />} onClick={onBack} className="mb-4">
          Kembali ke Kustomisasi
        </Button>

        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-title text-text-primary mb-4"
        >
          Konfirmasi &amp; Pembayaran
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 18 }}
            className="lg:col-span-2 flex flex-col gap-4"
          >
            <div className="bg-surface-bg rounded-corner-lg p-4 shadow-sm flex flex-col gap-3">
              <h3 className="text-label font-semibold text-text-primary">Data Pemesan</h3>
              <InputField label="Nama Lengkap" placeholder="Masukkan nama lengkap" value={name} onChange={setName} />
              <InputField label="Nomor WhatsApp" placeholder="08xxxxxxxxxx" value={phone} onChange={setPhone} />
              <TextareaField
                label="Alamat Pengiriman"
                description="Sertakan nama jalan, nomor rumah, kelurahan, kecamatan, kota, dan kode pos"
                placeholder="Alamat lengkap pengiriman..."
                value={address} rows={3} onChange={setAddress}
              />
            </div>

            <div className="bg-surface-bg rounded-corner-lg p-4 shadow-sm flex flex-col gap-3">
              <h3 className="text-label font-semibold text-text-primary">Metode Pembayaran</h3>
              <RadioGroup
                options={PAYMENT_OPTIONS}
                value={paymentMethodId}
                onChange={(val) => { setPaymentMethodId(val); setPaymentProofPreview(null); }}
              />

              <AnimatePresence>
                {selectedPayment && needsProof && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ type: "spring", stiffness: 120, damping: 16 }}
                    className="overflow-hidden flex flex-col gap-3 border-t border-border-secondary pt-3 mt-1"
                  >
                    <div className="bg-bg-faint rounded-corner-md p-3 flex items-start justify-between gap-2 border border-border-primary">
                      <div className="flex items-start gap-2">
                        <Shield className="w-4 h-4 text-brand-primary flex-shrink-0 mt-1" />
                        <div>
                          <p className="text-label-sm text-text-secondary">
                            Transfer sebesar{' '}
                            <span className="text-brand-primary font-semibold">
                              Rp {totalPrice.toLocaleString('id-ID')}
                            </span>{' '}
                            ke:
                          </p>
                          <p className="text-label-sm text-text-primary font-mono mt-1 font-semibold">
                            {selectedPayment.detail}
                          </p>
                        </div>
                      </div>
                      
                      {/* Tombol Salin */}
                      <button 
                        onClick={handleCopy}
                        className="bg-surface-bg border border-border-primary rounded-corner-md p-1.5 hover:bg-bg-hover text-text-secondary cursor-pointer transition-all flex items-center justify-center"
                        title="Salin Nomor Rekening"
                      >
                        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    <div>
                      <p className="text-label font-semibold text-text-primary mb-2">
                        Upload Bukti Pembayaran <span className="text-brand-primary">*</span>
                      </p>
                      {paymentProofPreview ? (
                        <div className="relative rounded-corner-md overflow-hidden shadow-sm" style={{ height: '140px' }}>
                          <img src={paymentProofPreview} alt="Bukti pembayaran" className="w-full h-full object-cover" />
                          <Button
                            variant="neutral" size="small" iconStart={<X size={14} />}
                            onClick={() => { setPaymentProofPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                            className="absolute top-2 right-2"
                          />
                        </div>
                      ) : (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full border-2 border-dashed border-border-primary hover:border-border-selected hover:bg-bg-hover rounded-corner-md py-6 flex flex-col items-center gap-2 transition-colors cursor-pointer"
                        >
                          <div className="w-9 h-9 rounded-corner-full bg-bg-faint flex items-center justify-center">
                            <Upload className="w-4 h-4 text-text-tertiary" />
                          </div>
                          <div className="text-center">
                            <p className="text-label-sm text-text-secondary">Klik untuk upload bukti transfer</p>
                            <p className="text-video-title text-text-tertiary mt-1">JPG, PNG, PDF (Maks. 5MB)</p>
                          </div>
                        </button>
                      )}
                      <input ref={fileInputRef} type="file" accept="image/*,.pdf" onChange={handleProofUpload} className="hidden" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 18 }}
          >
            <div className="bg-surface-bg rounded-corner-lg p-4 flex flex-col gap-3 lg:sticky lg:top-24 shadow-sm">
              <h4 className="text-label font-semibold text-text-primary">Ringkasan Pesanan</h4>
              <div className="rounded-corner-md overflow-hidden shadow-sm" style={{ height: '130px' }}>
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-label font-semibold text-text-primary">{product.name}</p>
                <p className="text-label-sm text-text-secondary">{selectedSize.label} — {selectedSize.stems}</p>
                {customization.selectedAddonIds.length > 0 && (
                  <div className="mt-1">
                    {customization.selectedAddonIds.map((id) => {
                      const addon = product.addons.find((a) => a.id === id)!;
                      return <p key={id} className="text-video-title text-text-tertiary">+ {addon.label}</p>;
                    })}
                  </div>
                )}
                {customization.description && (
                  <div className="bg-bg-faint rounded-corner-sm p-1.5 mt-1 border border-border-secondary/40">
                    <p className="text-video-title text-text-tertiary">Permintaan khusus:</p>
                    <p className="text-video-title text-text-secondary whitespace-pre-wrap leading-tight mt-0.5">
                      {customization.description.length > 100 ? `${customization.description.slice(0, 100)}...` : customization.description}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="bg-bg-faint rounded-corner-md p-3 flex flex-col gap-1.5 border border-border-secondary/30">
                <div className="flex justify-between">
                  <p className="text-label-sm text-text-secondary">Harga bunga</p>
                  <p className="text-label-sm text-text-primary">Rp {flowerPrice.toLocaleString('id-ID')}</p>
                </div>
                {addonTotal > 0 && (
                  <div className="flex justify-between">
                    <p className="text-label-sm text-text-secondary">Tambahan</p>
                    <p className="text-label-sm text-text-secondary">+Rp {addonTotal.toLocaleString('id-ID')}</p>
                  </div>
                )}
                <div className="border-t border-border-secondary pt-1.5 flex justify-between">
                  <p className="text-label font-semibold text-text-primary">Total</p>
                  <p className="text-label font-semibold text-brand-primary">Rp {totalPrice.toLocaleString('id-ID')}</p>
                </div>
              </div>

              <Button variant="primary" onClick={handleSubmit} disabled={!isValid || submitting} className="w-full shadow-sm">
                {submitting ? 'Memproses…' : '🌸 Buat Pesanan'}
              </Button>
              {error && (
                <p className="text-video-title text-[var(--status-danger)] text-center font-medium">{error}</p>
              )}
              {!isValid && !error && (
                <p className="text-video-title text-text-tertiary text-center">Lengkapi semua data yang diperlukan</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
