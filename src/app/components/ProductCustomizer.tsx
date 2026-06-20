import { useState, useRef } from "react";
import { Button } from "./ui/Button";
import { RadioGroup } from "./ui/RadioGroup";
import { Checkbox } from "./ui/Checkbox";
import { TextareaField } from "./ui/TextareaField";
import { ArrowLeft, ArrowRight, Upload, X, Info } from "lucide-react";
import type { Product, Customization } from "./types";

interface ProductCustomizerProps {
  product: Product;
  onBack: () => void;
  onNext: (customization: Customization) => void;
}

export function ProductCustomizer({ product, onBack, onNext }: ProductCustomizerProps) {
  const [sizeId, setSizeId] = useState(product.sizes[0].id);
  const [description, setDescription] = useState('');
  const [referenceImagePreview, setReferenceImagePreview] = useState<string | null>(null);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedSize = product.sizes.find((s) => s.id === sizeId)!;
  const addonTotal = selectedAddonIds.reduce((sum, id) => {
    const addon = product.addons.find((a) => a.id === id);
    return sum + (addon?.price ?? 0);
  }, 0);
  const flowerPrice = Math.round(product.basePrice * selectedSize.priceMultiplier);
  const totalPrice = flowerPrice + addonTotal;

  const sizeOptions = product.sizes.map((size) => ({
    value: size.id,
    label: size.label,
    description: `${size.stems}  •  Rp ${Math.round(product.basePrice * size.priceMultiplier).toLocaleString('id-ID')}`,
  }));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setReferenceImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const toggleAddon = (id: string, checked: boolean) => {
    setSelectedAddonIds((prev) =>
      checked ? [...prev, id] : prev.filter((a) => a !== id)
    );
  };

  return (
    <div className="min-h-screen bg-brand-tertiary font-sans">
      <div className="max-w-5xl mx-auto p-6">
        <Button variant="subtle" iconStart={<ArrowLeft size={16} />} onClick={onBack} className="mb-4">
          Kembali ke Katalog
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          {/* Left: Product Image */}
          <div className="flex flex-col gap-4">
            <div className="bg-surface-bg rounded-corner-lg overflow-hidden" style={{ height: '380px' }}>
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="bg-surface-bg rounded-corner-lg p-4 flex items-start gap-2">
              <Info className="w-4 h-4 text-text-tertiary mt-1 flex-shrink-0" />
              <p className="text-label-sm text-text-secondary">
                Setiap buket dikerjakan oleh florist profesional kami. Hasil akhir mungkin sedikit berbeda tergantung ketersediaan bunga segar.
              </p>
            </div>
          </div>

          {/* Right: Customization Form */}
          <div className="flex flex-col gap-4">
            <div className="bg-surface-bg rounded-corner-lg p-4">
              <p className="text-video-title text-brand-primary mb-1">{product.category}</p>
              <h1 className="text-title text-text-primary">{product.name}</h1>
              <p className="text-label-sm text-text-secondary mt-1">{product.description}</p>
            </div>

            <div className="bg-surface-bg rounded-corner-lg p-4">
              <h4 className="text-label font-semibold text-text-primary mb-3">Pilih Ukuran</h4>
              <RadioGroup options={sizeOptions} value={sizeId} onChange={(val) => setSizeId(val)} />
            </div>

            <div className="bg-surface-bg rounded-corner-lg p-4">
              <h4 className="text-label font-semibold text-text-primary mb-1">Tambahan Opsional</h4>
              <p className="text-label-sm text-text-secondary mb-3">
                Pilih satu atau lebih tambahan untuk melengkapi buketmu
              </p>
              <div className="flex flex-col gap-3">
                {product.addons.map((addon) => (
                  <Checkbox
                    key={addon.id}
                    label={addon.label}
                    description={`+Rp ${addon.price.toLocaleString('id-ID')}`}
                    defaultChecked={selectedAddonIds.includes(addon.id)}
                    onChange={(checked) => toggleAddon(addon.id, checked)}
                  />
                ))}
              </div>
            </div>

            <div className="bg-surface-bg rounded-corner-lg p-4">
              <TextareaField
                label="Deskripsi / Permintaan Khusus"
                description="Ceritakan preferensi warna, tema, atau pesan khusus yang ingin kamu sampaikan"
                placeholder="Contoh: Warna dominan pink dan putih, tambahkan baby's breath, untuk kado ulang tahun teman..."
                value={description}
                rows={4}
                onChange={(val) => setDescription(val)}
              />
            </div>

            <div className="bg-surface-bg rounded-corner-lg p-4">
              <p className="text-label font-semibold text-text-primary mb-1">Gambar Referensi</p>
              <p className="text-label-sm text-text-secondary mb-3">
                Upload foto inspirasi buketmu (opsional) — JPG, PNG, WEBP maks. 5MB
              </p>
              {referenceImagePreview ? (
                <div className="relative rounded-corner-md overflow-hidden" style={{ height: '160px' }}>
                  <img src={referenceImagePreview} alt="Referensi" className="w-full h-full object-cover" />
                  <Button
                    variant="neutral"
                    size="small"
                    iconStart={<X size={14} />}
                    onClick={() => { setReferenceImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    className="absolute top-2 right-2"
                  />
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-border-primary hover:border-border-selected hover:bg-bg-hover rounded-corner-md py-6 flex flex-col items-center gap-2 transition-colors cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-corner-full bg-bg-faint flex items-center justify-center">
                    <Upload className="w-5 h-5 text-text-tertiary" />
                  </div>
                  <div className="text-center">
                    <p className="text-label-sm text-text-secondary">Klik untuk upload gambar referensi</p>
                    <p className="text-video-title text-text-tertiary mt-1">JPG, PNG, WEBP (maks. 5MB)</p>
                  </div>
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </div>

            <div className="bg-surface-bg rounded-corner-lg p-4">
              <h4 className="text-label font-semibold text-text-primary mb-3">Rincian Harga</h4>
              <div className="bg-bg-faint rounded-corner-md p-3 flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <p className="text-label-sm text-text-secondary">
                    {product.name} ({selectedSize.label} — {selectedSize.stems})
                  </p>
                  <p className="text-label-sm text-text-primary">Rp {flowerPrice.toLocaleString('id-ID')}</p>
                </div>
                {selectedAddonIds.map((id) => {
                  const addon = product.addons.find((a) => a.id === id)!;
                  return (
                    <div key={id} className="flex justify-between">
                      <p className="text-label-sm text-text-secondary">+ {addon.label}</p>
                      <p className="text-label-sm text-text-secondary">Rp {addon.price.toLocaleString('id-ID')}</p>
                    </div>
                  );
                })}
                <div className="border-t border-border-secondary pt-1.5 flex justify-between">
                  <p className="text-label font-semibold text-text-primary">Total Estimasi</p>
                  <p className="text-label font-semibold text-brand-primary">
                    Rp {totalPrice.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <Button
                  variant="primary"
                  iconEnd={<ArrowRight size={16} />}
                  onClick={() => onNext({ sizeId, description, referenceImagePreview, selectedAddonIds })}
                  className="w-full"
                >
                  Lanjut ke Pembayaran
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
