import { useState, useRef } from "react";
import { Button } from "./ui/Button";
import { InputField } from "./ui/InputField";
import { TextareaField } from "./ui/TextareaField";
import { RadioGroup } from "./ui/RadioGroup";
import { ArrowLeft, Upload, X, Shield } from "lucide-react";
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
    } catch (e) {
      console.error('Failed to place order:', e);
      setError(e instanceof Error ? e.message : 'Gagal membuat pesanan. Coba lagi.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-tertiary font-sans">
      <div className="max-w-4xl mx-auto p-6">
        <Button variant="subtle" iconStart={<ArrowLeft size={16} />} onClick={onBack} className="mb-4">
          Kembali ke Kustomisasi
        </Button>

        <h1 className="text-title text-text-primary mb-4">Konfirmasi &amp; Pembayaran</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Form */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="bg-surface-bg rounded-corner-lg p-4 flex flex-col gap-3">
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

            <div className="bg-surface-bg rounded-corner-lg p-4 flex flex-col gap-3">
              <h3 className="text-label font-semibold text-text-primary">Metode Pembayaran</h3>
              <RadioGroup
                options={PAYMENT_OPTIONS}
                value={paymentMethodId}
                onChange={(val) => { setPaymentMethodId(val); setPaymentProofPreview(null); }}
              />

              {selectedPayment && needsProof && (
                <div className="flex flex-col gap-2">
                  <div className="bg-bg-faint rounded-corner-md p-3 flex items-start gap-2">
                    <Shield className="w-4 h-4 text-text-tertiary flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-label-sm text-text-secondary">
                        Transfer sebesar{' '}
                        <span className="text-brand-primary font-semibold">
                          Rp {totalPrice.toLocaleString('id-ID')}
                        </span>{' '}
                        ke:
                      </p>
                      <p className="text-label-sm text-text-primary mt-1">{selectedPayment.detail}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-label font-semibold text-text-primary mb-2">
                      Upload Bukti Pembayaran <span className="text-brand-primary">*</span>
                    </p>
                    {paymentProofPreview ? (
                      <div className="relative rounded-corner-md overflow-hidden" style={{ height: '140px' }}>
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
                        className="w-full border-2 border-dashed border-border-primary hover:border-border-selected hover:bg-bg-hover rounded-corner-md py-4 flex flex-col items-center gap-2 transition-colors cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-corner-full bg-bg-faint flex items-center justify-center">
                          <Upload className="w-4 h-4 text-text-tertiary" />
                        </div>
                        <div className="text-center">
                          <p className="text-label-sm text-text-secondary">Klik untuk upload bukti transfer</p>
                          <p className="text-video-title text-text-tertiary mt-1">JPG, PNG, PDF</p>
                        </div>
                      </button>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*,.pdf" onChange={handleProofUpload} className="hidden" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-surface-bg rounded-corner-lg p-4 flex flex-col gap-3 lg:sticky lg:top-24">
              <h4 className="text-label font-semibold text-text-primary">Ringkasan Pesanan</h4>
              <div className="rounded-corner-md overflow-hidden" style={{ height: '130px' }}>
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
                  <div className="bg-bg-faint rounded-corner-sm p-1.5 mt-1">
                    <p className="text-video-title text-text-tertiary">Permintaan khusus:</p>
                    <p className="text-video-title text-text-secondary">
                      {customization.description.length > 80 ? `${customization.description.slice(0, 80)}...` : customization.description}
                    </p>
                  </div>
                )}
              </div>
              <div className="bg-bg-faint rounded-corner-md p-3 flex flex-col gap-1.5">
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
              <Button variant="primary" onClick={handleSubmit} disabled={!isValid || submitting} className="w-full">
                {submitting ? 'Memproses…' : '🌸 Buat Pesanan'}
              </Button>
              {error && (
                <p className="text-video-title text-[var(--status-danger)] text-center">{error}</p>
              )}
              {!isValid && !error && (
                <p className="text-video-title text-text-tertiary text-center">Lengkapi semua data yang diperlukan</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
