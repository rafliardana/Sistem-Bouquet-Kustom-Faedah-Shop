import { useState, useRef } from "react";
import { Button } from "./ui/Button";
import { RadioGroup } from "./ui/RadioGroup";
import { Checkbox } from "./ui/Checkbox";
import { TextareaField } from "./ui/TextareaField";
import { ArrowLeft, ArrowRight, Upload, X, Info, Gift } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { Product, Customization } from "./types";

interface ProductCustomizerProps {
  product: Product;
  onBack: () => void;
  onNext: (customization: Customization) => void;
}

const CARD_THEMES = [
  { id: "None", label: "Tanpa Kartu Ucapan", bg: "bg-bg-faint", text: "text-text-secondary" },
  { id: "Ulang Tahun 🎂", label: "Ulang Tahun 🎂", bg: "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)", text: "text-slate-800" },
  { id: "Wisuda 🎓", label: "Wisuda 🎓", bg: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)", text: "text-white" },
  { id: "Kasih Sayang 💖", label: "Kasih Sayang 💖", bg: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)", text: "text-rose-950" },
  { id: "Terima Kasih 🌸", label: "Terima Kasih 🌸", bg: "linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)", text: "text-green-950" },
];

export function ProductCustomizer({ product, onBack, onNext }: ProductCustomizerProps) {
  const [sizeId, setSizeId] = useState(product.sizes[0].id);
  const [referenceImagePreview, setReferenceImagePreview] = useState<string | null>(null);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [cardTheme, setCardTheme] = useState("None");
  const [cardMessage, setCardMessage] = useState("");
  const [customNotes, setCustomNotes] = useState("");
  
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

  const handleProceed = () => {
    // Gabungkan info kartu ucapan & catatan khusus ke dalam deskripsi tunggal
    const formattedDescription = cardTheme !== "None"
      ? `[KARTU: ${cardTheme}]\nPesan: "${cardMessage}"\n\nCatatan Tambahan: ${customNotes}`.trim()
      : customNotes.trim();

    onNext({
      sizeId,
      description: formattedDescription,
      referenceImagePreview,
      selectedAddonIds,
    });
  };

  const activeThemeObj = CARD_THEMES.find(t => t.id === cardTheme);

  return (
    <div className="min-h-screen bg-brand-tertiary font-sans pb-12">
      <div className="max-w-5xl mx-auto p-6">
        <Button variant="subtle" iconStart={<ArrowLeft size={16} />} onClick={onBack} className="mb-4">
          Kembali ke Katalog
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left: Product Image & Size Visualizer */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 18 }}
            className="flex flex-col gap-4"
          >
            <div className="bg-surface-bg rounded-corner-lg overflow-hidden shadow-sm" style={{ height: '380px' }}>
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>

            {/* Perbandingan Ukuran Interaktif */}
            <div className="bg-surface-bg rounded-corner-lg p-4 shadow-sm">
              <h4 className="text-label font-semibold text-text-primary mb-2 flex items-center gap-1.5">
                <span>📏</span> Visualisasi Ukuran Buket
              </h4>
              <div className="flex justify-around items-end h-28 border-b border-border-secondary pb-1">
                {(() => {
                  // Normalisasi tinggi antara minH–maxH agar tidak overflow container
                  const multipliers = product.sizes.map(s => s.priceMultiplier);
                  const minM = Math.min(...multipliers);
                  const maxM = Math.max(...multipliers);
                  const minH = 24;
                  const maxH = 88; // sedikit di bawah h-28 (112px) agar ada ruang
                  return product.sizes.map((s) => {
                    const isActive = s.id === sizeId;
                    const ratio = maxM === minM ? 0.5 : (s.priceMultiplier - minM) / (maxM - minM);
                    const height = Math.round(minH + ratio * (maxH - minH));
                    const width = Math.round(height * 0.65);
                    return (
                      <div 
                        key={s.id} 
                        onClick={() => setSizeId(s.id)}
                        className="flex flex-col items-center gap-2 cursor-pointer group"
                      >
                        <motion.div
                          animate={{
                            scale: isActive ? 1.1 : 1,
                            backgroundColor: isActive ? 'var(--brand-primary)' : 'var(--bg-faint)',
                          }}
                          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                          style={{ height: `${height}px`, width: `${width}px`, minWidth: '18px' }}
                          className="rounded-t-full transition-shadow duration-300 group-hover:shadow-md flex items-end justify-center pb-1 text-[9px] text-on-brand font-bold"
                        >
                          {isActive && s.id}
                        </motion.div>
                        <span className={`text-video-title ${isActive ? 'font-bold text-brand-primary' : 'text-text-tertiary'}`}>
                          {s.label}
                        </span>
                      </div>
                    );
                  });
                })()}
              </div>
              <p className="text-video-title text-text-secondary mt-2 text-center">
                Ukuran terpilih: <span className="font-semibold">{selectedSize.label}</span> ({selectedSize.stems})
              </p>
            </div>

            <div className="bg-surface-bg rounded-corner-lg p-4 flex items-start gap-2 shadow-sm">
              <Info className="w-4 h-4 text-text-tertiary mt-1 flex-shrink-0" />
              <p className="text-label-sm text-text-secondary">
                Setiap buket dikerjakan oleh florist profesional kami. Hasil akhir mungkin sedikit berbeda tergantung ketersediaan bunga segar.
              </p>
            </div>
          </motion.div>

          {/* Right: Customization Form */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 18 }}
            className="flex flex-col gap-4"
          >
            <div className="bg-surface-bg rounded-corner-lg p-4 shadow-sm">
              <p className="text-video-title text-brand-primary mb-1">{product.category}</p>
              <h1 className="text-title text-text-primary">{product.name}</h1>
              <p className="text-label-sm text-text-secondary mt-1">{product.description}</p>
            </div>

            <div className="bg-surface-bg rounded-corner-lg p-4 shadow-sm">
              <h4 className="text-label font-semibold text-text-primary mb-3">Pilih Ukuran</h4>
              <RadioGroup options={sizeOptions} value={sizeId} onChange={(val) => setSizeId(val)} />
            </div>

            <div className="bg-surface-bg rounded-corner-lg p-4 shadow-sm">
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

            {/* Visual Greeting Card Designer */}
            <div className="bg-surface-bg rounded-corner-lg p-4 shadow-sm flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-brand-primary" />
                <h4 className="text-label font-semibold text-text-primary">Desain Kartu Ucapan Digital</h4>
              </div>
              <p className="text-label-sm text-text-secondary">
                Pilih tema kartu ucapan dan ketik pesan spesial untuk penerima bouquet.
              </p>
              
              {/* Pilihan Tema Kartu */}
              <div className="flex flex-wrap gap-2 mt-1">
                {CARD_THEMES.map((theme) => {
                  const isThemeActive = cardTheme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => setCardTheme(theme.id)}
                      className={`px-3 py-1.5 text-video-title font-medium rounded-corner-md transition-all cursor-pointer ${
                        isThemeActive
                          ? "bg-brand-primary text-on-brand shadow-sm scale-105"
                          : "bg-bg-faint text-text-secondary hover:bg-bg-hover"
                      }`}
                    >
                      {theme.label}
                    </button>
                  );
                })}
              </div>

              {/* Editor Pesan & Preview Kartu */}
              <AnimatePresence>
                {cardTheme !== "None" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ type: "spring", stiffness: 120, damping: 16 }}
                    className="overflow-hidden flex flex-col gap-3"
                  >
                    <input
                      type="text"
                      placeholder="Tulis pesan singkat Anda di sini..."
                      value={cardMessage}
                      onChange={(e) => setCardMessage(e.target.value)}
                      maxLength={150}
                      className="w-full bg-input-bg border border-border-primary rounded-corner-md px-3 py-2 text-input text-text-primary focus:outline-none focus:border-border-selected focus:ring-1 focus:ring-brand-primary/20 transition-all"
                    />
                    
                    {/* Live Preview Card */}
                    <div 
                      className="rounded-corner-md p-6 shadow-inner text-center flex flex-col items-center justify-center relative min-h-[130px] border border-border-primary"
                      style={{ 
                        background: activeThemeObj?.bg, 
                        backgroundSize: 'cover'
                      }}
                    >
                      <div className="absolute top-2 left-2 text-[10px] uppercase font-bold tracking-wider opacity-60">
                        Preview Kartu Ucapan
                      </div>
                      <p 
                        className={`text-base font-medium italic mt-2 max-w-[80%] whitespace-pre-wrap leading-relaxed ${activeThemeObj?.text}`}
                        style={{ fontFamily: "'Georgia', serif" }}
                      >
                        {cardMessage ? `"${cardMessage}"` : "Ketik pesan Anda di atas..."}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="bg-surface-bg rounded-corner-lg p-4 shadow-sm">
              <TextareaField
                label="Catatan / Permintaan Khusus"
                description="Preferensi warna kertas wrap, tema warna bunga, atau instruksi pengiriman khusus"
                placeholder="Contoh: Kertas pembungkus warna pastel pink, tambahkan pita satin putih besar..."
                value={customNotes}
                rows={3}
                onChange={(val) => setCustomNotes(val)}
              />
            </div>

            <div className="bg-surface-bg rounded-corner-lg p-4 shadow-sm">
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

            <div className="bg-surface-bg rounded-corner-lg p-4 shadow-sm">
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
                  
                  {/* Animasi Transisi Angka Total Harga */}
                  <motion.p 
                    key={totalPrice}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="text-label font-semibold text-brand-primary"
                  >
                    Rp {totalPrice.toLocaleString('id-ID')}
                  </motion.p>
                </div>
              </div>
              <div className="mt-3">
                <Button
                  variant="primary"
                  iconEnd={<ArrowRight size={16} />}
                  onClick={handleProceed}
                  className="w-full shadow-sm"
                >
                  Lanjut ke Pembayaran
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

